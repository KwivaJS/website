# Welcome to Kwiva (/blog/welcome-to-kwiva)



Kwiva is the batteries-included TypeScript framework that replaces the stitched-together stack. Instead of assembling a dozen libraries — a router, a data layer, auth, a build tool, a client, an admin UI — your application talks to one coherent framework: a framework-owned `@kwiva/*` API surface, a single configuration model, one CLI, and a Rust-speed toolchain for instant feedback.

Today we're opening up the documentation for **v0.3**, the first full picture of the framework's surface.

## What Kwiva ships [#what-kwiva-ships]

* **Models as the single source of truth.** One `defineModel` declaration derives your database schema, migrations, seeders, REST API, typed RPC client, admin UI, OpenAPI spec, and MCP tools. No drift, no duplicate schemas.
* **An owned HTTP layer.** Controllers, middleware, guards, validation, and a full request lifecycle — with types flowing end to end.
* **A typed file-based frontend.** `definePage` with loaders, streaming SSR, deferred data, hydration, and data hooks over a shared client cache.
* **Platform primitives built in.** Auth, authorization policies, tenancy, background jobs, scheduled tasks, events, realtime channels, and a generated Studio.
* **Deploy anywhere, zero lock-in.** One codebase builds for servers, edge functions, serverless providers, static output, and single-binary artifacts — the target is a build-time choice.

## The one-grammar idea [#the-one-grammar-idea]

Every app-facing construct is a `defineX` factory. Models, controllers, pages, jobs, events, tasks, policies — they all follow the same shape. Learn one, and you've learned them all. It's the reason a Kwiva codebase reads like a product description instead of a wiring diagram.

## Where to start [#where-to-start]

* **[Get Started](/docs/getting-started)** — install Kwiva and create your first project
* **[The defineX Convention](/docs/core-concepts/definex)** — the grammar behind everything
* **[Architecture](/architecture)** — the layered design in detail
* **[API Reference](/api)** — every package, signature, and example

The documentation will keep growing. If something's missing or confusing, the framework's GitHub issues are the fastest way to tell us.

Welcome to Kwiva.
