import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/auth/index.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Authentication",
	"description": "Sign-up, sign-in, sessions, OAuth, passkeys and magic links through one defineAuth surface backed by a hidden auth engine."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\nAuthentication in Kwiva is built around `defineAuth`. A single file in `src/app/http/auth.ts` describes every sign-in path your application exposes — email and password, OAuth, passkeys, and magic links — plus how sessions behave, which model stores users, and what happens at key lifecycle moments like sign-up and sign-in. The machinery behind it all is a sealed, framework-owned session engine: your application code only ever imports `@kwiva/auth` and the conventions it exports. No engine wiring, no hand-rolled password hashing, no session tables to maintain by hand, and no drift between the auth surface you configure and the routes, middleware, and client hooks the framework generates from it.\n\nThe auth engine is deliberately opaque. The framework owns the protocol details — credential verification, token signing, session bookkeeping, OAuth handshakes — so the decision surface you interact with stays small and stable. What you configure in `defineAuth` is the complete contract: which providers exist, how long sessions live, which model holds users, and what the framework should do at the moments the identity lifecycle changes. Everything downstream, from the typed `ctx.session` in a controller to the `useSession()` hook in a page, is derived from that one definition.\n\n## Overview [#overview]\n\nEverything auth-shaped flows from one declarative definition:\n\n```plaintext title=\"overview.txt\"\nsrc/app/http/auth.ts  →  defineAuth({ providers, session, user, hooks })\n```\n\n* **Providers** — enable password, OAuth, passkeys, and magic-link sign-in. Each provider is independent, toggled with `enabled`, and stackable onto a single unified identity.\n* **Sessions** — choose a store backend, lifetime, and cookie policy; a typed `ctx.session` is injected into every handler and page. Expiry is sliding, revocation is instant, and the concrete store never changes how application code reads the session.\n* **User model** — point auth at any model that declares the auth fields; the engine adds its own managed columns automatically at migration time. Password hashes, session references, OAuth accounts, and passkey credentials all appear without you writing them.\n* **Hooks** — react to `onSignUp`, `onSignIn`, and `onDeleteUser` with jobs, events, or records. Hooks fire consistently across every provider, so a framework-managed sign-in flow invokes your code exactly once per lifecycle event.\n* **Generated surface** — from this one file the framework generates the complete credential API (`/auth/sign-up`, `/auth/sign-in`, `/auth/sign-out`, `/auth/session`), wires auth-ready middleware into the HTTP pipeline, and exposes a `useSession()` hook to the frontend.\n\nThe remainder of this page walks the pieces, and the sibling pages go deep on configuration, providers, sessions, protection, and client usage.\n\n## The Provider Model [#the-provider-model]\n\n`defineAuth` composes providers independently. Every provider can be toggled with `enabled`, configured with provider-specific options, and stacked together — a user can sign in with a password today and a passkey tomorrow, all through the same session machinery:\n\n| Provider            | Example config                               | Status |\n| ------------------- | -------------------------------------------- | ------ |\n| Password            | `password: { enabled: true, minLength: 10 }` | v1     |\n| OAuth               | `oauth: { google: {...}, github: true }`     | v1     |\n| Passkeys (WebAuthn) | `passkeys: { enabled: true }`                | v1.x   |\n| Magic link / email  | `magicLink: { enabled: true }`               | v1.x   |\n\nUnlisted providers are simply absent — no routes registered, no dependencies pulled in, no UI to account for. Because every provider funnels into the same session machinery, the method a user chose does not change what `ctx.session` looks like: a Google sign-in and a password sign-in produce the same typed identity, the same policy decisions, and the same `role`.\n\n> \\[!TIP]\n> Start with the password provider and add OAuth (or later, passkeys and magic links) when the product needs them. Providers are additive — enabling a new one extends the generated surface without touching existing session or policy code.\n\n## Configured Once, Use Everywhere [#configured-once-use-everywhere]\n\n`defineAuth` follows the same configuration rules as every `defineX` factory: it accepts full inline configuration, inline options win over the config folder, and the surface shrinks to match whatever you declare. Leave out OAuth and no OAuth routes exist; leave out passkeys and no WebAuthn endpoints are mounted. The framework derives four things from the definition that every other layer consumes:\n\n1. **Routes** — the generated credential endpoints, mounted by the engine behind the owned HTTP pipeline.\n2. **Middleware** — the `auth` middleware, applying `requireAuth` semantics to the requests it protects.\n3. **Type inference** — the session user shape flows from the `fields` mapping into controllers, loaders, and hooks.\n4. **Sessions** — the strategy (`database`, `cookie`, or `jwt`), lifetime, and cookie policy your product wants.\n\nSecrets never live in the definition file. OAuth credentials are read through `env(...)`, the typed environment accessor that validates every key at boot, and `kwiva key:generate` provisions the signing keys the auth layer needs.\n\n## Where Auth Runs in the Pipeline [#where-auth-runs-in-the-pipeline]\n\nAuthentication slots into the request lifecycle at a well-defined point. During context assembly, cookies are decoded and the session is loaded by the engine's store — the step responsible for turning a session cookie into a typed identity. Then, at the guard stage, middleware such as `auth` decides whether the request may continue:\n\n```plaintext title=\"where-auth-runs-in-the-pipeline.txt\"\nrequest\n  → context assembly: session load from database/redis store\n  → validation\n  → beforeHandle: auth guard, tenant resolution, policy checks\n  → handler\n```\n\nThe session is resolved once per request and reused by everything downstream — tenant resolution, request logging, audit fields, and permission checks all draw on the same identity. Session plus tenant resolution together carry a target of under 2ms on a warm database or Redis hit, so the auth layer is not a meaningful contributor to base latency when the store is well-configured. Route caching short-circuits before session load, so public ISR pages skip authentication entirely and never pay for what they do not need.\n\n## Sessions, Typed End to End [#sessions-typed-end-to-end]\n\nThe session is the contract between the auth layer and everything else in the framework. On the server it arrives as `ctx.session` — fully typed as either a user payload or `null` — inside controllers, middleware, loaders, and services. On the client the `useSession()` hook exposes the same identity reactively. Revocation, expiry, and cookie behavior are configured once in `defineAuth` and honored by every surface, including the typed RPC client, whose session cookies flow automatically on every call.\n\nBecause the session shape is inferred from the `fields` mapping, renaming a model field surfaces type errors at every touchpoint rather than allowing stringly-typed lookups to drift. The store backend — database, Redis, or cookie — is chosen in `src/config/session.ts` and never changes application code: `ctx.session` looks identical no matter where the session actually lives. Expiry is sliding, so active users stay signed in while idle sessions age out, and revocation is immediate because the store is shared and externalized across instances.\n\n## Built-In Route Protection [#built-in-route-protection]\n\nAuthentication alone is not authorization. Kwiva gives you two complementary guards: the `auth` middleware, which implements `requireAuth` semantics and returns a `401` when no session exists, and page-level `beforeLoad` guards, which redirect unauthenticated visitors before a page renders. Combine them with policy-backed permission checks for full, layered protections — identity first, then capability, then tenant scope. See [Protecting Routes](/docs/auth/protecting-routes) for the layering guidance and [Authorization](/docs/authorization) for what happens after identity is established.\n\n## Generated Endpoints [#generated-endpoints]\n\nToggling a provider is all it takes to expose its routes:\n\n| Endpoint                                                  | Purpose                                         |\n| --------------------------------------------------------- | ----------------------------------------------- |\n| `POST /auth/sign-up` · `/auth/sign-in` · `/auth/sign-out` | Credential flows                                |\n| `GET /auth/oauth/:provider` · callback                    | OAuth handshake                                 |\n| `GET /auth/session`                                       | Current session (typed)                         |\n| `POST /auth/passkeys/*`                                   | WebAuthn registration and authentication (v1.x) |\n| Middleware `auth`                                         | `requireAuth` semantics, returns `401`          |\n\nAuth routes are rate-limited by default through `src/config/api.ts`, so brute-force attempts on credential endpoints are throttled without configuration.\n\n## Security Posture [#security-posture]\n\nAuth ships hardened without extra work:\n\n* **Password hashing** — an engine-level argon2id policy, combined with the configurable `minLength` floor.\n* **Enumeration resistance** — `UNAUTHORIZED` is returned for both an unknown email and a wrong password, so sign-in responses never leak which accounts exist.\n* **CSRF protection** — session-token double-submit via the `csrf` middleware, enabled by default on form routes.\n* **Cookie hardening** — `httpOnly`, `sameSite: 'lax'`, and `secure` are the defaults for the session cookie.\n* **Rate limiting** — auth endpoints are throttled by default, with the shared config as the tuning point.\n\n## Quick Start [#quick-start]\n\n```ts title=\"src/app/http/auth.ts\"\n// src/app/http/auth.ts\nimport { defineAuth } from '@kwiva/auth'\n\nexport default defineAuth({\n  providers: {\n    password: { enabled: true, minLength: 10 },\n  },\n  user: {\n    model: 'users',\n    fields: { email: 'email', name: 'name', role: 'role' },\n  },\n})\n```\n\nPoint it at a model that declares the auth fields (`email`, `name`, `role`) — the engine-managed columns such as password hashes, session references, and OAuth accounts are added automatically at migration time. Run `kwiva db:migrate`, then sign up at `POST /auth/sign-up` and read the session back at `GET /auth/session`. From there, `ctx.session` is available in every handler and `useSession()` in every page.\n\n## What's Next [#whats-next]\n\n* [Auth Configuration](/docs/auth/configuration) — full `defineAuth` reference for providers, sessions, and hooks\n* [Sessions](/docs/auth/sessions) — session lifetime, stores, and revocation\n* [Auth Providers](/docs/auth/providers) — each provider in depth\n* [Protecting Routes](/docs/auth/protecting-routes) — `requireAuth` middleware and page guards\n* [Client-Side Auth](/docs/auth/client-usage) — `useSession()` in the frontend\n* [Default Protections](/docs/security/default-protections) — the security posture auth participates in\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Authentication in Kwiva is built around `defineAuth`. A single file in `src/app/http/auth.ts` describes every sign-in path your application exposes — email and password, OAuth, passkeys, and magic links — plus how sessions behave, which model stores users, and what happens at key lifecycle moments like sign-up and sign-in. The machinery behind it all is a sealed, framework-owned session engine: your application code only ever imports `@kwiva/auth` and the conventions it exports. No engine wiring, no hand-rolled password hashing, no session tables to maintain by hand, and no drift between the auth surface you configure and the routes, middleware, and client hooks the framework generates from it."
		},
		{
			"heading": void 0,
			"content": "The auth engine is deliberately opaque. The framework owns the protocol details — credential verification, token signing, session bookkeeping, OAuth handshakes — so the decision surface you interact with stays small and stable. What you configure in `defineAuth` is the complete contract: which providers exist, how long sessions live, which model holds users, and what the framework should do at the moments the identity lifecycle changes. Everything downstream, from the typed `ctx.session` in a controller to the `useSession()` hook in a page, is derived from that one definition."
		},
		{
			"heading": "overview",
			"content": "Everything auth-shaped flows from one declarative definition:"
		},
		{
			"heading": "overview",
			"content": "**Providers** — enable password, OAuth, passkeys, and magic-link sign-in. Each provider is independent, toggled with `enabled`, and stackable onto a single unified identity."
		},
		{
			"heading": "overview",
			"content": "**Sessions** — choose a store backend, lifetime, and cookie policy; a typed `ctx.session` is injected into every handler and page. Expiry is sliding, revocation is instant, and the concrete store never changes how application code reads the session."
		},
		{
			"heading": "overview",
			"content": "**User model** — point auth at any model that declares the auth fields; the engine adds its own managed columns automatically at migration time. Password hashes, session references, OAuth accounts, and passkey credentials all appear without you writing them."
		},
		{
			"heading": "overview",
			"content": "**Hooks** — react to `onSignUp`, `onSignIn`, and `onDeleteUser` with jobs, events, or records. Hooks fire consistently across every provider, so a framework-managed sign-in flow invokes your code exactly once per lifecycle event."
		},
		{
			"heading": "overview",
			"content": "**Generated surface** — from this one file the framework generates the complete credential API (`/auth/sign-up`, `/auth/sign-in`, `/auth/sign-out`, `/auth/session`), wires auth-ready middleware into the HTTP pipeline, and exposes a `useSession()` hook to the frontend."
		},
		{
			"heading": "overview",
			"content": "The remainder of this page walks the pieces, and the sibling pages go deep on configuration, providers, sessions, protection, and client usage."
		},
		{
			"heading": "the-provider-model",
			"content": "`defineAuth` composes providers independently. Every provider can be toggled with `enabled`, configured with provider-specific options, and stacked together — a user can sign in with a password today and a passkey tomorrow, all through the same session machinery:"
		},
		{
			"heading": "the-provider-model",
			"content": "Provider"
		},
		{
			"heading": "the-provider-model",
			"content": "Example config"
		},
		{
			"heading": "the-provider-model",
			"content": "Status"
		},
		{
			"heading": "the-provider-model",
			"content": "Password"
		},
		{
			"heading": "the-provider-model",
			"content": "`password: { enabled: true, minLength: 10 }`"
		},
		{
			"heading": "the-provider-model",
			"content": "v1"
		},
		{
			"heading": "the-provider-model",
			"content": "OAuth"
		},
		{
			"heading": "the-provider-model",
			"content": "`oauth: { google: {...}, github: true }`"
		},
		{
			"heading": "the-provider-model",
			"content": "v1"
		},
		{
			"heading": "the-provider-model",
			"content": "Passkeys (WebAuthn)"
		},
		{
			"heading": "the-provider-model",
			"content": "`passkeys: { enabled: true }`"
		},
		{
			"heading": "the-provider-model",
			"content": "v1.x"
		},
		{
			"heading": "the-provider-model",
			"content": "Magic link / email"
		},
		{
			"heading": "the-provider-model",
			"content": "`magicLink: { enabled: true }`"
		},
		{
			"heading": "the-provider-model",
			"content": "v1.x"
		},
		{
			"heading": "the-provider-model",
			"content": "Unlisted providers are simply absent — no routes registered, no dependencies pulled in, no UI to account for. Because every provider funnels into the same session machinery, the method a user chose does not change what `ctx.session` looks like: a Google sign-in and a password sign-in produce the same typed identity, the same policy decisions, and the same `role`."
		},
		{
			"heading": "the-provider-model",
			"content": "> \\[!TIP]\n> Start with the password provider and add OAuth (or later, passkeys and magic links) when the product needs them. Providers are additive — enabling a new one extends the generated surface without touching existing session or policy code."
		},
		{
			"heading": "configured-once-use-everywhere",
			"content": "`defineAuth` follows the same configuration rules as every `defineX` factory: it accepts full inline configuration, inline options win over the config folder, and the surface shrinks to match whatever you declare. Leave out OAuth and no OAuth routes exist; leave out passkeys and no WebAuthn endpoints are mounted. The framework derives four things from the definition that every other layer consumes:"
		},
		{
			"heading": "configured-once-use-everywhere",
			"content": "**Routes** — the generated credential endpoints, mounted by the engine behind the owned HTTP pipeline."
		},
		{
			"heading": "configured-once-use-everywhere",
			"content": "**Middleware** — the `auth` middleware, applying `requireAuth` semantics to the requests it protects."
		},
		{
			"heading": "configured-once-use-everywhere",
			"content": "**Type inference** — the session user shape flows from the `fields` mapping into controllers, loaders, and hooks."
		},
		{
			"heading": "configured-once-use-everywhere",
			"content": "**Sessions** — the strategy (`database`, `cookie`, or `jwt`), lifetime, and cookie policy your product wants."
		},
		{
			"heading": "configured-once-use-everywhere",
			"content": "Secrets never live in the definition file. OAuth credentials are read through `env(...)`, the typed environment accessor that validates every key at boot, and `kwiva key:generate` provisions the signing keys the auth layer needs."
		},
		{
			"heading": "where-auth-runs-in-the-pipeline",
			"content": "Authentication slots into the request lifecycle at a well-defined point. During context assembly, cookies are decoded and the session is loaded by the engine's store — the step responsible for turning a session cookie into a typed identity. Then, at the guard stage, middleware such as `auth` decides whether the request may continue:"
		},
		{
			"heading": "where-auth-runs-in-the-pipeline",
			"content": "The session is resolved once per request and reused by everything downstream — tenant resolution, request logging, audit fields, and permission checks all draw on the same identity. Session plus tenant resolution together carry a target of under 2ms on a warm database or Redis hit, so the auth layer is not a meaningful contributor to base latency when the store is well-configured. Route caching short-circuits before session load, so public ISR pages skip authentication entirely and never pay for what they do not need."
		},
		{
			"heading": "sessions-typed-end-to-end",
			"content": "The session is the contract between the auth layer and everything else in the framework. On the server it arrives as `ctx.session` — fully typed as either a user payload or `null` — inside controllers, middleware, loaders, and services. On the client the `useSession()` hook exposes the same identity reactively. Revocation, expiry, and cookie behavior are configured once in `defineAuth` and honored by every surface, including the typed RPC client, whose session cookies flow automatically on every call."
		},
		{
			"heading": "sessions-typed-end-to-end",
			"content": "Because the session shape is inferred from the `fields` mapping, renaming a model field surfaces type errors at every touchpoint rather than allowing stringly-typed lookups to drift. The store backend — database, Redis, or cookie — is chosen in `src/config/session.ts` and never changes application code: `ctx.session` looks identical no matter where the session actually lives. Expiry is sliding, so active users stay signed in while idle sessions age out, and revocation is immediate because the store is shared and externalized across instances."
		},
		{
			"heading": "built-in-route-protection",
			"content": "Authentication alone is not authorization. Kwiva gives you two complementary guards: the `auth` middleware, which implements `requireAuth` semantics and returns a `401` when no session exists, and page-level `beforeLoad` guards, which redirect unauthenticated visitors before a page renders. Combine them with policy-backed permission checks for full, layered protections — identity first, then capability, then tenant scope. See Protecting Routes for the layering guidance and Authorization for what happens after identity is established."
		},
		{
			"heading": "generated-endpoints",
			"content": "Toggling a provider is all it takes to expose its routes:"
		},
		{
			"heading": "generated-endpoints",
			"content": "Endpoint"
		},
		{
			"heading": "generated-endpoints",
			"content": "Purpose"
		},
		{
			"heading": "generated-endpoints",
			"content": "`POST /auth/sign-up` · `/auth/sign-in` · `/auth/sign-out`"
		},
		{
			"heading": "generated-endpoints",
			"content": "Credential flows"
		},
		{
			"heading": "generated-endpoints",
			"content": "`GET /auth/oauth/:provider` · callback"
		},
		{
			"heading": "generated-endpoints",
			"content": "OAuth handshake"
		},
		{
			"heading": "generated-endpoints",
			"content": "`GET /auth/session`"
		},
		{
			"heading": "generated-endpoints",
			"content": "Current session (typed)"
		},
		{
			"heading": "generated-endpoints",
			"content": "`POST /auth/passkeys/*`"
		},
		{
			"heading": "generated-endpoints",
			"content": "WebAuthn registration and authentication (v1.x)"
		},
		{
			"heading": "generated-endpoints",
			"content": "Middleware `auth`"
		},
		{
			"heading": "generated-endpoints",
			"content": "`requireAuth` semantics, returns `401`"
		},
		{
			"heading": "generated-endpoints",
			"content": "Auth routes are rate-limited by default through `src/config/api.ts`, so brute-force attempts on credential endpoints are throttled without configuration."
		},
		{
			"heading": "security-posture",
			"content": "Auth ships hardened without extra work:"
		},
		{
			"heading": "security-posture",
			"content": "**Password hashing** — an engine-level argon2id policy, combined with the configurable `minLength` floor."
		},
		{
			"heading": "security-posture",
			"content": "**Enumeration resistance** — `UNAUTHORIZED` is returned for both an unknown email and a wrong password, so sign-in responses never leak which accounts exist."
		},
		{
			"heading": "security-posture",
			"content": "**CSRF protection** — session-token double-submit via the `csrf` middleware, enabled by default on form routes."
		},
		{
			"heading": "security-posture",
			"content": "**Cookie hardening** — `httpOnly`, `sameSite: 'lax'`, and `secure` are the defaults for the session cookie."
		},
		{
			"heading": "security-posture",
			"content": "**Rate limiting** — auth endpoints are throttled by default, with the shared config as the tuning point."
		},
		{
			"heading": "quick-start",
			"content": "Point it at a model that declares the auth fields (`email`, `name`, `role`) — the engine-managed columns such as password hashes, session references, and OAuth accounts are added automatically at migration time. Run `kwiva db:migrate`, then sign up at `POST /auth/sign-up` and read the session back at `GET /auth/session`. From there, `ctx.session` is available in every handler and `useSession()` in every page."
		},
		{
			"heading": "whats-next",
			"content": "Auth Configuration — full `defineAuth` reference for providers, sessions, and hooks"
		},
		{
			"heading": "whats-next",
			"content": "Sessions — session lifetime, stores, and revocation"
		},
		{
			"heading": "whats-next",
			"content": "Auth Providers — each provider in depth"
		},
		{
			"heading": "whats-next",
			"content": "Protecting Routes — `requireAuth` middleware and page guards"
		},
		{
			"heading": "whats-next",
			"content": "Client-Side Auth — `useSession()` in the frontend"
		},
		{
			"heading": "whats-next",
			"content": "Default Protections — the security posture auth participates in"
		}
	],
	"headings": [
		{
			"id": "overview",
			"content": "Overview"
		},
		{
			"id": "the-provider-model",
			"content": "The Provider Model"
		},
		{
			"id": "configured-once-use-everywhere",
			"content": "Configured Once, Use Everywhere"
		},
		{
			"id": "where-auth-runs-in-the-pipeline",
			"content": "Where Auth Runs in the Pipeline"
		},
		{
			"id": "sessions-typed-end-to-end",
			"content": "Sessions, Typed End to End"
		},
		{
			"id": "built-in-route-protection",
			"content": "Built-In Route Protection"
		},
		{
			"id": "generated-endpoints",
			"content": "Generated Endpoints"
		},
		{
			"id": "security-posture",
			"content": "Security Posture"
		},
		{
			"id": "quick-start",
			"content": "Quick Start"
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
		url: "#overview",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Overview" })
	},
	{
		depth: 2,
		url: "#the-provider-model",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Provider Model" })
	},
	{
		depth: 2,
		url: "#configured-once-use-everywhere",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Configured Once, Use Everywhere" })
	},
	{
		depth: 2,
		url: "#where-auth-runs-in-the-pipeline",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Where Auth Runs in the Pipeline" })
	},
	{
		depth: 2,
		url: "#sessions-typed-end-to-end",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Sessions, Typed End to End" })
	},
	{
		depth: 2,
		url: "#built-in-route-protection",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Built-In Route Protection" })
	},
	{
		depth: 2,
		url: "#generated-endpoints",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Generated Endpoints" })
	},
	{
		depth: 2,
		url: "#security-posture",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Security Posture" })
	},
	{
		depth: 2,
		url: "#quick-start",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Quick Start" })
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
			"Authentication in Kwiva is built around ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineAuth" }),
			". A single file in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/auth.ts" }),
			" describes every sign-in path your application exposes — email and password, OAuth, passkeys, and magic links — plus how sessions behave, which model stores users, and what happens at key lifecycle moments like sign-up and sign-in. The machinery behind it all is a sealed, framework-owned session engine: your application code only ever imports ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/auth" }),
			" and the conventions it exports. No engine wiring, no hand-rolled password hashing, no session tables to maintain by hand, and no drift between the auth surface you configure and the routes, middleware, and client hooks the framework generates from it."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The auth engine is deliberately opaque. The framework owns the protocol details — credential verification, token signing, session bookkeeping, OAuth handshakes — so the decision surface you interact with stays small and stable. What you configure in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineAuth" }),
			" is the complete contract: which providers exist, how long sessions live, which model holds users, and what the framework should do at the moments the identity lifecycle changes. Everything downstream, from the typed ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session" }),
			" in a controller to the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useSession()" }),
			" hook in a page, is derived from that one definition."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "overview",
			children: "Overview"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Everything auth-shaped flows from one declarative definition:" }),
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
			title: "overview.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
				className: "line",
				children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "src/app/http/auth.ts  →  defineAuth({ providers, session, user, hooks })" })
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Providers" }),
				" — enable password, OAuth, passkeys, and magic-link sign-in. Each provider is independent, toggled with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "enabled" }),
				", and stackable onto a single unified identity."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Sessions" }),
				" — choose a store backend, lifetime, and cookie policy; a typed ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session" }),
				" is injected into every handler and page. Expiry is sliding, revocation is instant, and the concrete store never changes how application code reads the session."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "User model" }), " — point auth at any model that declares the auth fields; the engine adds its own managed columns automatically at migration time. Password hashes, session references, OAuth accounts, and passkey credentials all appear without you writing them."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Hooks" }),
				" — react to ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onSignUp" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onSignIn" }),
				", and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onDeleteUser" }),
				" with jobs, events, or records. Hooks fire consistently across every provider, so a framework-managed sign-in flow invokes your code exactly once per lifecycle event."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Generated surface" }),
				" — from this one file the framework generates the complete credential API (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/auth/sign-up" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/auth/sign-in" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/auth/sign-out" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/auth/session" }),
				"), wires auth-ready middleware into the HTTP pipeline, and exposes a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useSession()" }),
				" hook to the frontend."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The remainder of this page walks the pieces, and the sibling pages go deep on configuration, providers, sessions, protection, and client usage." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-provider-model",
			children: "The Provider Model"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineAuth" }),
			" composes providers independently. Every provider can be toggled with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "enabled" }),
			", configured with provider-specific options, and stacked together — a user can sign in with a password today and a passkey tomorrow, all through the same session machinery:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Provider" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Example config" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Status" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Password" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "password: { enabled: true, minLength: 10 }" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "v1" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "OAuth" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "oauth: { google: {...}, github: true }" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "v1" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Passkeys (WebAuthn)" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "passkeys: { enabled: true }" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "v1.x" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Magic link / email" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "magicLink: { enabled: true }" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "v1.x" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Unlisted providers are simply absent — no routes registered, no dependencies pulled in, no UI to account for. Because every provider funnels into the same session machinery, the method a user chose does not change what ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session" }),
			" looks like: a Google sign-in and a password sign-in produce the same typed identity, the same policy decisions, and the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "role" }),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "[!TIP]\nStart with the password provider and add OAuth (or later, passkeys and magic links) when the product needs them. Providers are additive — enabling a new one extends the generated surface without touching existing session or policy code." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "configured-once-use-everywhere",
			children: "Configured Once, Use Everywhere"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineAuth" }),
			" follows the same configuration rules as every ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" factory: it accepts full inline configuration, inline options win over the config folder, and the surface shrinks to match whatever you declare. Leave out OAuth and no OAuth routes exist; leave out passkeys and no WebAuthn endpoints are mounted. The framework derives four things from the definition that every other layer consumes:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Routes" }), " — the generated credential endpoints, mounted by the engine behind the owned HTTP pipeline."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Middleware" }),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "auth" }),
				" middleware, applying ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requireAuth" }),
				" semantics to the requests it protects."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Type inference" }),
				" — the session user shape flows from the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fields" }),
				" mapping into controllers, loaders, and hooks."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Sessions" }),
				" — the strategy (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "database" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cookie" }),
				", or ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "jwt" }),
				"), lifetime, and cookie policy your product wants."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Secrets never live in the definition file. OAuth credentials are read through ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env(...)" }),
			", the typed environment accessor that validates every key at boot, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva key:generate" }),
			" provisions the signing keys the auth layer needs."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "where-auth-runs-in-the-pipeline",
			children: "Where Auth Runs in the Pipeline"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Authentication slots into the request lifecycle at a well-defined point. During context assembly, cookies are decoded and the session is loaded by the engine's store — the step responsible for turning a session cookie into a typed identity. Then, at the guard stage, middleware such as ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "auth" }),
			" decides whether the request may continue:"
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
			title: "where-auth-runs-in-the-pipeline.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "request" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → context assembly: session load from database/redis store" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → validation" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → beforeHandle: auth guard, tenant resolution, policy checks" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "  → handler" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The session is resolved once per request and reused by everything downstream — tenant resolution, request logging, audit fields, and permission checks all draw on the same identity. Session plus tenant resolution together carry a target of under 2ms on a warm database or Redis hit, so the auth layer is not a meaningful contributor to base latency when the store is well-configured. Route caching short-circuits before session load, so public ISR pages skip authentication entirely and never pay for what they do not need." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "sessions-typed-end-to-end",
			children: "Sessions, Typed End to End"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The session is the contract between the auth layer and everything else in the framework. On the server it arrives as ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session" }),
			" — fully typed as either a user payload or ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "null" }),
			" — inside controllers, middleware, loaders, and services. On the client the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useSession()" }),
			" hook exposes the same identity reactively. Revocation, expiry, and cookie behavior are configured once in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineAuth" }),
			" and honored by every surface, including the typed RPC client, whose session cookies flow automatically on every call."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because the session shape is inferred from the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fields" }),
			" mapping, renaming a model field surfaces type errors at every touchpoint rather than allowing stringly-typed lookups to drift. The store backend — database, Redis, or cookie — is chosen in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/session.ts" }),
			" and never changes application code: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session" }),
			" looks identical no matter where the session actually lives. Expiry is sliding, so active users stay signed in while idle sessions age out, and revocation is immediate because the store is shared and externalized across instances."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "built-in-route-protection",
			children: "Built-In Route Protection"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Authentication alone is not authorization. Kwiva gives you two complementary guards: the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "auth" }),
			" middleware, which implements ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requireAuth" }),
			" semantics and returns a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "401" }),
			" when no session exists, and page-level ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeLoad" }),
			" guards, which redirect unauthenticated visitors before a page renders. Combine them with policy-backed permission checks for full, layered protections — identity first, then capability, then tenant scope. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/auth/protecting-routes",
				children: "Protecting Routes"
			}),
			" for the layering guidance and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization",
				children: "Authorization"
			}),
			" for what happens after identity is established."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "generated-endpoints",
			children: "Generated Endpoints"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Toggling a provider is all it takes to expose its routes:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Endpoint" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "POST /auth/sign-up" }),
				" · ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/auth/sign-in" }),
				" · ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/auth/sign-out" })
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Credential flows" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "GET /auth/oauth/:provider" }), " · callback"] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "OAuth handshake" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "GET /auth/session" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Current session (typed)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "POST /auth/passkeys/*" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "WebAuthn registration and authentication (v1.x)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Middleware ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "auth" })] }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requireAuth" }),
				" semantics, returns ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "401" })
			] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Auth routes are rate-limited by default through ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/api.ts" }),
			", so brute-force attempts on credential endpoints are throttled without configuration."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "security-posture",
			children: "Security Posture"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Auth ships hardened without extra work:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Password hashing" }),
				" — an engine-level argon2id policy, combined with the configurable ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "minLength" }),
				" floor."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Enumeration resistance" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "UNAUTHORIZED" }),
				" is returned for both an unknown email and a wrong password, so sign-in responses never leak which accounts exist."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "CSRF protection" }),
				" — session-token double-submit via the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "csrf" }),
				" middleware, enabled by default on form routes."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Cookie hardening" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "httpOnly" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "sameSite: 'lax'" }),
				", and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "secure" }),
				" are the defaults for the session cookie."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Rate limiting" }), " — auth endpoints are throttled by default, with the shared config as the tuning point."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "quick-start",
			children: "Quick Start"
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
			title: "src/app/http/auth.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/app/http/auth.ts"
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
							children: " { defineAuth } "
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
							children: " '@kwiva/auth'"
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
							children: " defineAuth"
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
						children: "  providers: {"
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
							children: "    password: { enabled: "
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
							children: ", minLength: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "10"
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
						children: "  user: {"
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
							children: "    model: "
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
							children: "    fields: { email: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'email'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", name: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'name'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", role: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'role'"
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Point it at a model that declares the auth fields (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "email" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "name" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "role" }),
			") — the engine-managed columns such as password hashes, session references, and OAuth accounts are added automatically at migration time. Run ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva db:migrate" }),
			", then sign up at ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "POST /auth/sign-up" }),
			" and read the session back at ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "GET /auth/session" }),
			". From there, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session" }),
			" is available in every handler and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useSession()" }),
			" in every page."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/auth/configuration",
					children: "Auth Configuration"
				}),
				" — full ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineAuth" }),
				" reference for providers, sessions, and hooks"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/auth/sessions",
				children: "Sessions"
			}), " — session lifetime, stores, and revocation"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/auth/providers",
				children: "Auth Providers"
			}), " — each provider in depth"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/auth/protecting-routes",
					children: "Protecting Routes"
				}),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requireAuth" }),
				" middleware and page guards"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/auth/client-usage",
					children: "Client-Side Auth"
				}),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useSession()" }),
				" in the frontend"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/default-protections",
				children: "Default Protections"
			}), " — the security posture auth participates in"] }),
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
