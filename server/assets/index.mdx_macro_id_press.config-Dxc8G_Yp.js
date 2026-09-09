import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/deployment/index.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Deployment",
	"description": "Deploy one codebase to any target — a Node or Bun runtime, serverless or edge platforms, containers, or a single binary — with build-time-only adapters and zero app-code changes."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nKwiva follows **one codebase, many targets**. The same application you compose with `defineX` files in `src/` compiles to a deployment artifact for a Node runtime, a Bun runtime, serverless platforms, edge platforms, container images, a prerendered static site, or a standalone binary — with zero application-code changes.\n\nDeployment is a build-time decision, not a design constraint. You write models, controllers, middleware, and pages once against the framework API, and the target decides how the built output is boxed, shipped, and started. Swap from a shared Node host to a serverless function platform, or from a container fleet to a single binary, and the rebuild is the only change that moves.\n\n## How Deployment Works [#how-deployment-works]\n\nDeployment in Kwiva is **build-time only**. Your app never knows where it will run; the target is decided when you build, not when you write code.\n\n```bash title=\"terminal\"\nkwiva build              # produce .output/ for the selected adapter\nkwiva preview            # run the built artifact locally\nkwiva deploy [provider]  # push to a host — or run the artifact yourself\n```\n\nThe `kwiva build` command runs the client build and the server build, then emits `.output/` containing `server/` and `public/`. The generated `server/` entry is what every target actually runs:\n\n```text title=\"how-deployment-works.txt\"\n.output/\n  server/\n    index.mjs            the composed web-standard handler entry\n  public/\n    ...                  rendered client assets, static files\n```\n\nThat one entry is reinterpreted per target:\n\n| Target                    | What runs                                                         |\n| ------------------------- | ----------------------------------------------------------------- |\n| Node runtime              | `node .output/server/index.mjs`                                   |\n| Bun runtime               | `bun .output/server/index.mjs`                                    |\n| Container images          | The same entry inside a minimal runtime image                     |\n| Serverless and edge hosts | The artifact is reinterpreted by the adapter into function output |\n| Single binary             | `kwiva build --binary` compiles everything into one executable    |\n\nThe application is always written against Web Standards — `Request`, `Response`, `fetch`, `WebSocket` — so the runtime differences stay inside the framework. Whatever target you build for, the app sees the same request pipeline, the same context, and the same `defineX` surface.\n\n### Selecting an Adapter [#selecting-an-adapter]\n\nThe adapter (deploy preset) is chosen at build time through one of four mechanisms:\n\n| Mechanism       | Where                           | Notes                                           |\n| --------------- | ------------------------------- | ----------------------------------------------- |\n| `--preset` flag | `kwiva build --preset <preset>` | Explicit, per-build                             |\n| preset env var  | Build environment               | Force a preset in CI                            |\n| `deploy.preset` | `kwiva.config.ts`               | Committed default                               |\n| Auto-detection  | CI                              | Recognized platforms are detected automatically |\n\nExplicit selections override auto-detection: if your continuous-integration runner is already recognized by a platform, you do not need to configure anything; if you want to pin a target or run a build outside a recognized pipeline, set the preset env var, pass `--preset`, or commit `deploy.preset` in your config file.\n\n## The Build → Preview → Deploy Loop [#the-build--preview--deploy-loop]\n\n`kwiva preview` runs the built artifact locally, exactly as a host would. This is the fastest feedback loop before pushing anywhere:\n\n1. `kwiva build [--preset] [--binary]` — produce the artifact for a target\n2. `kwiva preview` — sanity-check that artifact locally\n3. `kwiva deploy [provider]` — push to a host, or run the artifact yourself\n\nFor a raw smoke test of a specific adapter, build with an explicit `--preset` and run the generated entry directly instead of deploying:\n\n```bash title=\"terminal\"\nkwiva build --preset node_server\nnode .output/server/index.mjs\n```\n\nThe same artifact is validated locally and then pushed, so the thing you tested is the thing that ships.\n\n## Scaffold Modes Map to Adapters [#scaffold-modes-map-to-adapters]\n\nThe mode you choose at scaffold time selects a sensible default adapter:\n\n| Mode                  | Default adapter                    | What changes                           |\n| --------------------- | ---------------------------------- | -------------------------------------- |\n| `fullstack` (default) | Node runtime (auto-detected in CI) | SSR + API                              |\n| `api+spa`             | Node runtime + client build only   | No SSR renderer; SPA served            |\n| `static`              | static                             | Prerender everything; no server needed |\n| `standalone`          | Bun runtime + compile              | Single-file, zero-dependency binary    |\n| `edge`                | Edge worker adapter                | Edge-safe constraint set applies       |\n\nYou are not locked into the scaffold default. A `fullstack` app can be built for serverless, containers, or a binary later; a `static` build can be regenerated as a fullstack deployment if you add API routes. The mode is a starting default, and the adapter matrix is your way around it.\n\n## Which Target Should You Choose? [#which-target-should-you-choose]\n\nThe matrix is large, but the decision usually collapses to what your operations team already runs:\n\n| You have...                           | Build for...               | Why                                             |\n| ------------------------------------- | -------------------------- | ----------------------------------------------- |\n| A managed Node host or your own VM    | `node_server`              | Default production preset; simplest operations  |\n| A Bun-capable host or a tiny artifact | `bun-server` or `--binary` | Native runtime, single-file output              |\n| Spiky, elastic traffic                | Serverless or edge         | Functions scale with demand, idle costs nothing |\n| An orchestrator fleet                 | Containers                 | Images plus health probes, declarative scaling  |\n| A mostly-read site                    | `static`                   | Prerendered output, no server to operate        |\n\nThe choice is never permanent. Because the adapter is a build-time property, you can move a `node_server` deployment to containers next quarter, or a fullstack site to static when its content stops changing daily — the rebuild is the only change that moves, and the artifact remains the same `.output/` contract you validated with `kwiva preview`.\n\n## Environment Variables That Matter [#environment-variables-that-matter]\n\nA small set of environment variables controls deployment behavior across targets:\n\n| Variable                         | Purpose                                                    |\n| -------------------------------- | ---------------------------------------------------------- |\n| `KWIVA_PRESET`                   | Force a deploy preset in CI                                |\n| `KWIVA_APP_BASE_URL` / `baseURL` | Serve under a subpath                                      |\n| `PORT`                           | Port for hosted platforms                                  |\n| `KWIVA_API_SECRET`               | Runtime config override pattern for the app config channel |\n| `KWIVA_TENANT_MODE`              | App-level tenancy default                                  |\n| `KWIVA_DB_URL`                   | App-level database connection                              |\n| `KWIVA_CACHE_URL`                | App-level cache connection                                 |\n\nTyped env access through `env(...)` validates required variables at boot, so a misconfigured production environment fails fast at startup rather than mid-request. Provider credentials used by `kwiva deploy` are separate — they are injected as environment tokens at deploy time and never needed at runtime.\n\n## Deploying [#deploying]\n\n`kwiva deploy [provider]` is a thin wrapper that runs the provider's own deploy path with your credentials, then prints the artifact digest and the deploy command it executed. Self-hosters skip the wrapper entirely: build with a preset, copy `.output/`, and run the entry.\n\nRolling back is a pointer swap, not a code change. Keep N previous builds; managed platforms roll back by environment, and self-hosters keep a tar of `.output/`. Deployment artifacts are therefore immutable — you never recompile in production, you repoint to a previous build.\n\n## Adapting to a Target [#adapting-to-a-target]\n\n| Page                                                          | Purpose                                                |\n| ------------------------------------------------------------- | ------------------------------------------------------ |\n| [Runtime Adapters](/docs/deployment/adapters)                 | What an adapter is, the full matrix, choosing one      |\n| [Node/Bun Deployment](/docs/deployment/node-bun)              | Running on a Node or Bun runtime, single-binary output |\n| [Serverless Deployment](/docs/deployment/serverless)          | Function-based targets and their constraints           |\n| [Container Deployment](/docs/deployment/containers)           | Container images at scale                              |\n| [Production Checklist](/docs/deployment/production-checklist) | Pre-deploy and operational checks                      |\n\n## What's Next [#whats-next]\n\n* [Runtime Adapters](/docs/deployment/adapters) — understand the full matrix\n* [Node/Bun Deployment](/docs/deployment/node-bun) — deploy to a Node or Bun runtime\n* [Serverless Deployment](/docs/deployment/serverless) — function-based targets and constraints\n* [Production Checklist](/docs/deployment/production-checklist) — pass every pre-deploy check\n* [First Deployment](/docs/getting-started/first-deployment) — walk the loop from a fresh project\n* [Observability](/docs/observability) — wire logs, traces, and metrics before you ship\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva follows **one codebase, many targets**. The same application you compose with `defineX` files in `src/` compiles to a deployment artifact for a Node runtime, a Bun runtime, serverless platforms, edge platforms, container images, a prerendered static site, or a standalone binary — with zero application-code changes."
		},
		{
			"heading": void 0,
			"content": "Deployment is a build-time decision, not a design constraint. You write models, controllers, middleware, and pages once against the framework API, and the target decides how the built output is boxed, shipped, and started. Swap from a shared Node host to a serverless function platform, or from a container fleet to a single binary, and the rebuild is the only change that moves."
		},
		{
			"heading": "how-deployment-works",
			"content": "Deployment in Kwiva is **build-time only**. Your app never knows where it will run; the target is decided when you build, not when you write code."
		},
		{
			"heading": "how-deployment-works",
			"content": "The `kwiva build` command runs the client build and the server build, then emits `.output/` containing `server/` and `public/`. The generated `server/` entry is what every target actually runs:"
		},
		{
			"heading": "how-deployment-works",
			"content": "That one entry is reinterpreted per target:"
		},
		{
			"heading": "how-deployment-works",
			"content": "Target"
		},
		{
			"heading": "how-deployment-works",
			"content": "What runs"
		},
		{
			"heading": "how-deployment-works",
			"content": "Node runtime"
		},
		{
			"heading": "how-deployment-works",
			"content": "`node .output/server/index.mjs`"
		},
		{
			"heading": "how-deployment-works",
			"content": "Bun runtime"
		},
		{
			"heading": "how-deployment-works",
			"content": "`bun .output/server/index.mjs`"
		},
		{
			"heading": "how-deployment-works",
			"content": "Container images"
		},
		{
			"heading": "how-deployment-works",
			"content": "The same entry inside a minimal runtime image"
		},
		{
			"heading": "how-deployment-works",
			"content": "Serverless and edge hosts"
		},
		{
			"heading": "how-deployment-works",
			"content": "The artifact is reinterpreted by the adapter into function output"
		},
		{
			"heading": "how-deployment-works",
			"content": "Single binary"
		},
		{
			"heading": "how-deployment-works",
			"content": "`kwiva build --binary` compiles everything into one executable"
		},
		{
			"heading": "how-deployment-works",
			"content": "The application is always written against Web Standards — `Request`, `Response`, `fetch`, `WebSocket` — so the runtime differences stay inside the framework. Whatever target you build for, the app sees the same request pipeline, the same context, and the same `defineX` surface."
		},
		{
			"heading": "selecting-an-adapter",
			"content": "The adapter (deploy preset) is chosen at build time through one of four mechanisms:"
		},
		{
			"heading": "selecting-an-adapter",
			"content": "Mechanism"
		},
		{
			"heading": "selecting-an-adapter",
			"content": "Where"
		},
		{
			"heading": "selecting-an-adapter",
			"content": "Notes"
		},
		{
			"heading": "selecting-an-adapter",
			"content": "`--preset` flag"
		},
		{
			"heading": "selecting-an-adapter",
			"content": "`kwiva build --preset <preset>`"
		},
		{
			"heading": "selecting-an-adapter",
			"content": "Explicit, per-build"
		},
		{
			"heading": "selecting-an-adapter",
			"content": "preset env var"
		},
		{
			"heading": "selecting-an-adapter",
			"content": "Build environment"
		},
		{
			"heading": "selecting-an-adapter",
			"content": "Force a preset in CI"
		},
		{
			"heading": "selecting-an-adapter",
			"content": "`deploy.preset`"
		},
		{
			"heading": "selecting-an-adapter",
			"content": "`kwiva.config.ts`"
		},
		{
			"heading": "selecting-an-adapter",
			"content": "Committed default"
		},
		{
			"heading": "selecting-an-adapter",
			"content": "Auto-detection"
		},
		{
			"heading": "selecting-an-adapter",
			"content": "CI"
		},
		{
			"heading": "selecting-an-adapter",
			"content": "Recognized platforms are detected automatically"
		},
		{
			"heading": "selecting-an-adapter",
			"content": "Explicit selections override auto-detection: if your continuous-integration runner is already recognized by a platform, you do not need to configure anything; if you want to pin a target or run a build outside a recognized pipeline, set the preset env var, pass `--preset`, or commit `deploy.preset` in your config file."
		},
		{
			"heading": "the-build--preview--deploy-loop",
			"content": "`kwiva preview` runs the built artifact locally, exactly as a host would. This is the fastest feedback loop before pushing anywhere:"
		},
		{
			"heading": "the-build--preview--deploy-loop",
			"content": "`kwiva build [--preset] [--binary]` — produce the artifact for a target"
		},
		{
			"heading": "the-build--preview--deploy-loop",
			"content": "`kwiva preview` — sanity-check that artifact locally"
		},
		{
			"heading": "the-build--preview--deploy-loop",
			"content": "`kwiva deploy [provider]` — push to a host, or run the artifact yourself"
		},
		{
			"heading": "the-build--preview--deploy-loop",
			"content": "For a raw smoke test of a specific adapter, build with an explicit `--preset` and run the generated entry directly instead of deploying:"
		},
		{
			"heading": "the-build--preview--deploy-loop",
			"content": "The same artifact is validated locally and then pushed, so the thing you tested is the thing that ships."
		},
		{
			"heading": "scaffold-modes-map-to-adapters",
			"content": "The mode you choose at scaffold time selects a sensible default adapter:"
		},
		{
			"heading": "scaffold-modes-map-to-adapters",
			"content": "Mode"
		},
		{
			"heading": "scaffold-modes-map-to-adapters",
			"content": "Default adapter"
		},
		{
			"heading": "scaffold-modes-map-to-adapters",
			"content": "What changes"
		},
		{
			"heading": "scaffold-modes-map-to-adapters",
			"content": "`fullstack` (default)"
		},
		{
			"heading": "scaffold-modes-map-to-adapters",
			"content": "Node runtime (auto-detected in CI)"
		},
		{
			"heading": "scaffold-modes-map-to-adapters",
			"content": "SSR + API"
		},
		{
			"heading": "scaffold-modes-map-to-adapters",
			"content": "`api+spa`"
		},
		{
			"heading": "scaffold-modes-map-to-adapters",
			"content": "Node runtime + client build only"
		},
		{
			"heading": "scaffold-modes-map-to-adapters",
			"content": "No SSR renderer; SPA served"
		},
		{
			"heading": "scaffold-modes-map-to-adapters",
			"content": "`static`"
		},
		{
			"heading": "scaffold-modes-map-to-adapters",
			"content": "static"
		},
		{
			"heading": "scaffold-modes-map-to-adapters",
			"content": "Prerender everything; no server needed"
		},
		{
			"heading": "scaffold-modes-map-to-adapters",
			"content": "`standalone`"
		},
		{
			"heading": "scaffold-modes-map-to-adapters",
			"content": "Bun runtime + compile"
		},
		{
			"heading": "scaffold-modes-map-to-adapters",
			"content": "Single-file, zero-dependency binary"
		},
		{
			"heading": "scaffold-modes-map-to-adapters",
			"content": "`edge`"
		},
		{
			"heading": "scaffold-modes-map-to-adapters",
			"content": "Edge worker adapter"
		},
		{
			"heading": "scaffold-modes-map-to-adapters",
			"content": "Edge-safe constraint set applies"
		},
		{
			"heading": "scaffold-modes-map-to-adapters",
			"content": "You are not locked into the scaffold default. A `fullstack` app can be built for serverless, containers, or a binary later; a `static` build can be regenerated as a fullstack deployment if you add API routes. The mode is a starting default, and the adapter matrix is your way around it."
		},
		{
			"heading": "which-target-should-you-choose",
			"content": "The matrix is large, but the decision usually collapses to what your operations team already runs:"
		},
		{
			"heading": "which-target-should-you-choose",
			"content": "You have..."
		},
		{
			"heading": "which-target-should-you-choose",
			"content": "Build for..."
		},
		{
			"heading": "which-target-should-you-choose",
			"content": "Why"
		},
		{
			"heading": "which-target-should-you-choose",
			"content": "A managed Node host or your own VM"
		},
		{
			"heading": "which-target-should-you-choose",
			"content": "`node_server`"
		},
		{
			"heading": "which-target-should-you-choose",
			"content": "Default production preset; simplest operations"
		},
		{
			"heading": "which-target-should-you-choose",
			"content": "A Bun-capable host or a tiny artifact"
		},
		{
			"heading": "which-target-should-you-choose",
			"content": "`bun-server` or `--binary`"
		},
		{
			"heading": "which-target-should-you-choose",
			"content": "Native runtime, single-file output"
		},
		{
			"heading": "which-target-should-you-choose",
			"content": "Spiky, elastic traffic"
		},
		{
			"heading": "which-target-should-you-choose",
			"content": "Serverless or edge"
		},
		{
			"heading": "which-target-should-you-choose",
			"content": "Functions scale with demand, idle costs nothing"
		},
		{
			"heading": "which-target-should-you-choose",
			"content": "An orchestrator fleet"
		},
		{
			"heading": "which-target-should-you-choose",
			"content": "Containers"
		},
		{
			"heading": "which-target-should-you-choose",
			"content": "Images plus health probes, declarative scaling"
		},
		{
			"heading": "which-target-should-you-choose",
			"content": "A mostly-read site"
		},
		{
			"heading": "which-target-should-you-choose",
			"content": "`static`"
		},
		{
			"heading": "which-target-should-you-choose",
			"content": "Prerendered output, no server to operate"
		},
		{
			"heading": "which-target-should-you-choose",
			"content": "The choice is never permanent. Because the adapter is a build-time property, you can move a `node_server` deployment to containers next quarter, or a fullstack site to static when its content stops changing daily — the rebuild is the only change that moves, and the artifact remains the same `.output/` contract you validated with `kwiva preview`."
		},
		{
			"heading": "environment-variables-that-matter",
			"content": "A small set of environment variables controls deployment behavior across targets:"
		},
		{
			"heading": "environment-variables-that-matter",
			"content": "Variable"
		},
		{
			"heading": "environment-variables-that-matter",
			"content": "Purpose"
		},
		{
			"heading": "environment-variables-that-matter",
			"content": "`KWIVA_PRESET`"
		},
		{
			"heading": "environment-variables-that-matter",
			"content": "Force a deploy preset in CI"
		},
		{
			"heading": "environment-variables-that-matter",
			"content": "`KWIVA_APP_BASE_URL` / `baseURL`"
		},
		{
			"heading": "environment-variables-that-matter",
			"content": "Serve under a subpath"
		},
		{
			"heading": "environment-variables-that-matter",
			"content": "`PORT`"
		},
		{
			"heading": "environment-variables-that-matter",
			"content": "Port for hosted platforms"
		},
		{
			"heading": "environment-variables-that-matter",
			"content": "`KWIVA_API_SECRET`"
		},
		{
			"heading": "environment-variables-that-matter",
			"content": "Runtime config override pattern for the app config channel"
		},
		{
			"heading": "environment-variables-that-matter",
			"content": "`KWIVA_TENANT_MODE`"
		},
		{
			"heading": "environment-variables-that-matter",
			"content": "App-level tenancy default"
		},
		{
			"heading": "environment-variables-that-matter",
			"content": "`KWIVA_DB_URL`"
		},
		{
			"heading": "environment-variables-that-matter",
			"content": "App-level database connection"
		},
		{
			"heading": "environment-variables-that-matter",
			"content": "`KWIVA_CACHE_URL`"
		},
		{
			"heading": "environment-variables-that-matter",
			"content": "App-level cache connection"
		},
		{
			"heading": "environment-variables-that-matter",
			"content": "Typed env access through `env(...)` validates required variables at boot, so a misconfigured production environment fails fast at startup rather than mid-request. Provider credentials used by `kwiva deploy` are separate — they are injected as environment tokens at deploy time and never needed at runtime."
		},
		{
			"heading": "deploying",
			"content": "`kwiva deploy [provider]` is a thin wrapper that runs the provider's own deploy path with your credentials, then prints the artifact digest and the deploy command it executed. Self-hosters skip the wrapper entirely: build with a preset, copy `.output/`, and run the entry."
		},
		{
			"heading": "deploying",
			"content": "Rolling back is a pointer swap, not a code change. Keep N previous builds; managed platforms roll back by environment, and self-hosters keep a tar of `.output/`. Deployment artifacts are therefore immutable — you never recompile in production, you repoint to a previous build."
		},
		{
			"heading": "adapting-to-a-target",
			"content": "Page"
		},
		{
			"heading": "adapting-to-a-target",
			"content": "Purpose"
		},
		{
			"heading": "adapting-to-a-target",
			"content": "Runtime Adapters"
		},
		{
			"heading": "adapting-to-a-target",
			"content": "What an adapter is, the full matrix, choosing one"
		},
		{
			"heading": "adapting-to-a-target",
			"content": "Node/Bun Deployment"
		},
		{
			"heading": "adapting-to-a-target",
			"content": "Running on a Node or Bun runtime, single-binary output"
		},
		{
			"heading": "adapting-to-a-target",
			"content": "Serverless Deployment"
		},
		{
			"heading": "adapting-to-a-target",
			"content": "Function-based targets and their constraints"
		},
		{
			"heading": "adapting-to-a-target",
			"content": "Container Deployment"
		},
		{
			"heading": "adapting-to-a-target",
			"content": "Container images at scale"
		},
		{
			"heading": "adapting-to-a-target",
			"content": "Production Checklist"
		},
		{
			"heading": "adapting-to-a-target",
			"content": "Pre-deploy and operational checks"
		},
		{
			"heading": "whats-next",
			"content": "Runtime Adapters — understand the full matrix"
		},
		{
			"heading": "whats-next",
			"content": "Node/Bun Deployment — deploy to a Node or Bun runtime"
		},
		{
			"heading": "whats-next",
			"content": "Serverless Deployment — function-based targets and constraints"
		},
		{
			"heading": "whats-next",
			"content": "Production Checklist — pass every pre-deploy check"
		},
		{
			"heading": "whats-next",
			"content": "First Deployment — walk the loop from a fresh project"
		},
		{
			"heading": "whats-next",
			"content": "Observability — wire logs, traces, and metrics before you ship"
		}
	],
	"headings": [
		{
			"id": "how-deployment-works",
			"content": "How Deployment Works"
		},
		{
			"id": "selecting-an-adapter",
			"content": "Selecting an Adapter"
		},
		{
			"id": "the-build--preview--deploy-loop",
			"content": "The Build → Preview → Deploy Loop"
		},
		{
			"id": "scaffold-modes-map-to-adapters",
			"content": "Scaffold Modes Map to Adapters"
		},
		{
			"id": "which-target-should-you-choose",
			"content": "Which Target Should You Choose?"
		},
		{
			"id": "environment-variables-that-matter",
			"content": "Environment Variables That Matter"
		},
		{
			"id": "deploying",
			"content": "Deploying"
		},
		{
			"id": "adapting-to-a-target",
			"content": "Adapting to a Target"
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
		url: "#how-deployment-works",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "How Deployment Works" })
	},
	{
		depth: 3,
		url: "#selecting-an-adapter",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Selecting an Adapter" })
	},
	{
		depth: 2,
		url: "#the-build--preview--deploy-loop",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Build → Preview → Deploy Loop" })
	},
	{
		depth: 2,
		url: "#scaffold-modes-map-to-adapters",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Scaffold Modes Map to Adapters" })
	},
	{
		depth: 2,
		url: "#which-target-should-you-choose",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Which Target Should You Choose?" })
	},
	{
		depth: 2,
		url: "#environment-variables-that-matter",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Environment Variables That Matter" })
	},
	{
		depth: 2,
		url: "#deploying",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Deploying" })
	},
	{
		depth: 2,
		url: "#adapting-to-a-target",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Adapting to a Target" })
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
			"Kwiva follows ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "one codebase, many targets" }),
			". The same application you compose with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" files in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/" }),
			" compiles to a deployment artifact for a Node runtime, a Bun runtime, serverless platforms, edge platforms, container images, a prerendered static site, or a standalone binary — with zero application-code changes."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Deployment is a build-time decision, not a design constraint. You write models, controllers, middleware, and pages once against the framework API, and the target decides how the built output is boxed, shipped, and started. Swap from a shared Node host to a serverless function platform, or from a container fleet to a single binary, and the rebuild is the only change that moves." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "how-deployment-works",
			children: "How Deployment Works"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Deployment in Kwiva is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "build-time only" }),
			". Your app never knows where it will run; the target is decided when you build, not when you write code."
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
							children: " build"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "              # produce .output/ for the selected adapter"
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
							children: " preview"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "            # run the built artifact locally"
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
							children: " deploy"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " [provider]  "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "# push to a host — or run the artifact yourself"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build" }),
			" command runs the client build and the server build, then emits ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".output/" }),
			" containing ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "server/" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "public/" }),
			". The generated ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "server/" }),
			" entry is what every target actually runs:"
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
			title: "how-deployment-works.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: ".output/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  server/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "    index.mjs            the composed web-standard handler entry" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  public/" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "    ...                  rendered client assets, static files" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "That one entry is reinterpreted per target:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Target" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What runs" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Node runtime" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node .output/server/index.mjs" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Bun runtime" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "bun .output/server/index.mjs" }) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Container images" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The same entry inside a minimal runtime image" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Serverless and edge hosts" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The artifact is reinterpreted by the adapter into function output" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Single binary" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build --binary" }), " compiles everything into one executable"] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The application is always written against Web Standards — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Request" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Response" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fetch" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "WebSocket" }),
			" — so the runtime differences stay inside the framework. Whatever target you build for, the app sees the same request pipeline, the same context, and the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" surface."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "selecting-an-adapter",
			children: "Selecting an Adapter"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The adapter (deploy preset) is chosen at build time through one of four mechanisms:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Mechanism" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Where" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Notes" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--preset" }), " flag"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build --preset <preset>" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Explicit, per-build" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "preset env var" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Build environment" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Force a preset in CI" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deploy.preset" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva.config.ts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Committed default" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Auto-detection" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "CI" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Recognized platforms are detected automatically" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Explicit selections override auto-detection: if your continuous-integration runner is already recognized by a platform, you do not need to configure anything; if you want to pin a target or run a build outside a recognized pipeline, set the preset env var, pass ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--preset" }),
			", or commit ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "deploy.preset" }),
			" in your config file."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-build--preview--deploy-loop",
			children: "The Build → Preview → Deploy Loop"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva preview" }), " runs the built artifact locally, exactly as a host would. This is the fastest feedback loop before pushing anywhere:"] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva build [--preset] [--binary]" }), " — produce the artifact for a target"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva preview" }), " — sanity-check that artifact locally"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva deploy [provider]" }), " — push to a host, or run the artifact yourself"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"For a raw smoke test of a specific adapter, build with an explicit ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--preset" }),
			" and run the generated entry directly instead of deploying:"
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
							children: " build"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " --preset"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " node_server"
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
						children: "node"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#032F62",
							"--shiki-dark": "#9ECBFF"
						},
						children: " .output/server/index.mjs"
					})]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The same artifact is validated locally and then pushed, so the thing you tested is the thing that ships." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "scaffold-modes-map-to-adapters",
			children: "Scaffold Modes Map to Adapters"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The mode you choose at scaffold time selects a sensible default adapter:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Mode" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Default adapter" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What changes" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fullstack" }), " (default)"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Node runtime (auto-detected in CI)" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "SSR + API" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "api+spa" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Node runtime + client build only" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "No SSR renderer; SPA served" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "static" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Prerender everything; no server needed" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "standalone" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Bun runtime + compile" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Single-file, zero-dependency binary" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "edge" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Edge worker adapter" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Edge-safe constraint set applies" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"You are not locked into the scaffold default. A ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fullstack" }),
			" app can be built for serverless, containers, or a binary later; a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }),
			" build can be regenerated as a fullstack deployment if you add API routes. The mode is a starting default, and the adapter matrix is your way around it."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "which-target-should-you-choose",
			children: "Which Target Should You Choose?"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The matrix is large, but the decision usually collapses to what your operations team already runs:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "You have..." }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Build for..." }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Why" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A managed Node host or your own VM" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node_server" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Default production preset; simplest operations" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A Bun-capable host or a tiny artifact" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "bun-server" }),
					" or ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--binary" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Native runtime, single-file output" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Spiky, elastic traffic" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Serverless or edge" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Functions scale with demand, idle costs nothing" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "An orchestrator fleet" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Containers" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Images plus health probes, declarative scaling" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A mostly-read site" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "static" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Prerendered output, no server to operate" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The choice is never permanent. Because the adapter is a build-time property, you can move a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "node_server" }),
			" deployment to containers next quarter, or a fullstack site to static when its content stops changing daily — the rebuild is the only change that moves, and the artifact remains the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".output/" }),
			" contract you validated with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva preview" }),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "environment-variables-that-matter",
			children: "Environment Variables That Matter"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A small set of environment variables controls deployment behavior across targets:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Variable" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "KWIVA_PRESET" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Force a deploy preset in CI" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "KWIVA_APP_BASE_URL" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "baseURL" })
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Serve under a subpath" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "PORT" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Port for hosted platforms" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "KWIVA_API_SECRET" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Runtime config override pattern for the app config channel" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "KWIVA_TENANT_MODE" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "App-level tenancy default" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "KWIVA_DB_URL" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "App-level database connection" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "KWIVA_CACHE_URL" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "App-level cache connection" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Typed env access through ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env(...)" }),
			" validates required variables at boot, so a misconfigured production environment fails fast at startup rather than mid-request. Provider credentials used by ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva deploy" }),
			" are separate — they are injected as environment tokens at deploy time and never needed at runtime."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "deploying",
			children: "Deploying"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva deploy [provider]" }),
			" is a thin wrapper that runs the provider's own deploy path with your credentials, then prints the artifact digest and the deploy command it executed. Self-hosters skip the wrapper entirely: build with a preset, copy ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".output/" }),
			", and run the entry."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Rolling back is a pointer swap, not a code change. Keep N previous builds; managed platforms roll back by environment, and self-hosters keep a tar of ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".output/" }),
			". Deployment artifacts are therefore immutable — you never recompile in production, you repoint to a previous build."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "adapting-to-a-target",
			children: "Adapting to a Target"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Page" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/adapters",
				children: "Runtime Adapters"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "What an adapter is, the full matrix, choosing one" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/node-bun",
				children: "Node/Bun Deployment"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Running on a Node or Bun runtime, single-binary output" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/serverless",
				children: "Serverless Deployment"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Function-based targets and their constraints" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/containers",
				children: "Container Deployment"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Container images at scale" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/production-checklist",
				children: "Production Checklist"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Pre-deploy and operational checks" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/adapters",
				children: "Runtime Adapters"
			}), " — understand the full matrix"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/node-bun",
				children: "Node/Bun Deployment"
			}), " — deploy to a Node or Bun runtime"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/serverless",
				children: "Serverless Deployment"
			}), " — function-based targets and constraints"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/production-checklist",
				children: "Production Checklist"
			}), " — pass every pre-deploy check"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/first-deployment",
				children: "First Deployment"
			}), " — walk the loop from a fresh project"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability",
				children: "Observability"
			}), " — wire logs, traces, and metrics before you ship"] }),
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
