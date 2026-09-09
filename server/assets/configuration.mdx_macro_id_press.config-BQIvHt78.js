import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/auth/configuration.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Auth Configuration",
	"description": "The complete defineAuth reference — providers, session strategy and cookies, the user model contract, and lifecycle hooks."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\n`defineAuth` is the single configuration point for authentication in Kwiva. Every option described below is optional — the smallest valid definition enables the password provider, and every other section fills in sensible defaults. When your definition is missing, the framework-generated surface shrinks to match: no OAuth routes without an OAuth provider, no passkey endpoints without passkeys enabled. What remains is a small, stable decision surface backed by a sealed, framework-owned auth engine that handles the protocol details you never want to hand-roll.\n\nThe factory lives in `src/app/http/auth.ts` and is discovered by convention — the file's presence is what mounts the auth handler behind the owned HTTP pipeline. The shape mirrors other `defineX` factories: options can be supplied inline (which win), defaults fill gaps, and the inferred types flow into the rest of the application.\n\n## The Full Surface [#the-full-surface]\n\n```ts title=\"src/app/http/auth.ts\"\n// src/app/http/auth.ts\nimport { defineAuth } from '@kwiva/auth'\n\nexport default defineAuth({\n  providers: {\n    password: { enabled: true, minLength: 10 },\n    oauth: {\n      google: { clientId: env('GOOGLE_CLIENT_ID'), secret: env('GOOGLE_SECRET') },\n      github: true,\n    },\n    passkeys: { enabled: true },           // v1.x\n    magicLink: { enabled: true },          // v1.x (needs mail)\n  },\n  session: {\n    strategy: 'database',                  // database | cookie | jwt\n    expiresIn: 60 * 60 * 24 * 7,\n    cookie: { httpOnly: true, sameSite: 'lax', secure: true },\n  },\n  user: {\n    model: 'users',                        // model must define auth fields\n    fields: { email: 'email', name: 'name', role: 'role' },\n    verifyEmail: true,                     // v1.x (needs mail)\n  },\n  hooks: {\n    onSignUp: async ({ user }) => SendWelcome.dispatch({ userId: user.id }),\n    onSignIn: async ({ user }) => SignedIn.emit({ userId: user.id }),\n    onDeleteUser: async ({ user }) => { ... },\n  },\n})\n```\n\nEach block controls a different part of the identity lifecycle: `providers` starts the sign-in methods, `session` decides how identity persists between requests, `user` binds accounts to a model, and `hooks` lets you run application logic at the seams of that lifecycle.\n\n## Providers [#providers]\n\nThe `providers` map is where sign-in methods are enabled and tuned. Like every `defineX` definition, it accepts full inline configuration, and inline values win over anything set in the config folder.\n\n* **password** — `enabled` turns the credential flow on; `minLength` is when you tighten the framework's password policy beyond its default. Passwords are hashed with an engine-level argon2id policy the framework owns — plaintext never persists and never appears in logs.\n* **oauth** — a per-provider map. Google takes explicit `clientId` and `secret` (almost always read through `env()`), while `github: true` opts into defaults driven by environment variables. The list is open — any OAuth provider listed here gets `GET /auth/oauth/:provider` plus its callback route. OAuth accounts are stored in engine-managed columns on the user model, so the identity that results is indistinguishable from a password-created account.\n* **passkeys** — WebAuthn support for devices that register credentials. Registration and authentication endpoints mount under `/auth/passkeys/*`. Available in v1.x.\n* **magicLink** — passwordless sign-in via emailed links. The mailed token is single-use and delivered out of band, so there is no password to leak or reset. Available in v1.x and requires a mail integration.\n\nMultiple providers compose freely. Users are not locked to the method they first used; a session is a session regardless of how it was created. The engine-managed columns track which credentials belong to which account, so a mixed-method user is one row, one identity, one `ctx.session`.\n\n## Sessions [#sessions]\n\nThe `session` block controls how an authenticated identity is persisted between requests.\n\n### Strategy [#strategy]\n\n| Strategy             | Behavior                                                   |\n| -------------------- | ---------------------------------------------------------- |\n| `database` (default) | Sessions stored in the session store, referenced by cookie |\n| `cookie`             | Session payload carried directly in the cookie             |\n| `jwt`                | Signed token authenticated on each request                 |\n\nThe strategy determines where the authoritative session record lives, not what your code reads — `ctx.session` has the same shape under every strategy. `database` is the default because it makes sessions queryable: revocation, sign-out everywhere, expiry sweeps, and device listing are all plain operations against the store. `cookie` trades the lookup for a signed client-side payload, and `jwt` verifies a signed token per request. Whichever you choose, the store backend itself is configured separately in `src/config/session.ts`.\n\n### Expiry [#expiry]\n\n`expiresIn` sets the session lifetime in milliseconds — the example above is seven days. Expiry is sliding: each successful request extends the window, so active users stay signed in while dormant sessions age out. An actively used session never lapses mid-work, while an abandoned session eventually dies without anyone having to remember to revoke it.\n\n### Cookie policy [#cookie-policy]\n\nThe `cookie` object mirrors the flags any hardened session cookie should carry: `httpOnly` keeps the token out of scripts, `sameSite: 'lax'` balances CSRF protection with usable redirect flows, and `secure` restricts transmission to HTTPS. These are defaults you can relax only when you know what you are trading away.\n\n### Session store [#session-store]\n\nThe concrete storage backend is configured separately in `src/config/session.ts`, with `database` as the default and `redis` and `cookie` as alternatives. The store choice does not change application code — `ctx.session` looks the same no matter where the session actually lives, which is what keeps the store swappable as an app grows from a single instance to many.\n\n## The User Model Contract [#the-user-model-contract]\n\n`user.model` names the model backing accounts, and `user.fields` maps the model's columns onto the auth identity. The model must declare the auth fields you map (`email`, `name`, `role`) — the rest is managed for you:\n\n```ts title=\"the-user-model-contract.ts\"\ndefineModel('users', (f) => ({\n  id: f.id(),\n  email: f.string().unique(),\n  name: f.string(),\n  role: f.enum('user', 'admin').default('user').indexed(),\n  // engine-managed columns (added automatically at migration time):\n  // password_hash, session references, oauth accounts, passkey credentials\n}), { timestamps: true, permission: 'users' })\n```\n\nBecause the model is the single source of truth, migration files pick up the managed columns automatically — the password hash column, the session references, and any OAuth or passkey account tables are added before you ever migrate. The `permission: 'users'` option additionally ties account management to a policy namespace, so admin surfaces that touch users inherit the same authorization as everything else.\n\n### Field mapping and type inference [#field-mapping-and-type-inference]\n\nThe `fields` mapping is where your model's column names map onto the framework's notion of an identity. `email`, `name`, and `role` are the fields the session payload ships. Because the mapping is typed, the user shape that reaches `ctx.session` and `useSession()` is inferred from your model — `session.user.role` is statically typed in every controller and middleware, and renaming a field surfaces a type error everywhere it matters instead of a silent miss.\n\n`verifyEmail: true` (v1.x) adds the flagged-verified column and requires a mail integration to send the confirmation. It composes with the `magicLink` provider, which reuses the same delivery channel.\n\n## Hooks [#hooks]\n\nLifecycle hooks let you run application logic at the seams of the auth flow. They receive a typed event payload and may be synchronous or asynchronous:\n\n* **onSignUp** — runs after an account is created. A natural place to dispatch a welcome job, as shown above with `SendWelcome`.\n* **onSignIn** — runs after every successful sign-in. Emit events or record activity.\n* **onDeleteUser** — runs when an account is removed, for cleanup of related data.\n\nHooks keep auth code out of your handlers: the framework fires them consistently across every provider, so a magic-link sign-in and a password sign-in both trigger `onSignIn` exactly once. There is no per-provider duplication to maintain, and the payloads are typed from the user model, so the hook body can rely on the same field names the rest of the app uses.\n\n> \\[!NOTE]\n> Hooks are for reactive work — dispatch a job or emit an event. Long synchronous work inside a hook blocks the auth response; prefer dispatching to the background worker where the work is not time-critical.\n\n## Environment-Backed Secrets [#environment-backed-secrets]\n\nSecrets never live in the definition file. OAuth credentials are read with `env('GOOGLE_CLIENT_ID')`, the typed environment accessor that validates every key at boot — a missing variable is a friendly startup error, not a runtime surprise. The same pattern covers cookies, session store URLs, and mail credentials. `kwiva key:generate` provisions the signing keys the auth layer needs, and key rotation follows the standard workflow for the signing material — issue a new key, let the old one expire naturally.\n\n## Security Defaults [#security-defaults]\n\nAuth ships hardened without extra work:\n\n* **Password hashing** — an engine-level hashing policy (argon2id) combined with the configured `minLength`.\n* **Rate limiting** — auth routes are rate-limited by default via `src/config/api.ts`, throttling brute-force attempts on credential endpoints.\n* **Enumeration-safe errors** — `UNAUTHORIZED` is returned for both an unknown email and a wrong password, so sign-in responses never leak which accounts exist.\n* **CSRF** — session-token double-submit protection is enabled by default on form routes through the `csrf` middleware. Forms authenticate by sending both the session cookie and a matching token; mismatches are rejected before any handler runs.\n\nTogether these defaults cover the common auth attack surface — credential stuffing, account enumeration, cross-site request forgery, and cookie interception — without configuration.\n\n## What's Next [#whats-next]\n\n* [Sessions](/docs/auth/sessions) — session lifetime, stores, and revocation in depth\n* [Auth Providers](/docs/auth/providers) — what each provider offers and how to stack them\n* [Protecting Routes](/docs/auth/protecting-routes) — securing middleware, controllers, and pages\n* [Models](/docs/data/models) — the `defineModel` surface behind the user contract\n* [Default Protections](/docs/security/default-protections) — rate limiting, CSRF, and the rest of the security posture\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "`defineAuth` is the single configuration point for authentication in Kwiva. Every option described below is optional — the smallest valid definition enables the password provider, and every other section fills in sensible defaults. When your definition is missing, the framework-generated surface shrinks to match: no OAuth routes without an OAuth provider, no passkey endpoints without passkeys enabled. What remains is a small, stable decision surface backed by a sealed, framework-owned auth engine that handles the protocol details you never want to hand-roll."
		},
		{
			"heading": void 0,
			"content": "The factory lives in `src/app/http/auth.ts` and is discovered by convention — the file's presence is what mounts the auth handler behind the owned HTTP pipeline. The shape mirrors other `defineX` factories: options can be supplied inline (which win), defaults fill gaps, and the inferred types flow into the rest of the application."
		},
		{
			"heading": "the-full-surface",
			"content": "Each block controls a different part of the identity lifecycle: `providers` starts the sign-in methods, `session` decides how identity persists between requests, `user` binds accounts to a model, and `hooks` lets you run application logic at the seams of that lifecycle."
		},
		{
			"heading": "providers",
			"content": "The `providers` map is where sign-in methods are enabled and tuned. Like every `defineX` definition, it accepts full inline configuration, and inline values win over anything set in the config folder."
		},
		{
			"heading": "providers",
			"content": "**password** — `enabled` turns the credential flow on; `minLength` is when you tighten the framework's password policy beyond its default. Passwords are hashed with an engine-level argon2id policy the framework owns — plaintext never persists and never appears in logs."
		},
		{
			"heading": "providers",
			"content": "**oauth** — a per-provider map. Google takes explicit `clientId` and `secret` (almost always read through `env()`), while `github: true` opts into defaults driven by environment variables. The list is open — any OAuth provider listed here gets `GET /auth/oauth/:provider` plus its callback route. OAuth accounts are stored in engine-managed columns on the user model, so the identity that results is indistinguishable from a password-created account."
		},
		{
			"heading": "providers",
			"content": "**passkeys** — WebAuthn support for devices that register credentials. Registration and authentication endpoints mount under `/auth/passkeys/*`. Available in v1.x."
		},
		{
			"heading": "providers",
			"content": "**magicLink** — passwordless sign-in via emailed links. The mailed token is single-use and delivered out of band, so there is no password to leak or reset. Available in v1.x and requires a mail integration."
		},
		{
			"heading": "providers",
			"content": "Multiple providers compose freely. Users are not locked to the method they first used; a session is a session regardless of how it was created. The engine-managed columns track which credentials belong to which account, so a mixed-method user is one row, one identity, one `ctx.session`."
		},
		{
			"heading": "sessions",
			"content": "The `session` block controls how an authenticated identity is persisted between requests."
		},
		{
			"heading": "strategy",
			"content": "Strategy"
		},
		{
			"heading": "strategy",
			"content": "Behavior"
		},
		{
			"heading": "strategy",
			"content": "`database` (default)"
		},
		{
			"heading": "strategy",
			"content": "Sessions stored in the session store, referenced by cookie"
		},
		{
			"heading": "strategy",
			"content": "`cookie`"
		},
		{
			"heading": "strategy",
			"content": "Session payload carried directly in the cookie"
		},
		{
			"heading": "strategy",
			"content": "`jwt`"
		},
		{
			"heading": "strategy",
			"content": "Signed token authenticated on each request"
		},
		{
			"heading": "strategy",
			"content": "The strategy determines where the authoritative session record lives, not what your code reads — `ctx.session` has the same shape under every strategy. `database` is the default because it makes sessions queryable: revocation, sign-out everywhere, expiry sweeps, and device listing are all plain operations against the store. `cookie` trades the lookup for a signed client-side payload, and `jwt` verifies a signed token per request. Whichever you choose, the store backend itself is configured separately in `src/config/session.ts`."
		},
		{
			"heading": "expiry",
			"content": "`expiresIn` sets the session lifetime in milliseconds — the example above is seven days. Expiry is sliding: each successful request extends the window, so active users stay signed in while dormant sessions age out. An actively used session never lapses mid-work, while an abandoned session eventually dies without anyone having to remember to revoke it."
		},
		{
			"heading": "cookie-policy",
			"content": "The `cookie` object mirrors the flags any hardened session cookie should carry: `httpOnly` keeps the token out of scripts, `sameSite: 'lax'` balances CSRF protection with usable redirect flows, and `secure` restricts transmission to HTTPS. These are defaults you can relax only when you know what you are trading away."
		},
		{
			"heading": "session-store",
			"content": "The concrete storage backend is configured separately in `src/config/session.ts`, with `database` as the default and `redis` and `cookie` as alternatives. The store choice does not change application code — `ctx.session` looks the same no matter where the session actually lives, which is what keeps the store swappable as an app grows from a single instance to many."
		},
		{
			"heading": "the-user-model-contract",
			"content": "`user.model` names the model backing accounts, and `user.fields` maps the model's columns onto the auth identity. The model must declare the auth fields you map (`email`, `name`, `role`) — the rest is managed for you:"
		},
		{
			"heading": "the-user-model-contract",
			"content": "Because the model is the single source of truth, migration files pick up the managed columns automatically — the password hash column, the session references, and any OAuth or passkey account tables are added before you ever migrate. The `permission: 'users'` option additionally ties account management to a policy namespace, so admin surfaces that touch users inherit the same authorization as everything else."
		},
		{
			"heading": "field-mapping-and-type-inference",
			"content": "The `fields` mapping is where your model's column names map onto the framework's notion of an identity. `email`, `name`, and `role` are the fields the session payload ships. Because the mapping is typed, the user shape that reaches `ctx.session` and `useSession()` is inferred from your model — `session.user.role` is statically typed in every controller and middleware, and renaming a field surfaces a type error everywhere it matters instead of a silent miss."
		},
		{
			"heading": "field-mapping-and-type-inference",
			"content": "`verifyEmail: true` (v1.x) adds the flagged-verified column and requires a mail integration to send the confirmation. It composes with the `magicLink` provider, which reuses the same delivery channel."
		},
		{
			"heading": "hooks",
			"content": "Lifecycle hooks let you run application logic at the seams of the auth flow. They receive a typed event payload and may be synchronous or asynchronous:"
		},
		{
			"heading": "hooks",
			"content": "**onSignUp** — runs after an account is created. A natural place to dispatch a welcome job, as shown above with `SendWelcome`."
		},
		{
			"heading": "hooks",
			"content": "**onSignIn** — runs after every successful sign-in. Emit events or record activity."
		},
		{
			"heading": "hooks",
			"content": "**onDeleteUser** — runs when an account is removed, for cleanup of related data."
		},
		{
			"heading": "hooks",
			"content": "Hooks keep auth code out of your handlers: the framework fires them consistently across every provider, so a magic-link sign-in and a password sign-in both trigger `onSignIn` exactly once. There is no per-provider duplication to maintain, and the payloads are typed from the user model, so the hook body can rely on the same field names the rest of the app uses."
		},
		{
			"heading": "hooks",
			"content": "> \\[!NOTE]\n> Hooks are for reactive work — dispatch a job or emit an event. Long synchronous work inside a hook blocks the auth response; prefer dispatching to the background worker where the work is not time-critical."
		},
		{
			"heading": "environment-backed-secrets",
			"content": "Secrets never live in the definition file. OAuth credentials are read with `env('GOOGLE_CLIENT_ID')`, the typed environment accessor that validates every key at boot — a missing variable is a friendly startup error, not a runtime surprise. The same pattern covers cookies, session store URLs, and mail credentials. `kwiva key:generate` provisions the signing keys the auth layer needs, and key rotation follows the standard workflow for the signing material — issue a new key, let the old one expire naturally."
		},
		{
			"heading": "security-defaults",
			"content": "Auth ships hardened without extra work:"
		},
		{
			"heading": "security-defaults",
			"content": "**Password hashing** — an engine-level hashing policy (argon2id) combined with the configured `minLength`."
		},
		{
			"heading": "security-defaults",
			"content": "**Rate limiting** — auth routes are rate-limited by default via `src/config/api.ts`, throttling brute-force attempts on credential endpoints."
		},
		{
			"heading": "security-defaults",
			"content": "**Enumeration-safe errors** — `UNAUTHORIZED` is returned for both an unknown email and a wrong password, so sign-in responses never leak which accounts exist."
		},
		{
			"heading": "security-defaults",
			"content": "**CSRF** — session-token double-submit protection is enabled by default on form routes through the `csrf` middleware. Forms authenticate by sending both the session cookie and a matching token; mismatches are rejected before any handler runs."
		},
		{
			"heading": "security-defaults",
			"content": "Together these defaults cover the common auth attack surface — credential stuffing, account enumeration, cross-site request forgery, and cookie interception — without configuration."
		},
		{
			"heading": "whats-next",
			"content": "Sessions — session lifetime, stores, and revocation in depth"
		},
		{
			"heading": "whats-next",
			"content": "Auth Providers — what each provider offers and how to stack them"
		},
		{
			"heading": "whats-next",
			"content": "Protecting Routes — securing middleware, controllers, and pages"
		},
		{
			"heading": "whats-next",
			"content": "Models — the `defineModel` surface behind the user contract"
		},
		{
			"heading": "whats-next",
			"content": "Default Protections — rate limiting, CSRF, and the rest of the security posture"
		}
	],
	"headings": [
		{
			"id": "the-full-surface",
			"content": "The Full Surface"
		},
		{
			"id": "providers",
			"content": "Providers"
		},
		{
			"id": "sessions",
			"content": "Sessions"
		},
		{
			"id": "strategy",
			"content": "Strategy"
		},
		{
			"id": "expiry",
			"content": "Expiry"
		},
		{
			"id": "cookie-policy",
			"content": "Cookie policy"
		},
		{
			"id": "session-store",
			"content": "Session store"
		},
		{
			"id": "the-user-model-contract",
			"content": "The User Model Contract"
		},
		{
			"id": "field-mapping-and-type-inference",
			"content": "Field mapping and type inference"
		},
		{
			"id": "hooks",
			"content": "Hooks"
		},
		{
			"id": "environment-backed-secrets",
			"content": "Environment-Backed Secrets"
		},
		{
			"id": "security-defaults",
			"content": "Security Defaults"
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
		url: "#the-full-surface",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Full Surface" })
	},
	{
		depth: 2,
		url: "#providers",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Providers" })
	},
	{
		depth: 2,
		url: "#sessions",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Sessions" })
	},
	{
		depth: 3,
		url: "#strategy",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Strategy" })
	},
	{
		depth: 3,
		url: "#expiry",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Expiry" })
	},
	{
		depth: 3,
		url: "#cookie-policy",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Cookie policy" })
	},
	{
		depth: 3,
		url: "#session-store",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Session store" })
	},
	{
		depth: 2,
		url: "#the-user-model-contract",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The User Model Contract" })
	},
	{
		depth: 3,
		url: "#field-mapping-and-type-inference",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Field mapping and type inference" })
	},
	{
		depth: 2,
		url: "#hooks",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Hooks" })
	},
	{
		depth: 2,
		url: "#environment-backed-secrets",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Environment-Backed Secrets" })
	},
	{
		depth: 2,
		url: "#security-defaults",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Security Defaults" })
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineAuth" }), " is the single configuration point for authentication in Kwiva. Every option described below is optional — the smallest valid definition enables the password provider, and every other section fills in sensible defaults. When your definition is missing, the framework-generated surface shrinks to match: no OAuth routes without an OAuth provider, no passkey endpoints without passkeys enabled. What remains is a small, stable decision surface backed by a sealed, framework-owned auth engine that handles the protocol details you never want to hand-roll."] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The factory lives in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/http/auth.ts" }),
			" and is discovered by convention — the file's presence is what mounts the auth handler behind the owned HTTP pipeline. The shape mirrors other ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" factories: options can be supplied inline (which win), defaults fill gaps, and the inferred types flow into the rest of the application."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-full-surface",
			children: "The Full Surface"
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
						children: "    oauth: {"
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
							children: "      google: { clientId: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "env"
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
							children: "'GOOGLE_CLIENT_ID'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "), secret: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "env"
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
							children: "'GOOGLE_SECRET'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ") },"
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
							children: "      github: "
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
						children: "    },"
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
							children: "    passkeys: { enabled: "
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
							children: " },           "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// v1.x"
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
							children: "    magicLink: { enabled: "
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
							children: " },          "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// v1.x (needs mail)"
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
						children: "  session: {"
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
							children: "    strategy: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'database'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",                  "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// database | cookie | jwt"
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
							children: "    expiresIn: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "60"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " *"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " 60"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " *"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " 24"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " *"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " 7"
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
							children: "    cookie: { httpOnly: "
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
							children: ", sameSite: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'lax'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", secure: "
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
							children: ",                        "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// model must define auth fields"
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "    verifyEmail: "
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
							children: ",                     "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// v1.x (needs mail)"
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
						children: "  hooks: {"
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
							children: "    onSignUp"
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
							children: "user"
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
							children: " SendWelcome."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "dispatch"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ userId: user.id }),"
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
							children: "    onSignIn"
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
							children: "user"
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
							children: " SignedIn."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "emit"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "({ userId: user.id }),"
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
							children: "    onDeleteUser"
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
							children: "user"
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
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "..."
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
			"Each block controls a different part of the identity lifecycle: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "providers" }),
			" starts the sign-in methods, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "session" }),
			" decides how identity persists between requests, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "user" }),
			" binds accounts to a model, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "hooks" }),
			" lets you run application logic at the seams of that lifecycle."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "providers",
			children: "Providers"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "providers" }),
			" map is where sign-in methods are enabled and tuned. Like every ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" definition, it accepts full inline configuration, and inline values win over anything set in the config folder."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "password" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "enabled" }),
				" turns the credential flow on; ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "minLength" }),
				" is when you tighten the framework's password policy beyond its default. Passwords are hashed with an engine-level argon2id policy the framework owns — plaintext never persists and never appears in logs."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "oauth" }),
				" — a per-provider map. Google takes explicit ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "clientId" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "secret" }),
				" (almost always read through ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env()" }),
				"), while ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "github: true" }),
				" opts into defaults driven by environment variables. The list is open — any OAuth provider listed here gets ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "GET /auth/oauth/:provider" }),
				" plus its callback route. OAuth accounts are stored in engine-managed columns on the user model, so the identity that results is indistinguishable from a password-created account."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "passkeys" }),
				" — WebAuthn support for devices that register credentials. Registration and authentication endpoints mount under ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/auth/passkeys/*" }),
				". Available in v1.x."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "magicLink" }), " — passwordless sign-in via emailed links. The mailed token is single-use and delivered out of band, so there is no password to leak or reset. Available in v1.x and requires a mail integration."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Multiple providers compose freely. Users are not locked to the method they first used; a session is a session regardless of how it was created. The engine-managed columns track which credentials belong to which account, so a mixed-method user is one row, one identity, one ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session" }),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "sessions",
			children: "Sessions"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "session" }),
			" block controls how an authenticated identity is persisted between requests."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "strategy",
			children: "Strategy"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Strategy" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Behavior" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "database" }), " (default)"] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Sessions stored in the session store, referenced by cookie" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cookie" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Session payload carried directly in the cookie" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "jwt" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Signed token authenticated on each request" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The strategy determines where the authoritative session record lives, not what your code reads — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session" }),
			" has the same shape under every strategy. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "database" }),
			" is the default because it makes sessions queryable: revocation, sign-out everywhere, expiry sweeps, and device listing are all plain operations against the store. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cookie" }),
			" trades the lookup for a signed client-side payload, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "jwt" }),
			" verifies a signed token per request. Whichever you choose, the store backend itself is configured separately in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/session.ts" }),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "expiry",
			children: "Expiry"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "expiresIn" }), " sets the session lifetime in milliseconds — the example above is seven days. Expiry is sliding: each successful request extends the window, so active users stay signed in while dormant sessions age out. An actively used session never lapses mid-work, while an abandoned session eventually dies without anyone having to remember to revoke it."] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "cookie-policy",
			children: "Cookie policy"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cookie" }),
			" object mirrors the flags any hardened session cookie should carry: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "httpOnly" }),
			" keeps the token out of scripts, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "sameSite: 'lax'" }),
			" balances CSRF protection with usable redirect flows, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "secure" }),
			" restricts transmission to HTTPS. These are defaults you can relax only when you know what you are trading away."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "session-store",
			children: "Session store"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The concrete storage backend is configured separately in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/session.ts" }),
			", with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "database" }),
			" as the default and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "redis" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cookie" }),
			" as alternatives. The store choice does not change application code — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session" }),
			" looks the same no matter where the session actually lives, which is what keeps the store swappable as an app grows from a single instance to many."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-user-model-contract",
			children: "The User Model Contract"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "user.model" }),
			" names the model backing accounts, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "user.fields" }),
			" maps the model's columns onto the auth identity. The model must declare the auth fields you map (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "email" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "name" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "role" }),
			") — the rest is managed for you:"
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
			title: "the-user-model-contract.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "defineModel"
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
							children: "  email: f."
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
							children: "unique"
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
							children: "  name: f."
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
							children: "  role: f."
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
							children: "'user'"
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
							children: "'admin'"
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
							children: "'user'"
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "  // engine-managed columns (added automatically at migration time):"
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
						children: "  // password_hash, session references, oauth accounts, passkey credentials"
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
							children: "'users'"
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Because the model is the single source of truth, migration files pick up the managed columns automatically — the password hash column, the session references, and any OAuth or passkey account tables are added before you ever migrate. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "permission: 'users'" }),
			" option additionally ties account management to a policy namespace, so admin surfaces that touch users inherit the same authorization as everything else."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "field-mapping-and-type-inference",
			children: "Field mapping and type inference"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fields" }),
			" mapping is where your model's column names map onto the framework's notion of an identity. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "email" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "name" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "role" }),
			" are the fields the session payload ships. Because the mapping is typed, the user shape that reaches ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useSession()" }),
			" is inferred from your model — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "session.user.role" }),
			" is statically typed in every controller and middleware, and renaming a field surfaces a type error everywhere it matters instead of a silent miss."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "verifyEmail: true" }),
			" (v1.x) adds the flagged-verified column and requires a mail integration to send the confirmation. It composes with the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "magicLink" }),
			" provider, which reuses the same delivery channel."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "hooks",
			children: "Hooks"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Lifecycle hooks let you run application logic at the seams of the auth flow. They receive a typed event payload and may be synchronous or asynchronous:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "onSignUp" }),
				" — runs after an account is created. A natural place to dispatch a welcome job, as shown above with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "SendWelcome" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "onSignIn" }), " — runs after every successful sign-in. Emit events or record activity."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "onDeleteUser" }), " — runs when an account is removed, for cleanup of related data."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Hooks keep auth code out of your handlers: the framework fires them consistently across every provider, so a magic-link sign-in and a password sign-in both trigger ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onSignIn" }),
			" exactly once. There is no per-provider duplication to maintain, and the payloads are typed from the user model, so the hook body can rely on the same field names the rest of the app uses."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "[!NOTE]\nHooks are for reactive work — dispatch a job or emit an event. Long synchronous work inside a hook blocks the auth response; prefer dispatching to the background worker where the work is not time-critical." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "environment-backed-secrets",
			children: "Environment-Backed Secrets"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Secrets never live in the definition file. OAuth credentials are read with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env('GOOGLE_CLIENT_ID')" }),
			", the typed environment accessor that validates every key at boot — a missing variable is a friendly startup error, not a runtime surprise. The same pattern covers cookies, session store URLs, and mail credentials. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "kwiva key:generate" }),
			" provisions the signing keys the auth layer needs, and key rotation follows the standard workflow for the signing material — issue a new key, let the old one expire naturally."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "security-defaults",
			children: "Security Defaults"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Auth ships hardened without extra work:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Password hashing" }),
				" — an engine-level hashing policy (argon2id) combined with the configured ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "minLength" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Rate limiting" }),
				" — auth routes are rate-limited by default via ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/api.ts" }),
				", throttling brute-force attempts on credential endpoints."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Enumeration-safe errors" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "UNAUTHORIZED" }),
				" is returned for both an unknown email and a wrong password, so sign-in responses never leak which accounts exist."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "CSRF" }),
				" — session-token double-submit protection is enabled by default on form routes through the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "csrf" }),
				" middleware. Forms authenticate by sending both the session cookie and a matching token; mismatches are rejected before any handler runs."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Together these defaults cover the common auth attack surface — credential stuffing, account enumeration, cross-site request forgery, and cookie interception — without configuration." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/auth/sessions",
				children: "Sessions"
			}), " — session lifetime, stores, and revocation in depth"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/auth/providers",
				children: "Auth Providers"
			}), " — what each provider offers and how to stack them"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/auth/protecting-routes",
				children: "Protecting Routes"
			}), " — securing middleware, controllers, and pages"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/data/models",
					children: "Models"
				}),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" }),
				" surface behind the user contract"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/default-protections",
				children: "Default Protections"
			}), " — rate limiting, CSRF, and the rest of the security posture"] }),
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
