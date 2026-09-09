import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/architecture/design-principles.mdx?macro_id=press.config.tsx%23architecture
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Design Principles",
	"description": "The four pillars and decision rules behind Kwiva's architecture — ownership, derivation, portability, and one grammar."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nKwiva is designed from four principles. Every decision in the framework — the package boundaries, the `defineX` convention, the derivation pipeline, the deploy-anywhere runtime — traces back to them. If a feature, convention, or dependency choice can't be justified against one of these pillars, it doesn't ship.\n\n## The Four Pillars [#the-four-pillars]\n\n### 1. Expressive syntax — one grammar [#1-expressive-syntax--one-grammar]\n\nEvery app-facing construct in Kwiva is a `defineX` factory. Models, controllers, pages, jobs, events, tasks, policies, modules, middleware — they all look the same, behave the same, and compose the same.\n\nThe cost of a second grammar is compounding: two mental models, two sets of conventions, two error surfaces, two tooling surfaces. Kwiva intentionally keeps exactly one. When you've learned `defineModel`, you've already learned `defineController`, `defineJob`, and `definePage` — the arguments differ, the shape doesn't.\n\nThe reward is a codebase that reads like a product description:\n\n```ts title=\"src/app/models/posts.ts\"\n// src/app/models/posts.ts\nimport { defineModel } from '@kwiva/data'\n\nexport default defineModel('posts', (f) => ({\n  id: f.id(),\n  title: f.string().validation((s) => s.min(1).max(200)),\n  body: f.text().optional(),\n  status: f.enum('draft', 'published', 'archived').default('draft'),\n  author: f.belongsTo(() => User),\n  comments: f.hasMany(() => Comment),\n}), { timestamps: true, permission: 'posts' })\n```\n\n### 2. Developer experience — CLI-first [#2-developer-experience--cli-first]\n\nKwiva's experience is driven by the CLI, not by ceremony. `kwiva new` scaffolds a complete, working project. `kwiva make:model` scaffolds a model plus its migration and factory. `kwiva dev` gives instant feedback with a Rust-speed toolchain; `kwiva check` runs typecheck, lint, and format in one command.\n\nConfiguration is typed, discovered, and validated at boot. Errors are friendly and actionable. The framework fails loudly at the right time — in your editor or terminal, not in production.\n\n### 3. Performance — Rust-speed toolchain [#3-performance--rust-speed-toolchain]\n\nStatic machinery runs on a Rust-native toolchain: bundling, linting, formatting, transforming, minifying, and type-declaration emission. Development startup is near-instant; builds are fast; feedback loops are short. Performance isn't a runtime afterthought — it's baked into how the CLI works.\n\n### 4. Scalability — tenancy-first and deploy-anywhere [#4-scalability--tenancy-first-and-deploy-anywhere]\n\nKwiva treats tenancy as an architectural concern from day one, not an afterthought bolted on later. Every data access path can be scoped by tenant automatically. The runtime is portable: one codebase builds for servers, edge functions, serverless providers, static output, and single-binary artifacts — the deployment target is a build-time choice, never a code change.\n\n## The Ownership Model [#the-ownership-model]\n\nKwiva is explicit about *who owns what*. The framework controls its API surface and conventions; hidden internal engines power behavior; a deeply integrated toolchain does static work; and inspiration-only references shape design without becoming dependencies.\n\n| Role                | Meaning                                                                                  |\n| ------------------- | ---------------------------------------------------------------------------------------- |\n| **Framework API**   | The `@kwiva/*` packages — the only thing application code imports                        |\n| **Internal engine** | A hidden, framework-owned implementation powering a package — never imported by app code |\n| **Toolchain**       | The Rust-speed toolchain the CLI integrates for bundling, lint, format, and transforms   |\n| **Reference**       | An inspiration-only library whose ergonomics shape the framework — zero dependency       |\n| **Application**     | Code the end-developer writes in their project                                           |\n\nThe rule that follows from this model: &#x2A;*app code imports only `@kwiva/*` and writes only `defineX(...)`.** Everything underneath is framework-owned.\n\n## How Kwiva Chooses [#how-kwiva-chooses]\n\nWhen the framework adopts or rejects a technology, a small set of decision rules applies:\n\n1. Changes to the canonical stack require an engineering decision record.\n2. When ecosystems conflict, prefer the boundary Kwiva controls — an owned DSL and generators beat vendored frameworks.\n3. When two candidates are equal on capability, choose: (a) fewer moving parts, (b) stronger type derivation, (c) more portable output, (d) ecosystem momentum on the Rust-speed/Bun-native axis.\n\n## Core Architectural Decisions [#core-architectural-decisions]\n\n| Concern            | Kwiva choice                                               | Class         | Why / what was rejected                                               |\n| ------------------ | ---------------------------------------------------------- | ------------- | --------------------------------------------------------------------- |\n| Language           | TypeScript, strict                                         | —             | JavaScript loses the type derivation Kwiva is built around            |\n| Runtime            | Bun native, Node-compatible output                         | engine        | Node-first loses the single-binary path and startup speed             |\n| Toolchain          | Rust-speed (bundler, linter, formatter, transformer)       | toolchain     | Slower toolchains make feedback loops too long                        |\n| Server foundation  | Portable server carrier with deploy presets                | engine        | A bespoke server layer would duplicate a mature, portable one         |\n| HTTP layer         | Owned pipeline: controllers, middleware, lifecycle, guards | framework API | Delegating HTTP means inheriting someone else's conventions           |\n| Data foundation    | `defineModel` as single source of truth                    | framework API | App-facing query builders still require hand-written API/client/admin |\n| UI & routing       | Owned typed router; framework-owned SSR                    | framework API | A locked deploy model or untyped routing was rejected                 |\n| Auth               | Session/auth engine behind `@kwiva/auth`                   | engine        | Rolling auth from scratch risks correctness; hosted-only locks you in |\n| Client cache & RPC | Owned typed RPC client + framework data hooks              | framework API | Codegen steps and raw fetch in loaders are lint-gated away            |\n| Configuration      | Typed config folder + `defineConfig`, env-bound            | framework API | Scattered ad-hoc config and untyped `process.env` reads were rejected |\n| Testing            | Native test runner + owned harness, Playwright for e2e     | owned         | Slow runners and heavy frameworks were rejected                       |\n| Observability      | OpenTelemetry woven at the framework surface               | engine        | Ad-hoc logging alone can't diagnose distributed apps                  |\n\n## What Kwiva Rejects [#what-kwiva-rejects]\n\nThe framework also draws clear lines about what it *won't* be:\n\n* **No library spaghetti.** Applications don't assemble a dozen independently-versioned libraries with conflicting conventions.\n* **No engine leakage.** Application code never imports an internal engine. It's enforced by a lint gate at `kwiva check`.\n* **No config sprawl.** Configuration lives in one typed model — `kwiva.config.ts` plus `src/config/` — with inline overrides always winning.\n* **No lock-in.** Deployment presets, runtime compatibility, and Standard-Schema-based validation keep the exit doors open.\n\n## What to Read Next [#what-to-read-next]\n\n* [Architecture Overview](/architecture) — The layered model in one picture\n* [Request Lifecycle](/architecture/request-lifecycle) — How one request crosses every layer\n* [Model Derivation](/architecture/model-derivation) — Why the model is the source of truth\n* [Package Boundaries](/architecture/package-boundaries) — The dependency graph and ownership map\n* [Core Concepts](/docs/core-concepts) — The mental model from a developer's perspective\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva is designed from four principles. Every decision in the framework — the package boundaries, the `defineX` convention, the derivation pipeline, the deploy-anywhere runtime — traces back to them. If a feature, convention, or dependency choice can't be justified against one of these pillars, it doesn't ship."
		},
		{
			"heading": "1-expressive-syntax--one-grammar",
			"content": "Every app-facing construct in Kwiva is a `defineX` factory. Models, controllers, pages, jobs, events, tasks, policies, modules, middleware — they all look the same, behave the same, and compose the same."
		},
		{
			"heading": "1-expressive-syntax--one-grammar",
			"content": "The cost of a second grammar is compounding: two mental models, two sets of conventions, two error surfaces, two tooling surfaces. Kwiva intentionally keeps exactly one. When you've learned `defineModel`, you've already learned `defineController`, `defineJob`, and `definePage` — the arguments differ, the shape doesn't."
		},
		{
			"heading": "1-expressive-syntax--one-grammar",
			"content": "The reward is a codebase that reads like a product description:"
		},
		{
			"heading": "2-developer-experience--cli-first",
			"content": "Kwiva's experience is driven by the CLI, not by ceremony. `kwiva new` scaffolds a complete, working project. `kwiva make:model` scaffolds a model plus its migration and factory. `kwiva dev` gives instant feedback with a Rust-speed toolchain; `kwiva check` runs typecheck, lint, and format in one command."
		},
		{
			"heading": "2-developer-experience--cli-first",
			"content": "Configuration is typed, discovered, and validated at boot. Errors are friendly and actionable. The framework fails loudly at the right time — in your editor or terminal, not in production."
		},
		{
			"heading": "3-performance--rust-speed-toolchain",
			"content": "Static machinery runs on a Rust-native toolchain: bundling, linting, formatting, transforming, minifying, and type-declaration emission. Development startup is near-instant; builds are fast; feedback loops are short. Performance isn't a runtime afterthought — it's baked into how the CLI works."
		},
		{
			"heading": "4-scalability--tenancy-first-and-deploy-anywhere",
			"content": "Kwiva treats tenancy as an architectural concern from day one, not an afterthought bolted on later. Every data access path can be scoped by tenant automatically. The runtime is portable: one codebase builds for servers, edge functions, serverless providers, static output, and single-binary artifacts — the deployment target is a build-time choice, never a code change."
		},
		{
			"heading": "the-ownership-model",
			"content": "Kwiva is explicit about *who owns what*. The framework controls its API surface and conventions; hidden internal engines power behavior; a deeply integrated toolchain does static work; and inspiration-only references shape design without becoming dependencies."
		},
		{
			"heading": "the-ownership-model",
			"content": "Role"
		},
		{
			"heading": "the-ownership-model",
			"content": "Meaning"
		},
		{
			"heading": "the-ownership-model",
			"content": "**Framework API**"
		},
		{
			"heading": "the-ownership-model",
			"content": "The `@kwiva/*` packages — the only thing application code imports"
		},
		{
			"heading": "the-ownership-model",
			"content": "**Internal engine**"
		},
		{
			"heading": "the-ownership-model",
			"content": "A hidden, framework-owned implementation powering a package — never imported by app code"
		},
		{
			"heading": "the-ownership-model",
			"content": "**Toolchain**"
		},
		{
			"heading": "the-ownership-model",
			"content": "The Rust-speed toolchain the CLI integrates for bundling, lint, format, and transforms"
		},
		{
			"heading": "the-ownership-model",
			"content": "**Reference**"
		},
		{
			"heading": "the-ownership-model",
			"content": "An inspiration-only library whose ergonomics shape the framework — zero dependency"
		},
		{
			"heading": "the-ownership-model",
			"content": "**Application**"
		},
		{
			"heading": "the-ownership-model",
			"content": "Code the end-developer writes in their project"
		},
		{
			"heading": "the-ownership-model",
			"content": "The rule that follows from this model: &#x2A;*app code imports only `@kwiva/*` and writes only `defineX(...)`.** Everything underneath is framework-owned."
		},
		{
			"heading": "how-kwiva-chooses",
			"content": "When the framework adopts or rejects a technology, a small set of decision rules applies:"
		},
		{
			"heading": "how-kwiva-chooses",
			"content": "Changes to the canonical stack require an engineering decision record."
		},
		{
			"heading": "how-kwiva-chooses",
			"content": "When ecosystems conflict, prefer the boundary Kwiva controls — an owned DSL and generators beat vendored frameworks."
		},
		{
			"heading": "how-kwiva-chooses",
			"content": "When two candidates are equal on capability, choose: (a) fewer moving parts, (b) stronger type derivation, (c) more portable output, (d) ecosystem momentum on the Rust-speed/Bun-native axis."
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Concern"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Kwiva choice"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Class"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Why / what was rejected"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Language"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "TypeScript, strict"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "—"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "JavaScript loses the type derivation Kwiva is built around"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Runtime"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Bun native, Node-compatible output"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "engine"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Node-first loses the single-binary path and startup speed"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Toolchain"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Rust-speed (bundler, linter, formatter, transformer)"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "toolchain"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Slower toolchains make feedback loops too long"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Server foundation"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Portable server carrier with deploy presets"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "engine"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "A bespoke server layer would duplicate a mature, portable one"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "HTTP layer"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Owned pipeline: controllers, middleware, lifecycle, guards"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "framework API"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Delegating HTTP means inheriting someone else's conventions"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Data foundation"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "`defineModel` as single source of truth"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "framework API"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "App-facing query builders still require hand-written API/client/admin"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "UI & routing"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Owned typed router; framework-owned SSR"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "framework API"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "A locked deploy model or untyped routing was rejected"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Auth"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Session/auth engine behind `@kwiva/auth`"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "engine"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Rolling auth from scratch risks correctness; hosted-only locks you in"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Client cache & RPC"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Owned typed RPC client + framework data hooks"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "framework API"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Codegen steps and raw fetch in loaders are lint-gated away"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Configuration"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Typed config folder + `defineConfig`, env-bound"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "framework API"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Scattered ad-hoc config and untyped `process.env` reads were rejected"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Testing"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Native test runner + owned harness, Playwright for e2e"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "owned"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Slow runners and heavy frameworks were rejected"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Observability"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "OpenTelemetry woven at the framework surface"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "engine"
		},
		{
			"heading": "core-architectural-decisions",
			"content": "Ad-hoc logging alone can't diagnose distributed apps"
		},
		{
			"heading": "what-kwiva-rejects",
			"content": "The framework also draws clear lines about what it *won't* be:"
		},
		{
			"heading": "what-kwiva-rejects",
			"content": "**No library spaghetti.** Applications don't assemble a dozen independently-versioned libraries with conflicting conventions."
		},
		{
			"heading": "what-kwiva-rejects",
			"content": "**No engine leakage.** Application code never imports an internal engine. It's enforced by a lint gate at `kwiva check`."
		},
		{
			"heading": "what-kwiva-rejects",
			"content": "**No config sprawl.** Configuration lives in one typed model — `kwiva.config.ts` plus `src/config/` — with inline overrides always winning."
		},
		{
			"heading": "what-kwiva-rejects",
			"content": "**No lock-in.** Deployment presets, runtime compatibility, and Standard-Schema-based validation keep the exit doors open."
		},
		{
			"heading": "what-to-read-next",
			"content": "Architecture Overview — The layered model in one picture"
		},
		{
			"heading": "what-to-read-next",
			"content": "Request Lifecycle — How one request crosses every layer"
		},
		{
			"heading": "what-to-read-next",
			"content": "Model Derivation — Why the model is the source of truth"
		},
		{
			"heading": "what-to-read-next",
			"content": "Package Boundaries — The dependency graph and ownership map"
		},
		{
			"heading": "what-to-read-next",
			"content": "Core Concepts — The mental model from a developer's perspective"
		}
	],
	"headings": [
		{
			"id": "the-four-pillars",
			"content": "The Four Pillars"
		},
		{
			"id": "1-expressive-syntax--one-grammar",
			"content": "1\\. Expressive syntax — one grammar"
		},
		{
			"id": "2-developer-experience--cli-first",
			"content": "2\\. Developer experience — CLI-first"
		},
		{
			"id": "3-performance--rust-speed-toolchain",
			"content": "3\\. Performance — Rust-speed toolchain"
		},
		{
			"id": "4-scalability--tenancy-first-and-deploy-anywhere",
			"content": "4\\. Scalability — tenancy-first and deploy-anywhere"
		},
		{
			"id": "the-ownership-model",
			"content": "The Ownership Model"
		},
		{
			"id": "how-kwiva-chooses",
			"content": "How Kwiva Chooses"
		},
		{
			"id": "core-architectural-decisions",
			"content": "Core Architectural Decisions"
		},
		{
			"id": "what-kwiva-rejects",
			"content": "What Kwiva Rejects"
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
		url: "#the-four-pillars",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Four Pillars" })
	},
	{
		depth: 3,
		url: "#1-expressive-syntax--one-grammar",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "1. Expressive syntax — one grammar" })
	},
	{
		depth: 3,
		url: "#2-developer-experience--cli-first",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "2. Developer experience — CLI-first" })
	},
	{
		depth: 3,
		url: "#3-performance--rust-speed-toolchain",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "3. Performance — Rust-speed toolchain" })
	},
	{
		depth: 3,
		url: "#4-scalability--tenancy-first-and-deploy-anywhere",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "4. Scalability — tenancy-first and deploy-anywhere" })
	},
	{
		depth: 2,
		url: "#the-ownership-model",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Ownership Model" })
	},
	{
		depth: 2,
		url: "#how-kwiva-chooses",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "How Kwiva Chooses" })
	},
	{
		depth: 2,
		url: "#core-architectural-decisions",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Core Architectural Decisions" })
	},
	{
		depth: 2,
		url: "#what-kwiva-rejects",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What Kwiva Rejects" })
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Kwiva is designed from four principles. Every decision in the framework — the package boundaries, the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" convention, the derivation pipeline, the deploy-anywhere runtime — traces back to them. If a feature, convention, or dependency choice can't be justified against one of these pillars, it doesn't ship."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-four-pillars",
			children: "The Four Pillars"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "1-expressive-syntax--one-grammar",
			children: "1. Expressive syntax — one grammar"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every app-facing construct in Kwiva is a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" factory. Models, controllers, pages, jobs, events, tasks, policies, modules, middleware — they all look the same, behave the same, and compose the same."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The cost of a second grammar is compounding: two mental models, two sets of conventions, two error surfaces, two tooling surfaces. Kwiva intentionally keeps exactly one. When you've learned ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
			", you've already learned ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineJob" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "definePage" }),
			" — the arguments differ, the shape doesn't."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The reward is a codebase that reads like a product description:" }),
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
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'archived'"
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "}), { timestamps: "
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
							children: ", permission: "
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
							children: " })"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "2-developer-experience--cli-first",
			children: "2. Developer experience — CLI-first"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Kwiva's experience is driven by the CLI, not by ceremony. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva new" }),
			" scaffolds a complete, working project. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva make:model" }),
			" scaffolds a model plus its migration and factory. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva dev" }),
			" gives instant feedback with a Rust-speed toolchain; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
			" runs typecheck, lint, and format in one command."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Configuration is typed, discovered, and validated at boot. Errors are friendly and actionable. The framework fails loudly at the right time — in your editor or terminal, not in production." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "3-performance--rust-speed-toolchain",
			children: "3. Performance — Rust-speed toolchain"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Static machinery runs on a Rust-native toolchain: bundling, linting, formatting, transforming, minifying, and type-declaration emission. Development startup is near-instant; builds are fast; feedback loops are short. Performance isn't a runtime afterthought — it's baked into how the CLI works." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "4-scalability--tenancy-first-and-deploy-anywhere",
			children: "4. Scalability — tenancy-first and deploy-anywhere"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva treats tenancy as an architectural concern from day one, not an afterthought bolted on later. Every data access path can be scoped by tenant automatically. The runtime is portable: one codebase builds for servers, edge functions, serverless providers, static output, and single-binary artifacts — the deployment target is a build-time choice, never a code change." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-ownership-model",
			children: "The Ownership Model"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Kwiva is explicit about ",
			(0, import_jsx_runtime_react_server.jsx)(_components.em, { children: "who owns what" }),
			". The framework controls its API surface and conventions; hidden internal engines power behavior; a deeply integrated toolchain does static work; and inspiration-only references shape design without becoming dependencies."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Role" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Meaning" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Framework API" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"The ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
				" packages — the only thing application code imports"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Internal engine" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A hidden, framework-owned implementation powering a package — never imported by app code" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Toolchain" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The Rust-speed toolchain the CLI integrates for bundling, lint, format, and transforms" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Reference" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "An inspiration-only library whose ergonomics shape the framework — zero dependency" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Application" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Code the end-developer writes in their project" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The rule that follows from this model: ",
			(0, import_jsx_runtime_react_server.jsxs)(_components.strong, { children: [
				"app code imports only ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/*" }),
				" and writes only ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX(...)" }),
				"."
			] }),
			" Everything underneath is framework-owned."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "how-kwiva-chooses",
			children: "How Kwiva Chooses"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "When the framework adopts or rejects a technology, a small set of decision rules applies:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Changes to the canonical stack require an engineering decision record." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "When ecosystems conflict, prefer the boundary Kwiva controls — an owned DSL and generators beat vendored frameworks." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "When two candidates are equal on capability, choose: (a) fewer moving parts, (b) stronger type derivation, (c) more portable output, (d) ecosystem momentum on the Rust-speed/Bun-native axis." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "core-architectural-decisions",
			children: "Core Architectural Decisions"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Concern" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Kwiva choice" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Class" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Why / what was rejected" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Language" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "TypeScript, strict" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "—" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "JavaScript loses the type derivation Kwiva is built around" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Runtime" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Bun native, Node-compatible output" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "engine" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Node-first loses the single-binary path and startup speed" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Toolchain" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Rust-speed (bundler, linter, formatter, transformer)" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "toolchain" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Slower toolchains make feedback loops too long" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Server foundation" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Portable server carrier with deploy presets" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "engine" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A bespoke server layer would duplicate a mature, portable one" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "HTTP layer" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Owned pipeline: controllers, middleware, lifecycle, guards" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "framework API" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Delegating HTTP means inheriting someone else's conventions" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Data foundation" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }), " as single source of truth"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "framework API" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "App-facing query builders still require hand-written API/client/admin" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "UI & routing" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Owned typed router; framework-owned SSR" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "framework API" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A locked deploy model or untyped routing was rejected" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Auth" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Session/auth engine behind ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/auth" })] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "engine" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Rolling auth from scratch risks correctness; hosted-only locks you in" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Client cache & RPC" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Owned typed RPC client + framework data hooks" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "framework API" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Codegen steps and raw fetch in loaders are lint-gated away" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Configuration" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"Typed config folder + ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineConfig" }),
					", env-bound"
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "framework API" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"Scattered ad-hoc config and untyped ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "process.env" }),
					" reads were rejected"
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Testing" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Native test runner + owned harness, Playwright for e2e" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "owned" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Slow runners and heavy frameworks were rejected" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Observability" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "OpenTelemetry woven at the framework surface" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "engine" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Ad-hoc logging alone can't diagnose distributed apps" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-kwiva-rejects",
			children: "What Kwiva Rejects"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The framework also draws clear lines about what it ",
			(0, import_jsx_runtime_react_server.jsx)(_components.em, { children: "won't" }),
			" be:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "No library spaghetti." }), " Applications don't assemble a dozen independently-versioned libraries with conflicting conventions."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "No engine leakage." }),
				" Application code never imports an internal engine. It's enforced by a lint gate at ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva check" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "No config sprawl." }),
				" Configuration lives in one typed model — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }),
				" plus ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/" }),
				" — with inline overrides always winning."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "No lock-in." }), " Deployment presets, runtime compatibility, and Standard-Schema-based validation keep the exit doors open."] }),
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
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/architecture",
				children: "Architecture Overview"
			}), " — The layered model in one picture"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/architecture/request-lifecycle",
				children: "Request Lifecycle"
			}), " — How one request crosses every layer"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/architecture/model-derivation",
				children: "Model Derivation"
			}), " — Why the model is the source of truth"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/architecture/package-boundaries",
				children: "Package Boundaries"
			}), " — The dependency graph and ownership map"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts",
				children: "Core Concepts"
			}), " — The mental model from a developer's perspective"] }),
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
