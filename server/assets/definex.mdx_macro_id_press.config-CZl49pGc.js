import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/core-concepts/definex.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "The defineX Convention",
	"description": "Every app-facing construct in Kwiva is a defineX factory — one grammar, one mental model, and one file per construct across all 17 core factories."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\n## What is defineX? [#what-is-definex]\n\nThe `defineX` convention is Kwiva's unifying abstraction. Every application-facing construct — from models to controllers to pages to jobs — is defined through a `defineX` factory function. There is no mix of classes, decorators, and ad-hoc option objects. There is one pattern, repeated across 17 core primitives, and a smaller set of companion DSLs that follow the same grammar.\n\nThe convention exists to collapse the learning surface of the framework into a single idea:\n\n* A construct is authored by calling one function (`defineModel`, `defineController`, `defineJob`, ...).\n* The call lives in its own file at a conventional location.\n* The definition is plain data and functions — no classes, no decorators, no inheritance.\n* Every factory accepts an inline options object that overrides folder-level defaults.\n* Types flow automatically from the definition to every downstream consumer.\n\n## The Complete Surface [#the-complete-surface]\n\nThe authoritative list of core factories — these 17 are the full set of app-facing `defineX` entry points:\n\n| Factory             | Purpose                 | Package           |\n| ------------------- | ----------------------- | ----------------- |\n| `defineApp`         | Application composition | `@kwiva/core`     |\n| `defineConfig`      | Configuration modules   | `@kwiva/config`   |\n| `defineModel`       | Data models             | `@kwiva/data`     |\n| `defineController`  | HTTP controllers        | `@kwiva/http`     |\n| `defineMiddleware`  | Middleware              | `@kwiva/http`     |\n| `defineServerRoute` | Infrastructure routes   | `@kwiva/http`     |\n| `defineService`     | Services                | `@kwiva/services` |\n| `defineJob`         | Background jobs         | `@kwiva/queue`    |\n| `defineEvent`       | Events                  | `@kwiva/events`   |\n| `defineCommand`     | CLI commands            | `@kwiva/cli`      |\n| `defineTask`        | Scheduled tasks         | `@kwiva/http`     |\n| `definePage`        | Frontend pages          | `@kwiva/react`    |\n| `definePolicy`      | Authorization policies  | `@kwiva/core`     |\n| `defineAuth`        | Authentication          | `@kwiva/auth`     |\n| `definePlugin`      | Plugins                 | `@kwiva/core`     |\n| `defineModule`      | Modules                 | `@kwiva/core`     |\n| `defineMcpTool`     | MCP tools               | `@kwiva/mcp`      |\n\nBeyond the seventeen, companion DSLs extend the same grammar into specialized domains — `defineSeeder`, `defineFactory`, and `defineMigration` for `src/database/`, `defineGate` alongside `definePolicy`, and `defineStudioScreen` for Studio screens. They share every rule in this page: one construct per file, declarative definitions, inline options, and discovery by convention.\n\nEach factory maps to a home directory, which is how discovery knows what a file is:\n\n| Factory                         | Home                              | Files                      |\n| ------------------------------- | --------------------------------- | -------------------------- |\n| `defineApp`                     | `src/bootstrap/`                  | `app.ts`                   |\n| `defineConfig`                  | `kwiva.config.ts` + `src/config/` | one file per domain        |\n| `defineModel`                   | `src/app/models/`                 | `posts.ts`, `user.ts`      |\n| `defineController`              | `src/app/http/controllers/`       | `posts.ts`                 |\n| `defineMiddleware`              | `src/app/http/middleware/`        | `auth.ts`, `rate-limit.ts` |\n| `defineAuth`                    | `src/app/http/`                   | `auth.ts`                  |\n| `defineService`                 | `src/app/services/`               | `billing.ts`               |\n| `defineJob`                     | `src/app/jobs/`                   | `send-welcome.ts`          |\n| `defineEvent`                   | `src/app/events/`                 | `user-signed-up.ts`        |\n| `defineTask`                    | `src/app/tasks/`                  | `cleanup-sessions.ts`      |\n| `defineCommand`                 | `src/app/console/`                | `import-legacy.ts`         |\n| `defineServerRoute`             | `src/routes/`                     | `rules.ts`                 |\n| `definePage`                    | `src/ui/pages/`                   | `posts.$id.tsx`            |\n| `definePolicy`                  | `src/app/policies/`               | `post.ts`                  |\n| `defineModule` / `definePlugin` | packages                          | module entry               |\n\n## Convention Rules [#convention-rules]\n\n### One construct per file [#one-construct-per-file]\n\nEach `defineX` call lives in its own file, named after the construct it defines:\n\n```plaintext title=\"one-construct-per-file.txt\"\nsrc/app/models/posts.ts            → defineModel('posts', ...)\nsrc/app/http/controllers/posts.ts  → defineController('posts', ...)\nsrc/app/jobs/send-welcome.ts       → defineJob('send-welcome', ...)\nsrc/ui/pages/posts.$id.tsx         → definePage({ ... })\n```\n\n### Named by location [#named-by-location]\n\nThe file's directory determines what it is; the filename determines what it registers. No manual registration happens anywhere — a model file in `src/app/models/` is a model by virtue of being there. This is the backbone of [auto-discovery](/docs/core-concepts/auto-discovery).\n\n### Declarative, plain data [#declarative-plain-data]\n\n`defineX` calls are plain function calls returning serializable definitions. There are no decorators and no classes. Reading app code reads like a description of the product:\n\n```ts title=\"src/app/models/posts.ts\"\n// src/app/models/posts.ts\nimport { defineModel } from '@kwiva/data'\n\nexport default defineModel('posts', (f) => ({\n  id: f.id(),\n  title: f.string().validation((s) => s.min(1).max(200)),\n  body: f.text().optional(),\n  status: f.enum('draft', 'published').default('draft'),\n  author: f.belongsTo(() => User),\n  comments: f.hasMany(() => Comment),\n}), {\n  timestamps: true,\n  permission: 'posts',\n})\n```\n\nBecause definitions are plain data and functions, they are statically analyzable: the framework can generate an intermediate representation (IR), codemods can rewrite them, and lint rules can enforce conventions uniformly across every construct.\n\n### Type inference flows automatically [#type-inference-flows-automatically]\n\nTypes flow from a `defineX` definition through the entire stack:\n\n```plaintext title=\"type-inference-flows-automatically.txt\"\ndefineModel → defineController → @kwiva/client → definePage loader → data hooks\n```\n\nNo codegen, no manual type annotations, one type universe. A client call is checked against the model that produced the endpoint, not against a hand-maintained SDK. See [Type Inference](/docs/core-concepts/type-inference) for how this works.\n\n### Inline options override config [#inline-options-override-config]\n\nEvery `defineX` accepts full inline options, and inline values always win over config-folder values:\n\n```ts title=\"src/config/cache.ts\"\n// src/config/cache.ts declares a global cache TTL\n// but this model tunes it inline\nexport default defineModel('posts', (f) => ({ /* ... */ }), {\n  cache: { ttl: 120, tags: ['posts'] },   // overrides the folder default for posts only\n})\n```\n\nThe folder centralizes; inline tunes per construct. The precedence chain is documented in [Configuration](/docs/core-concepts/configuration).\n\n## File Naming Conventions [#file-naming-conventions]\n\n| File type   | Convention      | Example                      |\n| ----------- | --------------- | ---------------------------- |\n| Models      | `singular.ts`   | `post.ts`, `user.ts`         |\n| Controllers | `plural.ts`     | `posts.ts`, `users.ts`       |\n| Middleware  | `kebab-case.ts` | `auth.ts`, `rate-limit.ts`   |\n| Jobs        | `kebab-case.ts` | `send-welcome.ts`            |\n| Events      | `kebab-case.ts` | `user-signed-up.ts`          |\n| Policies    | `singular.ts`   | `post.ts`, `user.ts`         |\n| Pages       | `dot.route.tsx` | `posts.$id.tsx`, `index.tsx` |\n\nNames are lowercase throughout. Where a construct has no fixed singular or plural rule (middleware, jobs, events, tasks, commands), files use kebab-case. When a file exports named values — such as the composed app in `src/bootstrap/app.ts` — named exports follow PascalCase, while the `defineX` construct itself is the module's default export. The CLI generators enforce these rules, rejecting names that would fail the conventions later. See [Generators](/docs/cli/generators).\n\n## Inline Options: Full and Always Available [#inline-options-full-and-always-available]\n\nOptions are not a separate feature of one or two factories — they are part of the grammar:\n\n```ts title=\"inline-options-full-and-always-available.ts\"\nexport default defineController('reports', (c) => ({ /* ... */ }), {\n  prefix: '/reports',\n  cors: { origins: ['https://acme.dev'] },   // inline beats the folder\n})\n\nexport default defineJob('cleanup', handler, {\n  queue: 'maintenance',                      // routes to a queue declared in src/config/queue.ts\n  attempts: 3,\n})\n```\n\nThe rule of thumb: the folder defaults, inline tunes. Nothing is configured from a third place.\n\n## Why One Convention? [#why-one-convention]\n\nThe `defineX` convention exists because:\n\n1. **Consistency** — learn one pattern, apply it to every construct.\n2. **Discoverability** — every file type follows the same structure, so the scanner and humans agree.\n3. **Type safety** — types flow through the entire stack from a single source.\n4. **Tooling** — lint rules, generators, codemods, and IDE support target one pattern.\n5. **Readability** — app code reads like a product description.\n6. **Extensibility** — new constructs ship as `defineX` factories with a matching generator, so the grammar never diversifies.\n\n> \\[!TIP]\n> If you are unsure how a file should be authored, check the generators first: `kwiva make:*` always emits the convention-shaped stub for that construct.\n\n## What to Read Next [#what-to-read-next]\n\n* [Models](/docs/data/models) — `defineModel` deep dive\n* [Controllers](/docs/http/controllers) — `defineController` deep dive\n* [Pages](/docs/frontend/pages) — `definePage` deep dive\n* [Application Composition](/docs/core-concepts/applications) — how `defineApp` bootstraps everything\n* [Generators](/docs/cli/generators) — every `make:` command emits this grammar\n";
