# Container Deployment (/docs/deployment/containers)



## Overview [#overview]

Container deployment is self-hosting the built artifact: you build with a runtime preset, place `.output/` into a minimal runtime image, and let an orchestrator run and scale it. It is the clearest expression of Kwiva's stateless multi-instance model — every instance is identical and disposable, and shared state lives outside the container.

A container fleet is just many copies of the same immutable artifact. Because the app kernel holds no durable state, each copy can be created, destroyed, or replaced at any moment without a correctness loss — the orchestrator's only job is keeping the right number of identical replicas in front of traffic.

## Build the Artifact [#build-the-artifact]

Containers use the runtime presets. Choose based on what your base image and clusters can run:

```bash title="terminal"
kwiva build --preset node_server   # portable Node entry
kwiva build --preset bun-server    # Bun runtime entry
```

The build emits `.output/` with `server/` and `public/`. Only the runtime, the entry module, and the public assets need to reach the image.

## Assemble a Minimal Runtime Image [#assemble-a-minimal-runtime-image]

| Step        | Action                                                                                                   |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| 1. Build    | `kwiva build --preset node_server` (or the Bun preset)                                                   |
| 2. Assemble | Copy `.output/` into a minimal runtime image — runtime binary plus `server/` and `public/`, nothing else |
| 3. Startup  | Run the generated entry — `node .output/server/index.mjs` or its Bun equivalent                          |
| 4. Port     | Honor the `PORT` env var set by the orchestrator                                                         |
| 5. Health   | Expose `/healthz` for liveness and readiness probes                                                      |

A representative image (Node case):

```dockerfile title="assemble-a-minimal-runtime-image.Dockerfile"
FROM node:22-slim
WORKDIR /app
COPY .output/ .output/
ENV PORT=3000
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

Keeping the image minimal matters twice over: it is faster to pull across fleets, and it reduces the attack surface of what you run in production. A smaller mounted filesystem also shortens cold-pull on scale-out, so instance churn stays cheap.

## Startup Command [#startup-command]

The container's startup command is just the entry module:

```text title="startup-command.txt"
node .output/server/index.mjs
```

The same command that worked under `kwiva preview` is the command the container runs. No supervisor is required inside the image — the process managers and health probes of your orchestrator do that job outside the container. Keeping orchestration concerns out of the image (no init wrappers, no cron daemons, no process managers) preserves the single-responsibility contract: the image runs the app, the orchestrator manages the fleet.

The Node and Bun presets produce different images, and the choice should match what your clusters support. The Bun runtime gives you the framework's primary-runtime fast paths inside the image; the Node runtime gives you the most portable `.mjs` entry across managed Kubernetes distributions and serverless-on-container offerings. You can also change base runtimes later without touching application code — the image is assembled from the same artifact either way.

## Single Binary in a Container [#single-binary-in-a-container]

For the leanest possible image, skip the runtime base image entirely and compile the binary:

```bash title="terminal"
kwiva build --binary
# copy the resulting executable into a distroless or scratch image
```

When the base image is minimal — distroless or scratch — target the musl or generic flavor of the binary so it links cleanly against the bare image's libc. The same syntax-only minification guidance from the binary path applies: keep `--minify-syntax` semantics so function names survive for tracing in the container, and remember the binary requires an AVX2-capable CPU. Deployment then reduces to copying one executable into a nearly empty image and running it behind the orchestrator's health probes.

## Migrations on Boot [#migrations-on-boot]

Migrations are applied with `kwiva db:migrate` and ordered deterministically — module migrations run before application migrations, each versioned by module version. What deserves a decision: **where** migrations run when you have scaled instances.

Run migrations as a single, explicit step in the release pipeline rather than letting every scaled instance race to apply the same migration on boot:

| Strategy                    | When to use                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| Release-step migration      | Run `kwiva db:migrate` as a one-off job before rolling new instances                          |
| Dedicated migrator instance | A single short-lived task runs migrations, then exits                                         |
| Boot-time drift check       | The kernel warns on migration drift during boot — in development this surfaces problems early |

The framework checks the model IR against the database at boot and warns when the schema has drifted, so a release that forgot its migration step fails loudly rather than silently. That drift check is a warning in production, not a hard stop — long-running environments should treat it as an incident trigger and reconcile the migration step separately.

For non-additive schema changes, apply the release-order discipline deliberately: run backward-compatible migrations ahead of the new code, double-write during the transition window, and drop the old shape in a later release — never let scaled instances discover the incompatibility at boot.

## Scaling Instances and Shared Stores [#scaling-instances-and-shared-stores]

Kwiva is **stateless multi-instance by construction**: all state lives in external services, so any instance can serve any request. Distributed agility depends on three shared stores:

| State    | Store                                                                                 | Why externalize                                        |
| -------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Sessions | Pluggable session store (cookie, shared broker, or database backends)                 | Any instance must resolve a session started on another |
| Cache    | Cache mounts (memory, shared broker, or key-value backends) via `src/config/cache.ts` | Cache hits must be shared fleet-wide                   |
| Files    | Storage disks (local or object-storage compatible) via `src/config/storage.ts`        | Uploaded files must be reachable from every instance   |

Instance memory holds nothing durable. When the orchestrator scales to zero or restarts a node, requests simply land on fresh instances that read shared state. Connect those three stores to shared infrastructure before you scale past a single instance:

* Sessions to the same pluggable session store all replicas read.
* The cache to a shared broker or key-value backend — a memory mount is dev-only.
* The storage disk to an object-storage-compatible backend — the local disk is for development.

## Health Checks and Lifecycle [#health-checks-and-lifecycle]

* `/healthz` answers liveness and readiness probes — wire both to your orchestrator.
* Liveness keeps instances alive; readiness gates traffic until the instance can accept requests after boot-time checks (engine init, provider boot) complete.
* Graceful shutdown is inverted boot: providers stop, the queue drains, the engine stops, the process exits. Background flush-out is bounded so shutdown never hangs.
* Queue workers and the scheduler run as separate deployment units — see [Background Work](/docs/background-work) for running workers and scheduled tasks at scale.

The health contract matters because orchestrators act on it: a failing readiness check stops traffic to a sick instance, a liveness failure replaces it, and graceful shutdown orders the drain so in-flight requests finish before the process exits.

## What's Next [#whats-next]

* [Runtime Adapters](/docs/deployment/adapters) — pick the preset your image will run
* [Node/Bun Deployment](/docs/deployment/node-bun) — the entry points and env vars a container uses
* [Serverless Deployment](/docs/deployment/serverless) — the alternative for elastic, function-based hosting
* [Production Checklist](/docs/deployment/production-checklist) — harden multi-instance deployments
* [Background Work](/docs/background-work) — run queue workers and the scheduler alongside the web fleet
