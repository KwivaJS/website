import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/getting-started/project-structure.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Project Structure",
	"description": "Understand how a Kwiva project is organized — a predictable, lowercase filesystem where one directory maps to one construct and one file to one defineX factory."
};
var lastModified = /* @__PURE__ */ new Date(178896021e4);
var _markdown = "\n\nA Kwiva project follows a predictable, all-lowercase filesystem with a clear separation of concerns: one directory per concern, one `defineX` construct per file. Because the framework discovers files by convention, the directory layout *is* the registration mechanism — there is no central list of models, controllers, or pages to maintain.\n\n## Directory Layout [#directory-layout]\n\n<Files>\n  <File name=\"kwiva.config.ts\" />\n\n  <File name=\"package.json\" />\n\n  <File name=\"tsconfig.json\" />\n\n  <File name=\".env / .env.local / .env.example\" />\n\n  <Folder name=\"public\" />\n\n  <Folder name=\"storage\" />\n\n  <Folder name=\"tests\">\n    <File name=\"api/*.test.ts\" />\n\n    <File name=\"models/*.test.ts\" />\n\n    <File name=\"e2e/*.spec.ts\" />\n  </Folder>\n\n  <Folder name=\"src\">\n    <Folder name=\"bootstrap\">\n      <File name=\"app.ts\" />\n    </Folder>\n\n    <Folder name=\"app\">\n      <Folder name=\"models\" />\n\n      <Folder name=\"http\">\n        <Folder name=\"controllers\" />\n\n        <Folder name=\"middleware\" />\n\n        <File name=\"auth.ts\" />\n      </Folder>\n\n      <Folder name=\"services\" />\n\n      <Folder name=\"jobs\" />\n\n      <Folder name=\"events\" />\n\n      <Folder name=\"policies\" />\n\n      <Folder name=\"tasks\" />\n\n      <Folder name=\"console\" />\n    </Folder>\n\n    <Folder name=\"routes\">\n      <File name=\"api.ts\" />\n\n      <File name=\"console.ts\" />\n\n      <File name=\"rules.ts\" />\n    </Folder>\n\n    <Folder name=\"config\" />\n\n    <Folder name=\"database\">\n      <Folder name=\"migrations\" />\n\n      <Folder name=\"seeders\" />\n\n      <File name=\"factories.ts\" />\n    </Folder>\n\n    <Folder name=\"ui\">\n      <Folder name=\"pages\">\n        <File name=\"__root.tsx\" />\n\n        <File name=\"index.tsx\" />\n\n        <File name=\"posts.$id.tsx\" />\n\n        <Folder name=\"settings\">\n          <File name=\"profile.tsx\" />\n        </Folder>\n      </Folder>\n\n      <Folder name=\"components\" />\n\n      <Folder name=\"hooks\" />\n\n      <Folder name=\"styles\" />\n    </Folder>\n  </Folder>\n</Files>\n\nThe same tree can be written as a `files` code block:\n\n<Files>\n  <Folder name=\"   └─ pages/\" />\n</Files>\n\nGenerated artifacts — the route manifest, the model intermediate representation, and ambient types — live in `src/.kwiva/`, rebuild on `kwiva dev` and `kwiva build`, and are never hand-edited or committed.\n\n## Key Conventions [#key-conventions]\n\n1. **Lowercase everywhere** — directories and file names use lowercase kebab/dot case: `send-welcome.ts`, `posts.$id.tsx`. Enforced by `kwiva check`.\n2. **One construct per file** — each model, controller, middleware, job, event, policy, and task lives in its own file and exports one `defineX` definition.\n3. **Auto-discovery** — models, controllers, middleware, pages, jobs, events, and commands are discovered from their directories by convention. `src/routes/*.ts` exists for explicit registration, ordering, and route rules.\n4. **Framework-owned imports** — app code imports only from `@kwiva/*` packages. Importing an engine by name is a lint error.\n5. **Config has exactly one home** — `src/config/` plus the `kwiva.config.ts` entry. Nothing is configured from a third place.\n6. **Only `public/` is served raw** — static assets live there; app code never does.\n\n## The `defineX` Files [#the-definex-files]\n\nEach directory maps to one factory from one package:\n\n| Directory / file                | Factory             | Package           |\n| ------------------------------- | ------------------- | ----------------- |\n| `src/bootstrap/app.ts`          | `defineApp`         | `@kwiva/core`     |\n| `src/config/*.ts`               | `defineConfig`      | `@kwiva/config`   |\n| `src/app/models/*.ts`           | `defineModel`       | `@kwiva/data`     |\n| `src/app/http/controllers/*.ts` | `defineController`  | `@kwiva/http`     |\n| `src/app/http/middleware/*.ts`  | `defineMiddleware`  | `@kwiva/http`     |\n| `src/app/http/auth.ts`          | `defineAuth`        | `@kwiva/auth`     |\n| `src/app/services/*.ts`         | `defineService`     | `@kwiva/services` |\n| `src/app/jobs/*.ts`             | `defineJob`         | `@kwiva/queue`    |\n| `src/app/events/*.ts`           | `defineEvent`       | `@kwiva/events`   |\n| `src/app/policies/*.ts`         | `definePolicy`      | `@kwiva/core`     |\n| `src/app/tasks/*.ts`            | `defineTask`        | `@kwiva/http`     |\n| `src/app/console/*.ts`          | `defineCommand`     | `@kwiva/cli`      |\n| `src/routes/rules.ts`           | `defineServerRoute` | `@kwiva/http`     |\n| `src/ui/pages/*.tsx`            | `definePage`        | `@kwiva/react`    |\n| `src/database/seeders/*.ts`     | `defineSeeder`      | `@kwiva/data`     |\n\n## The Bootstrap Kernel [#the-bootstrap-kernel]\n\nThe application is composed in `src/bootstrap/app.ts` with `defineApp`. Models, controllers, and middleware are imported from the discovery helper, so the file reads as a declaration of what the app is rather than a list of wiring:\n\n```ts title=\"src/bootstrap/app.ts\"\n// src/bootstrap/app.ts\nimport { defineApp } from '@kwiva/core'\nimport auth from '../app/http/auth'\nimport { controllers, models, middleware } from '@kwiva/core/discover'\n\nexport const app = defineApp({\n  auth,\n  models,          // auto-discovered from src/app/models\n  controllers,     // auto-discovered from src/app/http/controllers\n  middleware,      // stack defined in src/config/app.ts, files discovered\n  providers: [\n    // boot/shutdown hooks for services\n  ],\n})\n```\n\n## Mode Variations [#mode-variations]\n\nModes are profiles of the same layout — each removes or adjusts a slice of the tree:\n\n| Mode         | Removed                                     | Notes                                           |\n| ------------ | ------------------------------------------- | ----------------------------------------------- |\n| `api+spa`    | `src/ui/pages` (optional)                   | SSR renderer off; SPA shell served              |\n| `static`     | `src/app/http`, `src/app/jobs`, and friends | Prerendered pages only, no server at runtime    |\n| `standalone` | nothing                                     | Single-binary output via `kwiva build --binary` |\n| `edge`       | same tree                                   | Edge-safe constraint set applies                |\n\nIn every mode, the config folder, the model layer, and the discovery rules are identical — the differences are confined to which surfaces are enabled and how the build is emitted.\n\n## Naming Cheatsheet [#naming-cheatsheet]\n\n| Artifact           | File                                | Factory             |\n| ------------------ | ----------------------------------- | ------------------- |\n| App kernel         | `src/bootstrap/app.ts`              | `defineApp`         |\n| Model              | `src/app/models/users.ts`           | `defineModel`       |\n| Controller         | `src/app/http/controllers/posts.ts` | `defineController`  |\n| Middleware         | `src/app/http/middleware/auth.ts`   | `defineMiddleware`  |\n| Auth               | `src/app/http/auth.ts`              | `defineAuth`        |\n| Service            | `src/app/services/billing.ts`       | `defineService`     |\n| Job                | `src/app/jobs/send-welcome.ts`      | `defineJob`         |\n| Event              | `src/app/events/user-signed-up.ts`  | `defineEvent`       |\n| Policy             | `src/app/policies/posts.ts`         | `definePolicy`      |\n| Task               | `src/app/tasks/cleanup.ts`          | `defineTask`        |\n| Command            | `src/app/console/import-legacy.ts`  | `defineCommand`     |\n| Config module      | `src/config/database.ts`            | `defineConfig`      |\n| Server route rules | `src/routes/rules.ts`               | `defineServerRoute` |\n| Page               | `src/ui/pages/posts.$id.tsx`        | `definePage`        |\n\n## What to Read Next [#what-to-read-next]\n\n* [Configuration](/docs/getting-started/configuration) — how to configure your project\n* [The defineX Convention](/docs/core-concepts/definex) — the pattern behind every file\n* [Application Composition](/docs/core-concepts/applications) — how the app boots\n* [Auto-Discovery](/docs/core-concepts/auto-discovery) — how files are discovered by convention\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "A Kwiva project follows a predictable, all-lowercase filesystem with a clear separation of concerns: one directory per concern, one `defineX` construct per file. Because the framework discovers files by convention, the directory layout *is* the registration mechanism — there is no central list of models, controllers, or pages to maintain."
		},
		{
			"heading": "directory-layout",
			"content": "<File name=\"kwiva.config.ts\" />"
		},
		{
			"heading": "directory-layout",
			"content": "<File name=\"package.json\" />"
		},
		{
			"heading": "directory-layout",
			"content": "<File name=\"tsconfig.json\" />"
		},
		{
			"heading": "directory-layout",
			"content": "<File name=\".env / .env.local / .env.example\" />"
		},
		{
			"heading": "directory-layout",
			"content": "<File name=\"api/*.test.ts\" />"
		},
		{
			"heading": "directory-layout",
			"content": "<File name=\"models/*.test.ts\" />"
		},
		{
			"heading": "directory-layout",
			"content": "<File name=\"e2e/*.spec.ts\" />"
		},
		{
			"heading": "directory-layout",
			"content": "<File name=\"app.ts\" />"
		},
		{
			"heading": "directory-layout",
			"content": "<File name=\"auth.ts\" />"
		},
		{
			"heading": "directory-layout",
			"content": "<File name=\"api.ts\" />"
		},
		{
			"heading": "directory-layout",
			"content": "<File name=\"console.ts\" />"
		},
		{
			"heading": "directory-layout",
			"content": "<File name=\"rules.ts\" />"
		},
		{
			"heading": "directory-layout",
			"content": "<File name=\"factories.ts\" />"
		},
		{
			"heading": "directory-layout",
			"content": "<File name=\"__root.tsx\" />"
		},
		{
			"heading": "directory-layout",
			"content": "<File name=\"index.tsx\" />"
		},
		{
			"heading": "directory-layout",
			"content": "<File name=\"posts.$id.tsx\" />"
		},
		{
			"heading": "directory-layout",
			"content": "<File name=\"profile.tsx\" />"
		},
		{
			"heading": "directory-layout",
			"content": "The same tree can be written as a `files` code block:"
		},
		{
			"heading": "directory-layout",
			"content": "Generated artifacts — the route manifest, the model intermediate representation, and ambient types — live in `src/.kwiva/`, rebuild on `kwiva dev` and `kwiva build`, and are never hand-edited or committed."
		},
		{
			"heading": "key-conventions",
			"content": "**Lowercase everywhere** — directories and file names use lowercase kebab/dot case: `send-welcome.ts`, `posts.$id.tsx`. Enforced by `kwiva check`."
		},
		{
			"heading": "key-conventions",
			"content": "**One construct per file** — each model, controller, middleware, job, event, policy, and task lives in its own file and exports one `defineX` definition."
		},
		{
			"heading": "key-conventions",
			"content": "**Auto-discovery** — models, controllers, middleware, pages, jobs, events, and commands are discovered from their directories by convention. `src/routes/*.ts` exists for explicit registration, ordering, and route rules."
		},
		{
			"heading": "key-conventions",
			"content": "**Framework-owned imports** — app code imports only from `@kwiva/*` packages. Importing an engine by name is a lint error."
		},
		{
			"heading": "key-conventions",
			"content": "**Config has exactly one home** — `src/config/` plus the `kwiva.config.ts` entry. Nothing is configured from a third place."
		},
		{
			"heading": "key-conventions",
			"content": "**Only `public/` is served raw** — static assets live there; app code never does."
		},
		{
			"heading": "the-definex-files",
			"content": "Each directory maps to one factory from one package:"
		},
		{
			"heading": "the-definex-files",
			"content": "Directory / file"
		},
		{
			"heading": "the-definex-files",
			"content": "Factory"
		},
		{
			"heading": "the-definex-files",
			"content": "Package"
		},
		{
			"heading": "the-definex-files",
			"content": "`src/bootstrap/app.ts`"
		},
		{
			"heading": "the-definex-files",
			"content": "`defineApp`"
		},
		{
			"heading": "the-definex-files",
			"content": "`@kwiva/core`"
		},
		{
			"heading": "the-definex-files",
			"content": "`src/config/*.ts`"
		},
		{
			"heading": "the-definex-files",
			"content": "`defineConfig`"
		},
		{
			"heading": "the-definex-files",
			"content": "`@kwiva/config`"
		},
		{
			"heading": "the-definex-files",
			"content": "`src/app/models/*.ts`"
		},
		{
			"heading": "the-definex-files",
			"content": "`defineModel`"
		},
		{
			"heading": "the-definex-files",
			"content": "`@kwiva/data`"
		},
		{
			"heading": "the-definex-files",
			"content": "`src/app/http/controllers/*.ts`"
		},
		{
			"heading": "the-definex-files",
			"content": "`defineController`"
		},
		{
			"heading": "the-definex-files",
			"content": "`@kwiva/http`"
		},
		{
			"heading": "the-definex-files",
			"content": "`src/app/http/middleware/*.ts`"
		},
		{
			"heading": "the-definex-files",
			"content": "`defineMiddleware`"
		},
		{
			"heading": "the-definex-files",
			"content": "`@kwiva/http`"
		},
		{
			"heading": "the-definex-files",
			"content": "`src/app/http/auth.ts`"
		},
		{
			"heading": "the-definex-files",
			"content": "`defineAuth`"
		},
		{
			"heading": "the-definex-files",
			"content": "`@kwiva/auth`"
		},
		{
			"heading": "the-definex-files",
			"content": "`src/app/services/*.ts`"
		},
		{
			"heading": "the-definex-files",
			"content": "`defineService`"
		},
		{
			"heading": "the-definex-files",
			"content": "`@kwiva/services`"
		},
		{
			"heading": "the-definex-files",
			"content": "`src/app/jobs/*.ts`"
		},
		{
			"heading": "the-definex-files",
			"content": "`defineJob`"
		},
		{
			"heading": "the-definex-files",
			"content": "`@kwiva/queue`"
		},
		{
			"heading": "the-definex-files",
			"content": "`src/app/events/*.ts`"
		},
		{
			"heading": "the-definex-files",
			"content": "`defineEvent`"
		},
		{
			"heading": "the-definex-files",
			"content": "`@kwiva/events`"
		},
		{
			"heading": "the-definex-files",
			"content": "`src/app/policies/*.ts`"
		},
		{
			"heading": "the-definex-files",
			"content": "`definePolicy`"
		},
		{
			"heading": "the-definex-files",
			"content": "`@kwiva/core`"
		},
		{
			"heading": "the-definex-files",
			"content": "`src/app/tasks/*.ts`"
		},
		{
			"heading": "the-definex-files",
			"content": "`defineTask`"
		},
		{
			"heading": "the-definex-files",
			"content": "`@kwiva/http`"
		},
		{
			"heading": "the-definex-files",
			"content": "`src/app/console/*.ts`"
		},
		{
			"heading": "the-definex-files",
			"content": "`defineCommand`"
		},
		{
			"heading": "the-definex-files",
			"content": "`@kwiva/cli`"
		},
		{
			"heading": "the-definex-files",
			"content": "`src/routes/rules.ts`"
		},
		{
			"heading": "the-definex-files",
			"content": "`defineServerRoute`"
		},
		{
			"heading": "the-definex-files",
			"content": "`@kwiva/http`"
		},
		{
			"heading": "the-definex-files",
			"content": "`src/ui/pages/*.tsx`"
		},
		{
			"heading": "the-definex-files",
			"content": "`definePage`"
		},
		{
			"heading": "the-definex-files",
			"content": "`@kwiva/react`"
		},
		{
			"heading": "the-definex-files",
			"content": "`src/database/seeders/*.ts`"
		},
		{
			"heading": "the-definex-files",
			"content": "`defineSeeder`"
		},
		{
			"heading": "the-definex-files",
			"content": "`@kwiva/data`"
		},
		{
			"heading": "the-bootstrap-kernel",
			"content": "The application is composed in `src/bootstrap/app.ts` with `defineApp`. Models, controllers, and middleware are imported from the discovery helper, so the file reads as a declaration of what the app is rather than a list of wiring:"
		},
		{
			"heading": "mode-variations",
			"content": "Modes are profiles of the same layout — each removes or adjusts a slice of the tree:"
		},
		{
			"heading": "mode-variations",
			"content": "Mode"
		},
		{
			"heading": "mode-variations",
			"content": "Removed"
		},
		{
			"heading": "mode-variations",
			"content": "Notes"
		},
		{
			"heading": "mode-variations",
			"content": "`api+spa`"
		},
		{
			"heading": "mode-variations",
			"content": "`src/ui/pages` (optional)"
		},
		{
			"heading": "mode-variations",
			"content": "SSR renderer off; SPA shell served"
		},
		{
			"heading": "mode-variations",
			"content": "`static`"
		},
		{
			"heading": "mode-variations",
			"content": "`src/app/http`, `src/app/jobs`, and friends"
		},
		{
			"heading": "mode-variations",
			"content": "Prerendered pages only, no server at runtime"
		},
		{
			"heading": "mode-variations",
			"content": "`standalone`"
		},
		{
			"heading": "mode-variations",
			"content": "nothing"
		},
		{
			"heading": "mode-variations",
			"content": "Single-binary output via `kwiva build --binary`"
		},
		{
			"heading": "mode-variations",
			"content": "`edge`"
		},
		{
			"heading": "mode-variations",
			"content": "same tree"
		},
		{
			"heading": "mode-variations",
			"content": "Edge-safe constraint set applies"
		},
		{
			"heading": "mode-variations",
			"content": "In every mode, the config folder, the model layer, and the discovery rules are identical — the differences are confined to which surfaces are enabled and how the build is emitted."
		},
		{
			"heading": "naming-cheatsheet",
			"content": "Artifact"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "File"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "Factory"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "App kernel"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`src/bootstrap/app.ts`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`defineApp`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "Model"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`src/app/models/users.ts`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`defineModel`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "Controller"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`src/app/http/controllers/posts.ts`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`defineController`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "Middleware"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`src/app/http/middleware/auth.ts`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`defineMiddleware`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "Auth"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`src/app/http/auth.ts`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`defineAuth`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "Service"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`src/app/services/billing.ts`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`defineService`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "Job"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`src/app/jobs/send-welcome.ts`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`defineJob`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "Event"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`src/app/events/user-signed-up.ts`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`defineEvent`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "Policy"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`src/app/policies/posts.ts`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`definePolicy`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "Task"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`src/app/tasks/cleanup.ts`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`defineTask`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "Command"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`src/app/console/import-legacy.ts`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`defineCommand`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "Config module"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`src/config/database.ts`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`defineConfig`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "Server route rules"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`src/routes/rules.ts`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`defineServerRoute`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "Page"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`src/ui/pages/posts.$id.tsx`"
		},
		{
			"heading": "naming-cheatsheet",
			"content": "`definePage`"
		},
		{
			"heading": "what-to-read-next",
			"content": "Configuration — how to configure your project"
		},
		{
			"heading": "what-to-read-next",
			"content": "The defineX Convention — the pattern behind every file"
		},
		{
			"heading": "what-to-read-next",
			"content": "Application Composition — how the app boots"
		},
		{
			"heading": "what-to-read-next",
			"content": "Auto-Discovery — how files are discovered by convention"
		}
	],
	"headings": [
		{
			"id": "directory-layout",
			"content": "Directory Layout"
		},
		{
			"id": "key-conventions",
			"content": "Key Conventions"
		},
		{
			"id": "the-definex-files",
			"content": "The `defineX` Files"
		},
		{
			"id": "the-bootstrap-kernel",
			"content": "The Bootstrap Kernel"
		},
		{
			"id": "mode-variations",
			"content": "Mode Variations"
		},
		{
			"id": "naming-cheatsheet",
			"content": "Naming Cheatsheet"
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
		url: "#directory-layout",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Directory Layout" })
	},
	{
		depth: 2,
		url: "#key-conventions",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Key Conventions" })
	},
	{
		depth: 2,
		url: "#the-definex-files",
		title: (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)("code", { children: "defineX" }),
			" Files"
		] })
	},
	{
		depth: 2,
		url: "#the-bootstrap-kernel",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Bootstrap Kernel" })
	},
	{
		depth: 2,
		url: "#mode-variations",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Mode Variations" })
	},
	{
		depth: 2,
		url: "#naming-cheatsheet",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Naming Cheatsheet" })
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
		code: "code",
		em: "em",
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
	}, { File, Files, Folder } = _components;
	if (!File) _missingMdxReference("File", true);
	if (!Files) _missingMdxReference("Files", true);
	if (!Folder) _missingMdxReference("Folder", true);
	return (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A Kwiva project follows a predictable, all-lowercase filesystem with a clear separation of concerns: one directory per concern, one ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" construct per file. Because the framework discovers files by convention, the directory layout ",
			(0, import_jsx_runtime_react_server.jsx)(_components.em, { children: "is" }),
			" the registration mechanism — there is no central list of models, controllers, or pages to maintain."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "directory-layout",
			children: "Directory Layout"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(Files, { children: [
			(0, import_jsx_runtime_react_server.jsx)(File, { name: "kwiva.config.ts" }),
			(0, import_jsx_runtime_react_server.jsx)(File, { name: "package.json" }),
			(0, import_jsx_runtime_react_server.jsx)(File, { name: "tsconfig.json" }),
			(0, import_jsx_runtime_react_server.jsx)(File, { name: ".env / .env.local / .env.example" }),
			(0, import_jsx_runtime_react_server.jsx)(Folder, { name: "public" }),
			(0, import_jsx_runtime_react_server.jsx)(Folder, { name: "storage" }),
			(0, import_jsx_runtime_react_server.jsxs)(Folder, {
				name: "tests",
				defaultOpen: true,
				children: [
					(0, import_jsx_runtime_react_server.jsx)(File, { name: "api/*.test.ts" }),
					(0, import_jsx_runtime_react_server.jsx)(File, { name: "models/*.test.ts" }),
					(0, import_jsx_runtime_react_server.jsx)(File, { name: "e2e/*.spec.ts" })
				]
			}),
			(0, import_jsx_runtime_react_server.jsxs)(Folder, {
				name: "src",
				defaultOpen: true,
				children: [
					(0, import_jsx_runtime_react_server.jsx)(Folder, {
						name: "bootstrap",
						children: (0, import_jsx_runtime_react_server.jsx)(File, { name: "app.ts" })
					}),
					(0, import_jsx_runtime_react_server.jsxs)(Folder, {
						name: "app",
						defaultOpen: true,
						children: [
							(0, import_jsx_runtime_react_server.jsx)(Folder, { name: "models" }),
							(0, import_jsx_runtime_react_server.jsxs)(Folder, {
								name: "http",
								defaultOpen: true,
								children: [
									(0, import_jsx_runtime_react_server.jsx)(Folder, { name: "controllers" }),
									(0, import_jsx_runtime_react_server.jsx)(Folder, { name: "middleware" }),
									(0, import_jsx_runtime_react_server.jsx)(File, { name: "auth.ts" })
								]
							}),
							(0, import_jsx_runtime_react_server.jsx)(Folder, { name: "services" }),
							(0, import_jsx_runtime_react_server.jsx)(Folder, { name: "jobs" }),
							(0, import_jsx_runtime_react_server.jsx)(Folder, { name: "events" }),
							(0, import_jsx_runtime_react_server.jsx)(Folder, { name: "policies" }),
							(0, import_jsx_runtime_react_server.jsx)(Folder, { name: "tasks" }),
							(0, import_jsx_runtime_react_server.jsx)(Folder, { name: "console" })
						]
					}),
					(0, import_jsx_runtime_react_server.jsxs)(Folder, {
						name: "routes",
						children: [
							(0, import_jsx_runtime_react_server.jsx)(File, { name: "api.ts" }),
							(0, import_jsx_runtime_react_server.jsx)(File, { name: "console.ts" }),
							(0, import_jsx_runtime_react_server.jsx)(File, { name: "rules.ts" })
						]
					}),
					(0, import_jsx_runtime_react_server.jsx)(Folder, { name: "config" }),
					(0, import_jsx_runtime_react_server.jsxs)(Folder, {
						name: "database",
						defaultOpen: true,
						children: [
							(0, import_jsx_runtime_react_server.jsx)(Folder, { name: "migrations" }),
							(0, import_jsx_runtime_react_server.jsx)(Folder, { name: "seeders" }),
							(0, import_jsx_runtime_react_server.jsx)(File, { name: "factories.ts" })
						]
					}),
					(0, import_jsx_runtime_react_server.jsxs)(Folder, {
						name: "ui",
						defaultOpen: true,
						children: [
							(0, import_jsx_runtime_react_server.jsxs)(Folder, {
								name: "pages",
								defaultOpen: true,
								children: [
									(0, import_jsx_runtime_react_server.jsx)(File, { name: "__root.tsx" }),
									(0, import_jsx_runtime_react_server.jsx)(File, { name: "index.tsx" }),
									(0, import_jsx_runtime_react_server.jsx)(File, { name: "posts.$id.tsx" }),
									(0, import_jsx_runtime_react_server.jsx)(Folder, {
										name: "settings",
										children: (0, import_jsx_runtime_react_server.jsx)(File, { name: "profile.tsx" })
									})
								]
							}),
							(0, import_jsx_runtime_react_server.jsx)(Folder, { name: "components" }),
							(0, import_jsx_runtime_react_server.jsx)(Folder, { name: "hooks" }),
							(0, import_jsx_runtime_react_server.jsx)(Folder, { name: "styles" })
						]
					})
				]
			})
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The same tree can be written as a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "files" }),
			" code block:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(Files, { children: (0, import_jsx_runtime_react_server.jsx)(Folder, {
			name: "   └─ pages/",
			defaultOpen: true
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Generated artifacts — the route manifest, the model intermediate representation, and ambient types — live in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/.kwiva/" }),
			", rebuild on ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build" }),
			", and are never hand-edited or committed."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "key-conventions",
			children: "Key Conventions"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Lowercase everywhere" }),
				" — directories and file names use lowercase kebab/dot case: ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "send-welcome.ts" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.$id.tsx" }),
				". Enforced by ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "One construct per file" }),
				" — each model, controller, middleware, job, event, policy, and task lives in its own file and exports one ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
				" definition."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Auto-discovery" }),
				" — models, controllers, middleware, pages, jobs, events, and commands are discovered from their directories by convention. ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/routes/*.ts" }),
				" exists for explicit registration, ordering, and route rules."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Framework-owned imports" }),
				" — app code imports only from ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
				" packages. Importing an engine by name is a lint error."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Config has exactly one home" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/" }),
				" plus the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }),
				" entry. Nothing is configured from a third place."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.strong, { children: [
				"Only ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "public/" }),
				" is served raw"
			] }), " — static assets live there; app code never does."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.h2, {
			id: "the-definex-files",
			children: [
				"The ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
				" Files"
			]
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Each directory maps to one factory from one package:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Directory / file" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Factory" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Package" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/bootstrap/app.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/core" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/*.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineConfig" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/config" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/models/*.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/data" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/controllers/*.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/middleware/*.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineMiddleware" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/auth.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineAuth" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/auth" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/services/*.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineService" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/services" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/jobs/*.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineJob" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/queue" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/events/*.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineEvent" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/events" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/policies/*.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePolicy" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/core" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/tasks/*.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineTask" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/console/*.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineCommand" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/cli" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/routes/rules.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineServerRoute" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/ui/pages/*.tsx" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/react" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/database/seeders/*.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineSeeder" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/data" }) })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-bootstrap-kernel",
			children: "The Bootstrap Kernel"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The application is composed in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/bootstrap/app.ts" }),
			" with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }),
			". Models, controllers, and middleware are imported from the discovery helper, so the file reads as a declaration of what the app is rather than a list of wiring:"
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
			title: "src/bootstrap/app.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/bootstrap/app.ts"
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
							children: " { defineApp } "
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
							children: " auth "
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
							children: " '../app/http/auth'"
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
							children: "import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " { controllers, models, middleware } "
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
							children: " '@kwiva/core/discover'"
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
							children: " const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " app"
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
							children: " defineApp"
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "  auth,"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "  models,          "
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// auto-discovered from src/app/models"
					})]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "  controllers,     "
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// auto-discovered from src/app/http/controllers"
					})]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "  middleware,      "
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// stack defined in src/config/app.ts, files discovered"
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
						children: "  providers: ["
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
						children: "    // boot/shutdown hooks for services"
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
						children: "  ],"
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
			id: "mode-variations",
			children: "Mode Variations"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Modes are profiles of the same layout — each removes or adjusts a slice of the tree:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Mode" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Removed" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Notes" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "api+spa" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/ui/pages" }), " (optional)"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "SSR renderer off; SPA shell served" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }) }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/jobs" }),
					", and friends"
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Prerendered pages only, no server at runtime" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "standalone" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "nothing" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Single-binary output via ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build --binary" })] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "edge" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "same tree" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Edge-safe constraint set applies" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "In every mode, the config folder, the model layer, and the discovery rules are identical — the differences are confined to which surfaces are enabled and how the build is emitted." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "naming-cheatsheet",
			children: "Naming Cheatsheet"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Artifact" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "File" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Factory" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "App kernel" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/bootstrap/app.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineApp" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Model" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/models/users.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Controller" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/controllers/posts.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Middleware" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/middleware/auth.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineMiddleware" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Auth" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/auth.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineAuth" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Service" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/services/billing.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineService" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Job" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/jobs/send-welcome.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineJob" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Event" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/events/user-signed-up.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineEvent" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Policy" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/policies/posts.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePolicy" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Task" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/tasks/cleanup.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineTask" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Command" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/console/import-legacy.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineCommand" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Config module" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/database.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineConfig" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Server route rules" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/routes/rules.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineServerRoute" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Page" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/ui/pages/posts.$id.tsx" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }) })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-to-read-next",
			children: "What to Read Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/configuration",
				children: "Configuration"
			}), " — how to configure your project"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/definex",
				children: "The defineX Convention"
			}), " — the pattern behind every file"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/applications",
				children: "Application Composition"
			}), " — how the app boots"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/auto-discovery",
				children: "Auto-Discovery"
			}), " — how files are discovered by convention"] }),
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