var structuredData = {
	"contents": [
		{
			"heading": "what-is-definex",
			"content": "The `defineX` convention is Kwiva's unifying abstraction. Every application-facing construct — from models to controllers to pages to jobs — is defined through a `defineX` factory function. There is no mix of classes, decorators, and ad-hoc option objects. There is one pattern, repeated across 17 core primitives, and a smaller set of companion DSLs that follow the same grammar."
		},
		{
			"heading": "what-is-definex",
			"content": "The convention exists to collapse the learning surface of the framework into a single idea:"
		},
		{
			"heading": "what-is-definex",
			"content": "A construct is authored by calling one function (`defineModel`, `defineController`, `defineJob`, ...)."
		},
		{
			"heading": "what-is-definex",
			"content": "The call lives in its own file at a conventional location."
		},
		{
			"heading": "what-is-definex",
			"content": "The definition is plain data and functions — no classes, no decorators, no inheritance."
		},
		{
			"heading": "what-is-definex",
			"content": "Every factory accepts an inline options object that overrides folder-level defaults."
		},
		{
			"heading": "what-is-definex",
			"content": "Types flow automatically from the definition to every downstream consumer."
		},
		{
			"heading": "the-complete-surface",
			"content": "The authoritative list of core factories — these 17 are the full set of app-facing `defineX` entry points:"
		},
		{
			"heading": "the-complete-surface",
			"content": "Factory"
		},
		{
			"heading": "the-complete-surface",
			"content": "Purpose"
		},
		{
			"heading": "the-complete-surface",
			"content": "Package"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineApp`"
		},
		{
			"heading": "the-complete-surface",
			"content": "Application composition"
		},
		{
			"heading": "the-complete-surface",
			"content": "`@kwiva/core`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineConfig`"
		},
		{
			"heading": "the-complete-surface",
			"content": "Configuration modules"
		},
		{
			"heading": "the-complete-surface",
			"content": "`@kwiva/config`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineModel`"
		},
		{
			"heading": "the-complete-surface",
			"content": "Data models"
		},
		{
			"heading": "the-complete-surface",
			"content": "`@kwiva/data`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineController`"
		},
		{
			"heading": "the-complete-surface",
			"content": "HTTP controllers"
		},
		{
			"heading": "the-complete-surface",
			"content": "`@kwiva/http`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineMiddleware`"
		},
		{
			"heading": "the-complete-surface",
			"content": "Middleware"
		},
		{
			"heading": "the-complete-surface",
			"content": "`@kwiva/http`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineServerRoute`"
		},
		{
			"heading": "the-complete-surface",
			"content": "Infrastructure routes"
		},
		{
			"heading": "the-complete-surface",
			"content": "`@kwiva/http`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineService`"
		},
		{
			"heading": "the-complete-surface",
			"content": "Services"
		},
		{
			"heading": "the-complete-surface",
			"content": "`@kwiva/services`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineJob`"
		},
		{
			"heading": "the-complete-surface",
			"content": "Background jobs"
		},
		{
			"heading": "the-complete-surface",
			"content": "`@kwiva/queue`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineEvent`"
		},
		{
			"heading": "the-complete-surface",
			"content": "Events"
		},
		{
			"heading": "the-complete-surface",
			"content": "`@kwiva/events`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineCommand`"
		},
		{
			"heading": "the-complete-surface",
			"content": "CLI commands"
		},
		{
			"heading": "the-complete-surface",
			"content": "`@kwiva/cli`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineTask`"
		},
		{
			"heading": "the-complete-surface",
			"content": "Scheduled tasks"
		},
		{
			"heading": "the-complete-surface",
			"content": "`@kwiva/http`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`definePage`"
		},
		{
			"heading": "the-complete-surface",
			"content": "Frontend pages"
		},
		{
			"heading": "the-complete-surface",
			"content": "`@kwiva/react`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`definePolicy`"
		},
		{
			"heading": "the-complete-surface",
			"content": "Authorization policies"
		},
		{
			"heading": "the-complete-surface",
			"content": "`@kwiva/core`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineAuth`"
		},
		{
			"heading": "the-complete-surface",
			"content": "Authentication"
		},
		{
			"heading": "the-complete-surface",
			"content": "`@kwiva/auth`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`definePlugin`"
		},
		{
			"heading": "the-complete-surface",
			"content": "Plugins"
		},
		{
			"heading": "the-complete-surface",
			"content": "`@kwiva/core`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineModule`"
		},
		{
			"heading": "the-complete-surface",
			"content": "Modules"
		},
		{
			"heading": "the-complete-surface",
			"content": "`@kwiva/core`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineMcpTool`"
		},
		{
			"heading": "the-complete-surface",
			"content": "MCP tools"
		},
		{
			"heading": "the-complete-surface",
			"content": "`@kwiva/mcp`"
		},
		{
			"heading": "the-complete-surface",
			"content": "Beyond the seventeen, companion DSLs extend the same grammar into specialized domains — `defineSeeder`, `defineFactory`, and `defineMigration` for `src/database/`, `defineGate` alongside `definePolicy`, and `defineStudioScreen` for Studio screens. They share every rule in this page: one construct per file, declarative definitions, inline options, and discovery by convention."
		},
		{
			"heading": "the-complete-surface",
			"content": "Each factory maps to a home directory, which is how discovery knows what a file is:"
		},
		{
			"heading": "the-complete-surface",
			"content": "Factory"
		},
		{
			"heading": "the-complete-surface",
			"content": "Home"
		},
		{
			"heading": "the-complete-surface",
			"content": "Files"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineApp`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`src/bootstrap/`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`app.ts`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineConfig`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`kwiva.config.ts` + `src/config/`"
		},
		{
			"heading": "the-complete-surface",
			"content": "one file per domain"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineModel`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`src/app/models/`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`posts.ts`, `user.ts`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineController`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`src/app/http/controllers/`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`posts.ts`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineMiddleware`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`src/app/http/middleware/`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`auth.ts`, `rate-limit.ts`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineAuth`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`src/app/http/`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`auth.ts`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineService`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`src/app/services/`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`billing.ts`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineJob`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`src/app/jobs/`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`send-welcome.ts`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineEvent`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`src/app/events/`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`user-signed-up.ts`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineTask`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`src/app/tasks/`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`cleanup-sessions.ts`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineCommand`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`src/app/console/`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`import-legacy.ts`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineServerRoute`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`src/routes/`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`rules.ts`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`definePage`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`src/ui/pages/`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`posts.$id.tsx`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`definePolicy`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`src/app/policies/`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`post.ts`"
		},
		{
			"heading": "the-complete-surface",
			"content": "`defineModule` / `definePlugin`"
		},
		{
			"heading": "the-complete-surface",
			"content": "packages"
		},
		{
			"heading": "the-complete-surface",
			"content": "module entry"
		},
		{
			"heading": "one-construct-per-file",
			"content": "Each `defineX` call lives in its own file, named after the construct it defines:"
		},
		{
			"heading": "named-by-location",
			"content": "The file's directory determines what it is; the filename determines what it registers. No manual registration happens anywhere — a model file in `src/app/models/` is a model by virtue of being there. This is the backbone of auto-discovery."
		},
		{
			"heading": "declarative-plain-data",
			"content": "`defineX` calls are plain function calls returning serializable definitions. There are no decorators and no classes. Reading app code reads like a description of the product:"
		},
		{
			"heading": "declarative-plain-data",
			"content": "Because definitions are plain data and functions, they are statically analyzable: the framework can generate an intermediate representation (IR), codemods can rewrite them, and lint rules can enforce conventions uniformly across every construct."
		},
		{
			"heading": "type-inference-flows-automatically",
			"content": "Types flow from a `defineX` definition through the entire stack:"
		},
		{
			"heading": "type-inference-flows-automatically",
			"content": "No codegen, no manual type annotations, one type universe. A client call is checked against the model that produced the endpoint, not against a hand-maintained SDK. See Type Inference for how this works."
		},
		{
			"heading": "inline-options-override-config",
			"content": "Every `defineX` accepts full inline options, and inline values always win over config-folder values:"
		},
		{
			"heading": "inline-options-override-config",
			"content": "The folder centralizes; inline tunes per construct. The precedence chain is documented in Configuration."
		},
		{
			"heading": "file-naming-conventions",
			"content": "File type"
		},
		{
			"heading": "file-naming-conventions",
			"content": "Convention"
		},
		{
			"heading": "file-naming-conventions",
			"content": "Example"
		},
		{
			"heading": "file-naming-conventions",
			"content": "Models"
		},
		{
			"heading": "file-naming-conventions",
			"content": "`singular.ts`"
		},
		{
			"heading": "file-naming-conventions",
			"content": "`post.ts`, `user.ts`"
		},
		{
			"heading": "file-naming-conventions",
			"content": "Controllers"
		},
		{
			"heading": "file-naming-conventions",
			"content": "`plural.ts`"
		},
		{
			"heading": "file-naming-conventions",
			"content": "`posts.ts`, `users.ts`"
		},
		{
			"heading": "file-naming-conventions",
			"content": "Middleware"
		},
		{
			"heading": "file-naming-conventions",
			"content": "`kebab-case.ts`"
		},
		{
			"heading": "file-naming-conventions",
			"content": "`auth.ts`, `rate-limit.ts`"
		},
		{
			"heading": "file-naming-conventions",
			"content": "Jobs"
		},
		{
			"heading": "file-naming-conventions",
			"content": "`kebab-case.ts`"
		},
		{
			"heading": "file-naming-conventions",
			"content": "`send-welcome.ts`"
		},
		{
			"heading": "file-naming-conventions",
			"content": "Events"
		},
		{
			"heading": "file-naming-conventions",
			"content": "`kebab-case.ts`"
		},
		{
			"heading": "file-naming-conventions",
			"content": "`user-signed-up.ts`"
		},
		{
			"heading": "file-naming-conventions",
			"content": "Policies"
		},
		{
			"heading": "file-naming-conventions",
			"content": "`singular.ts`"
		},
		{
			"heading": "file-naming-conventions",
			"content": "`post.ts`, `user.ts`"
		},
		{
			"heading": "file-naming-conventions",
			"content": "Pages"
		},
		{
			"heading": "file-naming-conventions",
			"content": "`dot.route.tsx`"
		},
		{
			"heading": "file-naming-conventions",
			"content": "`posts.$id.tsx`, `index.tsx`"
		},
		{
			"heading": "file-naming-conventions",
			"content": "Names are lowercase throughout. Where a construct has no fixed singular or plural rule (middleware, jobs, events, tasks, commands), files use kebab-case. When a file exports named values — such as the composed app in `src/bootstrap/app.ts` — named exports follow PascalCase, while the `defineX` construct itself is the module's default export. The CLI generators enforce these rules, rejecting names that would fail the conventions later. See Generators."
		},
		{
			"heading": "inline-options-full-and-always-available",
			"content": "Options are not a separate feature of one or two factories — they are part of the grammar:"
		},
		{
			"heading": "inline-options-full-and-always-available",
			"content": "The rule of thumb: the folder defaults, inline tunes. Nothing is configured from a third place."
		},
		{
			"heading": "why-one-convention",
			"content": "The `defineX` convention exists because:"
		},
		{
			"heading": "why-one-convention",
			"content": "**Consistency** — learn one pattern, apply it to every construct."
		},
		{
			"heading": "why-one-convention",
			"content": "**Discoverability** — every file type follows the same structure, so the scanner and humans agree."
		},
		{
			"heading": "why-one-convention",
			"content": "**Type safety** — types flow through the entire stack from a single source."
		},
		{
			"heading": "why-one-convention",
			"content": "**Tooling** — lint rules, generators, codemods, and IDE support target one pattern."
		},
		{
			"heading": "why-one-convention",
			"content": "**Readability** — app code reads like a product description."
		},
		{
			"heading": "why-one-convention",
			"content": "**Extensibility** — new constructs ship as `defineX` factories with a matching generator, so the grammar never diversifies."
		},
		{
			"heading": "why-one-convention",
			"content": "> \\[!TIP]\n> If you are unsure how a file should be authored, check the generators first: `kwiva make:*` always emits the convention-shaped stub for that construct."
		},
		{
			"heading": "what-to-read-next",
			"content": "Models — `defineModel` deep dive"
		},
		{
			"heading": "what-to-read-next",
			"content": "Controllers — `defineController` deep dive"
		},
		{
			"heading": "what-to-read-next",
			"content": "Pages — `definePage` deep dive"
		},
		{
			"heading": "what-to-read-next",
			"content": "Application Composition — how `defineApp` bootstraps everything"
		},
		{
			"heading": "what-to-read-next",
			"content": "Generators — every `make:` command emits this grammar"
		}
	],
	"headings": [
		{
			"id": "what-is-definex",
			"content": "What is defineX?"
		},
		{
			"id": "the-complete-surface",
			"content": "The Complete Surface"
		},
		{
			"id": "convention-rules",
			"content": "Convention Rules"
		},
		{
			"id": "one-construct-per-file",
			"content": "One construct per file"
		},
		{
			"id": "named-by-location",
			"content": "Named by location"
		},
		{
			"id": "declarative-plain-data",
			"content": "Declarative, plain data"
		},
		{
			"id": "type-inference-flows-automatically",
			"content": "Type inference flows automatically"
		},
		{
			"id": "inline-options-override-config",
			"content": "Inline options override config"
		},
		{
			"id": "file-naming-conventions",
			"content": "File Naming Conventions"
		},
		{
			"id": "inline-options-full-and-always-available",
			"content": "Inline Options: Full and Always Available"
		},
		{
			"id": "why-one-convention",
			"content": "Why One Convention?"
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
		url: "#what-is-definex",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What is defineX?" })
	},
	{
		depth: 2,
		url: "#the-complete-surface",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Complete Surface" })
	},
	{
		depth: 2,
		url: "#convention-rules",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Convention Rules" })
	},
	{
		depth: 3,
		url: "#one-construct-per-file",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "One construct per file" })
	},
	{
		depth: 3,
		url: "#named-by-location",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Named by location" })
	},
	{
		depth: 3,
		url: "#declarative-plain-data",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Declarative, plain data" })
	},
	{
		depth: 3,
		url: "#type-inference-flows-automatically",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Type inference flows automatically" })
	},
	{
		depth: 3,
		url: "#inline-options-override-config",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Inline options override config" })
	},
	{
		depth: 2,
		url: "#file-naming-conventions",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "File Naming Conventions" })
	},
	{
		depth: 2,
		url: "#inline-options-full-and-always-available",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Inline Options: Full and Always Available" })
	},
	{
		depth: 2,
		url: "#why-one-convention",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Why One Convention?" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-is-definex",
			children: "What is defineX?"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" convention is Kwiva's unifying abstraction. Every application-facing construct — from models to controllers to pages to jobs — is defined through a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" factory function. There is no mix of classes, decorators, and ad-hoc option objects. There is one pattern, repeated across 17 core primitives, and a smaller set of companion DSLs that follow the same grammar."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The convention exists to collapse the learning surface of the framework into a single idea:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"A construct is authored by calling one function (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineJob" }),
				", ...)."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The call lives in its own file at a conventional location." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The definition is plain data and functions — no classes, no decorators, no inheritance." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Every factory accepts an inline options object that overrides folder-level defaults." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Types flow automatically from the definition to every downstream consumer." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-complete-surface",
			children: "The Complete Surface"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The authoritative list of core factories — these 17 are the full set of app-facing ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" entry points:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Factory" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Package" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Application composition" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/core" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineConfig" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Configuration modules" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/config" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Data models" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/data" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "HTTP controllers" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineMiddleware" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Middleware" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineServerRoute" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Infrastructure routes" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineService" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Services" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/services" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineJob" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Background jobs" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/queue" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineEvent" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Events" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/events" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineCommand" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "CLI commands" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/cli" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineTask" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Scheduled tasks" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Frontend pages" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/react" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePolicy" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Authorization policies" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/core" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineAuth" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Authentication" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/auth" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePlugin" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Plugins" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/core" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Modules" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/core" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineMcpTool" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "MCP tools" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/mcp" }) })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Beyond the seventeen, companion DSLs extend the same grammar into specialized domains — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineSeeder" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineFactory" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineMigration" }),
			" for ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/database/" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineGate" }),
			" alongside ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePolicy" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineStudioScreen" }),
			" for Studio screens. They share every rule in this page: one construct per file, declarative definitions, inline options, and discovery by convention."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Each factory maps to a home directory, which is how discovery knows what a file is:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Factory" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Home" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Files" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/bootstrap/" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "app.ts" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineConfig" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }),
					" + ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "one file per domain" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/models/" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.ts" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "user.ts" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/controllers/" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.ts" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineMiddleware" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/middleware/" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "auth.ts" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "rate-limit.ts" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineAuth" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "auth.ts" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineService" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/services/" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "billing.ts" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineJob" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/jobs/" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "send-welcome.ts" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineEvent" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/events/" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "user-signed-up.ts" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineTask" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/tasks/" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cleanup-sessions.ts" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineCommand" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/console/" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "import-legacy.ts" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineServerRoute" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/routes/" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "rules.ts" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/ui/pages/" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.$id.tsx" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePolicy" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/policies/" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "post.ts" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModule" }),
					" / ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePlugin" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "packages" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "module entry" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "convention-rules",
			children: "Convention Rules"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "one-construct-per-file",
			children: "One construct per file"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Each ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" call lives in its own file, named after the construct it defines:"
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
			title: "one-construct-per-file.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/app/models/posts.ts            → defineModel('posts', ...)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/app/http/controllers/posts.ts  → defineController('posts', ...)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/app/jobs/send-welcome.ts       → defineJob('send-welcome', ...)" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/ui/pages/posts.$id.tsx         → definePage({ ... })" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "named-by-location",
			children: "Named by location"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The file's directory determines what it is; the filename determines what it registers. No manual registration happens anywhere — a model file in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/models/" }),
			" is a model by virtue of being there. This is the backbone of ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/auto-discovery",
				children: "auto-discovery"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "declarative-plain-data",
			children: "Declarative, plain data"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }), " calls are plain function calls returning serializable definitions. There are no decorators and no classes. Reading app code reads like a description of the product:"] }),
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  title: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "string"
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
							children: "validation"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "s"
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
							children: " s."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "min"
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "1"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "max"
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "200"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")),"
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
							children: "()."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "optional"
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
							children: "  status: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "enum"
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
							children: "'draft'"
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
							children: "'published'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "default"
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
							children: "'draft'"
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  comments: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "hasMany"
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
							children: " Comment),"
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
							children: "'posts'"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because definitions are plain data and functions, they are statically analyzable: the framework can generate an intermediate representation (IR), codemods can rewrite them, and lint rules can enforce conventions uniformly across every construct." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "type-inference-flows-automatically",
			children: "Type inference flows automatically"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Types flow from a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" definition through the entire stack:"
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
			title: "type-inference-flows-automatically.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
				className: "line",
				children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "defineModel → defineController → @kwiva/client → definePage loader → data hooks" })
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"No codegen, no manual type annotations, one type universe. A client call is checked against the model that produced the endpoint, not against a hand-maintained SDK. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/type-inference",
				children: "Type Inference"
			}),
			" for how this works."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "inline-options-override-config",
			children: "Inline options override config"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" accepts full inline options, and inline values always win over config-folder values:"
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
			title: "src/config/cache.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/config/cache.ts declares a global cache TTL"
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
						children: "// but this model tunes it inline"
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
							children: "] },   "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// overrides the folder default for posts only"
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
			"The folder centralizes; inline tunes per construct. The precedence chain is documented in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/configuration",
				children: "Configuration"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "file-naming-conventions",
			children: "File Naming Conventions"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "File type" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Convention" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Example" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Models" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "singular.ts" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "post.ts" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "user.ts" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Controllers" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "plural.ts" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.ts" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "users.ts" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Middleware" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kebab-case.ts" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "auth.ts" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "rate-limit.ts" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Jobs" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kebab-case.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "send-welcome.ts" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Events" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kebab-case.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "user-signed-up.ts" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Policies" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "singular.ts" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "post.ts" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "user.ts" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Pages" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "dot.route.tsx" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.$id.tsx" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "index.tsx" })
				] })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Names are lowercase throughout. Where a construct has no fixed singular or plural rule (middleware, jobs, events, tasks, commands), files use kebab-case. When a file exports named values — such as the composed app in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/bootstrap/app.ts" }),
			" — named exports follow PascalCase, while the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" construct itself is the module's default export. The CLI generators enforce these rules, rejecting names that would fail the conventions later. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/cli/generators",
				children: "Generators"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "inline-options-full-and-always-available",
			children: "Inline Options: Full and Always Available"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Options are not a separate feature of one or two factories — they are part of the grammar:" }),
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
			title: "inline-options-full-and-always-available.ts",
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
							children: "] },   "
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
							children: ",                      "
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The rule of thumb: the folder defaults, inline tunes. Nothing is configured from a third place." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "why-one-convention",
			children: "Why One Convention?"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" convention exists because:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Consistency" }), " — learn one pattern, apply it to every construct."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Discoverability" }), " — every file type follows the same structure, so the scanner and humans agree."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Type safety" }), " — types flow through the entire stack from a single source."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Tooling" }), " — lint rules, generators, codemods, and IDE support target one pattern."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Readability" }), " — app code reads like a product description."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Extensibility" }),
				" — new constructs ship as ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
				" factories with a matching generator, so the grammar never diversifies."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!TIP]\nIf you are unsure how a file should be authored, check the generators first: ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:*" }),
				" always emits the convention-shaped stub for that construct."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-to-read-next",
			children: "What to Read Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/data/models",
					children: "Models"
				}),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
				" deep dive"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/http/controllers",
					children: "Controllers"
				}),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }),
				" deep dive"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/frontend/pages",
					children: "Pages"
				}),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }),
				" deep dive"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/core-concepts/applications",
					children: "Application Composition"
				}),
				" — how ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }),
				" bootstraps everything"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/cli/generators",
					children: "Generators"
				}),
				" — every ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "make:" }),
				" command emits this grammar"
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
