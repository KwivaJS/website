import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/auth/sessions.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Sessions",
	"description": "Typed ctx.session on the server, useSession() on the client, session lifetime, cookie policy, store backends, and revocation."
};
var lastModified = /* @__PURE__ */ new Date(178896021e4);
var _markdown = "\n\nA session is the currency of authentication: once a user signs in, a session represents that identity to every middleware, controller, loader, and page until it expires or is revoked. Kwiva makes the session a typed, first-class value across both sides of the stack, so you check identity the same way everywhere instead of hand-rolling cookie parsing. The session machinery — storage, signing, expiry, revocation — belongs to a sealed, framework-owned auth engine; your code only reads and acts on the result.\n\nSessions ride through the request lifecycle at a defined point. During context assembly, cookies are decoded and the session is loaded from the configured store (database or Redis by default), then the resolved identity is reused by everything downstream — tenant resolution, logging, audit fields, and permission checks all draw on the same `ctx.session` rather than re-reading cookies.\n\n## The Typed Server Session [#the-typed-server-session]\n\nEvery request that passes through the session middleware carries a `ctx.session` — typed as either a user payload or `null`, never an untyped blob:\n\n```ts title=\"the-typed-server-session.ts\"\nconst { session } = ctx // typed: { user: { id, email, role } | null }\n```\n\nA route that requires identity simply reads it:\n\n```ts title=\"the-typed-server-session-2.ts\"\ndefineMiddleware('auth', async (ctx, next) => {\n  if (!ctx.session.user) return error('UNAUTHORIZED')\n  return next()\n})\n```\n\nBecause the user shape is inferred from the field mappings in `defineAuth`, `session.user.id` and `session.user.role` are statically typed in every controller and middleware that touches them. Rename a model field and the type error surfaces everywhere it matters — no stringly-typed lookups.\n\nThe session is resolved once per request and reused. The tenant middleware, request logging, audit fields, and permission checks all draw on the same identity, so there is exactly one notion of \"who is making this request\" in a single request cycle. Session resolution joins tenant resolution with a combined target of under 2ms on a warm database or Redis hit, and route caching short-circuits before session load entirely — public cached pages never force an identity lookup.\n\n> \\[!TIP]\n> If a route does not need identity, keep it off the auth path. Because caching short-circuits before session load, public routes can serve from cache without touching the session store at all.\n\n## Session Lifecycle [#session-lifecycle]\n\nLifetime is controlled by `session.expiresIn` in `defineAuth` (milliseconds) and by the store backend configured in `src/config/session.ts`:\n\n| Store                | Where sessions live       | Notes                                                   |\n| -------------------- | ------------------------- | ------------------------------------------------------- |\n| `database` (default) | Sessions table            | Survives restarts; queryable for revocation and listing |\n| `redis`              | In-memory store           | Fast, shared across instances                           |\n| `cookie`             | Signed client-side cookie | Stateless, no lookup                                    |\n\nExpiry is **sliding**: each authenticated request refreshes the window, so an actively-used session never lapses while an idle one eventually does. This defaults to a sensible balance between convenience and hygiene — no configuration required.\n\n### Session strategies in depth [#session-strategies-in-depth]\n\nThe `strategy` option selects how the authoritative session record is persisted:\n\n* **`database`** — the store holds a session row referenced by the cookie. Revocation is a delete; device listing is a query; expiry sweeps are routine maintenance. Best for anything that needs multi-device management or auditability.\n* **`cookie`** — the session payload travels in the signed cookie itself. There is no server-side lookup, at the cost of being unable to revoke before the cookie expires somewhere other than the store.\n* **`jwt`** — a signed token is verified on each request. Stateless verification across instances, with revocation handled at the token level.\n\nThe choice does not leak into application code: `ctx.session` and `useSession()` are identical under all three strategies, which is what lets you start with `database` and move later without touching handlers.\n\n## Cookies [#cookies]\n\nThe session cookie is configured in the `session.cookie` block and is hardened by default: `httpOnly` blocks script access, `sameSite: 'lax'` limits cross-site sends, and `secure` restricts the cookie to HTTPS. The typed RPC client on the frontend needs no manual wiring — session cookies flow automatically on every request, and the SSR pass sends them with the initial hydration.\n\nCookie hardening is defense for the identity layer: script access is blocked (XSS cannot exfiltrate the session), cross-site sends are limited (reducing CSRF surface), and HTTPS-only transmission keeps the cookie off plaintext connections. The framework's `csrf` middleware then handles the residual cross-site risk separately.\n\n## Revocation [#revocation]\n\nSessions can be revoked at any time, independent of expiry. Deleting a session record (or an expired sweep of the store) invalidates it immediately; the same mechanism powers sign-out, admin account bans, and forced logouts. Query the store like any model to prune or audit:\n\n```ts title=\"revocation.ts\"\nconst n = await Session.query().where('expiresAt', '<', new Date()).delete()\n```\n\nBecause the store is shared and externalized, revocation is immediately visible to every instance — there is no per-process list to synchronize. A single sign-out invalidates the session everywhere: other tabs, other devices, and other instances all see the revoked session on their next request.\n\n### Multi-device sessions [#multi-device-sessions]\n\nEach sign-in creates its own session record, so the same account can hold several active sessions on different devices simultaneously. That is the normal state of affairs — and it is why revocation is per-session rather than per-account. Revoking one device's session leaves the others signed in; an account-wide ban revokes them all by deleting every row for that user.\n\n## CSRF on Form Routes [#csrf-on-form-routes]\n\nSession authentication introduces CSRF exposure, so the `csrf` middleware uses the session token in a double-submit pattern and is enabled by default on form routes. Forms authenticate by sending both the session cookie and a matching token; mismatches are rejected before any handler runs. This composes with the auth middleware: sessions identify the request, CSRF proves the request came from the user's own browser.\n\n## Device and Session Listing (v1.x) [#device-and-session-listing-v1x]\n\nIn v1.x the session store powers a device and session listing inside Studio, so users can inspect every active session and revoke individual devices instead of signing out everywhere at once. Because the store holds one row per session, the listing is a query and the revoke is a delete — the same primitives the framework uses everywhere.\n\n## The Client Side [#the-client-side]\n\nOn the frontend the same identity arrives through `useSession()`:\n\n```tsx title=\"the-client-side.tsx\"\nconst { user, signOut, isPending } = useSession()\n```\n\n`useSession()` is SSR-safe: the server renders the authenticated view from the cookie, and the client hydrates the same state without a flash of logged-out UI. `signOut` hits the session revocation endpoint and updates every session-aware hook. See [Client-Side Auth](/docs/auth/client-usage) for the full frontend flow.\n\n## Session Maintenance [#session-maintenance]\n\nRoutine hygiene is a plain operation against the store:\n\n* **Expiry sweeps** — delete rows past `expiresAt` on a schedule, exactly as shown above.\n* **Forced logout** — delete the row for a player's session; the next request is unauthenticated.\n* **Bans** — delete all sessions for an account, then let policies block further sign-in.\n* **Audit** — query the store for active sessions per user for support and security review.\n\nAll of these are ordinary model operations — sessions are just rows with the same query surface as any other scoped model.\n\n## What's Next [#whats-next]\n\n* [Client-Side Auth](/docs/auth/client-usage) — `useSession()` and sign-in flows in the browser\n* [Auth Configuration](/docs/auth/configuration) — session strategy, expiry, and cookie settings\n* [Protecting Routes](/docs/auth/protecting-routes) — turning `ctx.session` into route guards\n* [Authorization](/docs/authorization) — what a session allows, enforced by policies\n* [Security](/docs/security/default-protections) — CSRF and session hardening\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "A session is the currency of authentication: once a user signs in, a session represents that identity to every middleware, controller, loader, and page until it expires or is revoked. Kwiva makes the session a typed, first-class value across both sides of the stack, so you check identity the same way everywhere instead of hand-rolling cookie parsing. The session machinery — storage, signing, expiry, revocation — belongs to a sealed, framework-owned auth engine; your code only reads and acts on the result."
		},
		{
			"heading": void 0,
			"content": "Sessions ride through the request lifecycle at a defined point. During context assembly, cookies are decoded and the session is loaded from the configured store (database or Redis by default), then the resolved identity is reused by everything downstream — tenant resolution, logging, audit fields, and permission checks all draw on the same `ctx.session` rather than re-reading cookies."
		},
		{
			"heading": "the-typed-server-session",
			"content": "Every request that passes through the session middleware carries a `ctx.session` — typed as either a user payload or `null`, never an untyped blob:"
		},
		{
			"heading": "the-typed-server-session",
			"content": "A route that requires identity simply reads it:"
		},
		{
			"heading": "the-typed-server-session",
			"content": "Because the user shape is inferred from the field mappings in `defineAuth`, `session.user.id` and `session.user.role` are statically typed in every controller and middleware that touches them. Rename a model field and the type error surfaces everywhere it matters — no stringly-typed lookups."
		},
		{
			"heading": "the-typed-server-session",
			"content": "The session is resolved once per request and reused. The tenant middleware, request logging, audit fields, and permission checks all draw on the same identity, so there is exactly one notion of \"who is making this request\" in a single request cycle. Session resolution joins tenant resolution with a combined target of under 2ms on a warm database or Redis hit, and route caching short-circuits before session load entirely — public cached pages never force an identity lookup."
		},
		{
			"heading": "the-typed-server-session",
			"content": "> \\[!TIP]\n> If a route does not need identity, keep it off the auth path. Because caching short-circuits before session load, public routes can serve from cache without touching the session store at all."
		},
		{
			"heading": "session-lifecycle",
			"content": "Lifetime is controlled by `session.expiresIn` in `defineAuth` (milliseconds) and by the store backend configured in `src/config/session.ts`:"
		},
		{
			"heading": "session-lifecycle",
			"content": "Store"
		},
		{
			"heading": "session-lifecycle",
			"content": "Where sessions live"
		},
		{
			"heading": "session-lifecycle",
			"content": "Notes"
		},
		{
			"heading": "session-lifecycle",
			"content": "`database` (default)"
		},
		{
			"heading": "session-lifecycle",
			"content": "Sessions table"
		},
		{
			"heading": "session-lifecycle",
			"content": "Survives restarts; queryable for revocation and listing"
		},
		{
			"heading": "session-lifecycle",
			"content": "`redis`"
		},
		{
			"heading": "session-lifecycle",
			"content": "In-memory store"
		},
		{
			"heading": "session-lifecycle",
			"content": "Fast, shared across instances"
		},
		{
			"heading": "session-lifecycle",
			"content": "`cookie`"
		},
		{
			"heading": "session-lifecycle",
			"content": "Signed client-side cookie"
		},
		{
			"heading": "session-lifecycle",
			"content": "Stateless, no lookup"
		},
		{
			"heading": "session-lifecycle",
			"content": "Expiry is **sliding**: each authenticated request refreshes the window, so an actively-used session never lapses while an idle one eventually does. This defaults to a sensible balance between convenience and hygiene — no configuration required."
		},
		{
			"heading": "session-strategies-in-depth",
			"content": "The `strategy` option selects how the authoritative session record is persisted:"
		},
		{
			"heading": "session-strategies-in-depth",
			"content": "**`database`** — the store holds a session row referenced by the cookie. Revocation is a delete; device listing is a query; expiry sweeps are routine maintenance. Best for anything that needs multi-device management or auditability."
		},
		{
			"heading": "session-strategies-in-depth",
			"content": "**`cookie`** — the session payload travels in the signed cookie itself. There is no server-side lookup, at the cost of being unable to revoke before the cookie expires somewhere other than the store."
		},
		{
			"heading": "session-strategies-in-depth",
			"content": "**`jwt`** — a signed token is verified on each request. Stateless verification across instances, with revocation handled at the token level."
		},
		{
			"heading": "session-strategies-in-depth",
			"content": "The choice does not leak into application code: `ctx.session` and `useSession()` are identical under all three strategies, which is what lets you start with `database` and move later without touching handlers."
		},
		{
			"heading": "cookies",
			"content": "The session cookie is configured in the `session.cookie` block and is hardened by default: `httpOnly` blocks script access, `sameSite: 'lax'` limits cross-site sends, and `secure` restricts the cookie to HTTPS. The typed RPC client on the frontend needs no manual wiring — session cookies flow automatically on every request, and the SSR pass sends them with the initial hydration."
		},
		{
			"heading": "cookies",
			"content": "Cookie hardening is defense for the identity layer: script access is blocked (XSS cannot exfiltrate the session), cross-site sends are limited (reducing CSRF surface), and HTTPS-only transmission keeps the cookie off plaintext connections. The framework's `csrf` middleware then handles the residual cross-site risk separately."
		},
		{
			"heading": "revocation",
			"content": "Sessions can be revoked at any time, independent of expiry. Deleting a session record (or an expired sweep of the store) invalidates it immediately; the same mechanism powers sign-out, admin account bans, and forced logouts. Query the store like any model to prune or audit:"
		},
		{
			"heading": "revocation",
			"content": "Because the store is shared and externalized, revocation is immediately visible to every instance — there is no per-process list to synchronize. A single sign-out invalidates the session everywhere: other tabs, other devices, and other instances all see the revoked session on their next request."
		},
		{
			"heading": "multi-device-sessions",
			"content": "Each sign-in creates its own session record, so the same account can hold several active sessions on different devices simultaneously. That is the normal state of affairs — and it is why revocation is per-session rather than per-account. Revoking one device's session leaves the others signed in; an account-wide ban revokes them all by deleting every row for that user."
		},
		{
			"heading": "csrf-on-form-routes",
			"content": "Session authentication introduces CSRF exposure, so the `csrf` middleware uses the session token in a double-submit pattern and is enabled by default on form routes. Forms authenticate by sending both the session cookie and a matching token; mismatches are rejected before any handler runs. This composes with the auth middleware: sessions identify the request, CSRF proves the request came from the user's own browser."
		},
		{
			"heading": "device-and-session-listing-v1x",
			"content": "In v1.x the session store powers a device and session listing inside Studio, so users can inspect every active session and revoke individual devices instead of signing out everywhere at once. Because the store holds one row per session, the listing is a query and the revoke is a delete — the same primitives the framework uses everywhere."
		},
		{
			"heading": "the-client-side",
			"content": "On the frontend the same identity arrives through `useSession()`:"
		},
		{
			"heading": "the-client-side",
			"content": "`useSession()` is SSR-safe: the server renders the authenticated view from the cookie, and the client hydrates the same state without a flash of logged-out UI. `signOut` hits the session revocation endpoint and updates every session-aware hook. See Client-Side Auth for the full frontend flow."
		},
		{
			"heading": "session-maintenance",
			"content": "Routine hygiene is a plain operation against the store:"
		},
		{
			"heading": "session-maintenance",
			"content": "**Expiry sweeps** — delete rows past `expiresAt` on a schedule, exactly as shown above."
		},
		{
			"heading": "session-maintenance",
			"content": "**Forced logout** — delete the row for a player's session; the next request is unauthenticated."
		},
		{
			"heading": "session-maintenance",
			"content": "**Bans** — delete all sessions for an account, then let policies block further sign-in."
		},
		{
			"heading": "session-maintenance",
			"content": "**Audit** — query the store for active sessions per user for support and security review."
		},
		{
			"heading": "session-maintenance",
			"content": "All of these are ordinary model operations — sessions are just rows with the same query surface as any other scoped model."
		},
		{
			"heading": "whats-next",
			"content": "Client-Side Auth — `useSession()` and sign-in flows in the browser"
		},
		{
			"heading": "whats-next",
			"content": "Auth Configuration — session strategy, expiry, and cookie settings"
		},
		{
			"heading": "whats-next",
			"content": "Protecting Routes — turning `ctx.session` into route guards"
		},
		{
			"heading": "whats-next",
			"content": "Authorization — what a session allows, enforced by policies"
		},
		{
			"heading": "whats-next",
			"content": "Security — CSRF and session hardening"
		}
	],
	"headings": [
		{
			"id": "the-typed-server-session",
			"content": "The Typed Server Session"
		},
		{
			"id": "session-lifecycle",
			"content": "Session Lifecycle"
		},
		{
			"id": "session-strategies-in-depth",
			"content": "Session strategies in depth"
		},
		{
			"id": "cookies",
			"content": "Cookies"
		},
		{
			"id": "revocation",
			"content": "Revocation"
		},
		{
			"id": "multi-device-sessions",
			"content": "Multi-device sessions"
		},
		{
			"id": "csrf-on-form-routes",
			"content": "CSRF on Form Routes"
		},
		{
			"id": "device-and-session-listing-v1x",
			"content": "Device and Session Listing (v1.x)"
		},
		{
			"id": "the-client-side",
			"content": "The Client Side"
		},
		{
			"id": "session-maintenance",
			"content": "Session Maintenance"
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
		url: "#the-typed-server-session",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Typed Server Session" })
	},
	{
		depth: 2,
		url: "#session-lifecycle",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Session Lifecycle" })
	},
	{
		depth: 3,
		url: "#session-strategies-in-depth",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Session strategies in depth" })
	},
	{
		depth: 2,
		url: "#cookies",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Cookies" })
	},
	{
		depth: 2,
		url: "#revocation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Revocation" })
	},
	{
		depth: 3,
		url: "#multi-device-sessions",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Multi-device sessions" })
	},
	{
		depth: 2,
		url: "#csrf-on-form-routes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "CSRF on Form Routes" })
	},
	{
		depth: 2,
		url: "#device-and-session-listing-v1x",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Device and Session Listing (v1.x)" })
	},
	{
		depth: 2,
		url: "#the-client-side",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Client Side" })
	},
	{
		depth: 2,
		url: "#session-maintenance",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Session Maintenance" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A session is the currency of authentication: once a user signs in, a session represents that identity to every middleware, controller, loader, and page until it expires or is revoked. Kwiva makes the session a typed, first-class value across both sides of the stack, so you check identity the same way everywhere instead of hand-rolling cookie parsing. The session machinery — storage, signing, expiry, revocation — belongs to a sealed, framework-owned auth engine; your code only reads and acts on the result." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Sessions ride through the request lifecycle at a defined point. During context assembly, cookies are decoded and the session is loaded from the configured store (database or Redis by default), then the resolved identity is reused by everything downstream — tenant resolution, logging, audit fields, and permission checks all draw on the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session" }),
			" rather than re-reading cookies."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-typed-server-session",
			children: "The Typed Server Session"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every request that passes through the session middleware carries a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session" }),
			" — typed as either a user payload or ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "null" }),
			", never an untyped blob:"
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
			title: "the-typed-server-session.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
				className: "line",
				children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "const"
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
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: "session"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " } "
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "="
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " ctx "
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// typed: { user: { id, email, role } | null }"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A route that requires identity simply reads it:" }),
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
			title: "the-typed-server-session-2.ts",
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
							children: "defineMiddleware"
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
							children: "'auth'"
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
							children: " ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "ctx"
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
							children: "next"
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
							children: " {"
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
							children: "  if"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "!"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "ctx.session.user) "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "return"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " error"
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
							children: "'UNAUTHORIZED'"
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "  return"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " next"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()"
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
			"Because the user shape is inferred from the field mappings in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineAuth" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "session.user.id" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "session.user.role" }),
			" are statically typed in every controller and middleware that touches them. Rename a model field and the type error surfaces everywhere it matters — no stringly-typed lookups."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The session is resolved once per request and reused. The tenant middleware, request logging, audit fields, and permission checks all draw on the same identity, so there is exactly one notion of \"who is making this request\" in a single request cycle. Session resolution joins tenant resolution with a combined target of under 2ms on a warm database or Redis hit, and route caching short-circuits before session load entirely — public cached pages never force an identity lookup." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "[!TIP]\nIf a route does not need identity, keep it off the auth path. Because caching short-circuits before session load, public routes can serve from cache without touching the session store at all." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "session-lifecycle",
			children: "Session Lifecycle"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Lifetime is controlled by ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "session.expiresIn" }),
			" in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineAuth" }),
			" (milliseconds) and by the store backend configured in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/session.ts" }),
			":"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Store" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Where sessions live" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Notes" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "database" }), " (default)"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Sessions table" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Survives restarts; queryable for revocation and listing" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "redis" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "In-memory store" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Fast, shared across instances" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cookie" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Signed client-side cookie" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Stateless, no lookup" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Expiry is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "sliding" }),
			": each authenticated request refreshes the window, so an actively-used session never lapses while an idle one eventually does. This defaults to a sensible balance between convenience and hygiene — no configuration required."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "session-strategies-in-depth",
			children: "Session strategies in depth"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "strategy" }),
			" option selects how the authoritative session record is persisted:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "database" }) }), " — the store holds a session row referenced by the cookie. Revocation is a delete; device listing is a query; expiry sweeps are routine maintenance. Best for anything that needs multi-device management or auditability."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cookie" }) }), " — the session payload travels in the signed cookie itself. There is no server-side lookup, at the cost of being unable to revoke before the cookie expires somewhere other than the store."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "jwt" }) }), " — a signed token is verified on each request. Stateless verification across instances, with revocation handled at the token level."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The choice does not leak into application code: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useSession()" }),
			" are identical under all three strategies, which is what lets you start with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "database" }),
			" and move later without touching handlers."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "cookies",
			children: "Cookies"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The session cookie is configured in the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "session.cookie" }),
			" block and is hardened by default: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "httpOnly" }),
			" blocks script access, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "sameSite: 'lax'" }),
			" limits cross-site sends, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "secure" }),
			" restricts the cookie to HTTPS. The typed RPC client on the frontend needs no manual wiring — session cookies flow automatically on every request, and the SSR pass sends them with the initial hydration."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Cookie hardening is defense for the identity layer: script access is blocked (XSS cannot exfiltrate the session), cross-site sends are limited (reducing CSRF surface), and HTTPS-only transmission keeps the cookie off plaintext connections. The framework's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "csrf" }),
			" middleware then handles the residual cross-site risk separately."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "revocation",
			children: "Revocation"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Sessions can be revoked at any time, independent of expiry. Deleting a session record (or an expired sweep of the store) invalidates it immediately; the same mechanism powers sign-out, admin account bans, and forced logouts. Query the store like any model to prune or audit:" }),
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
			title: "revocation.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
				className: "line",
				children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "const"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: " n"
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
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: " await"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " Session."
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "query"
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
						children: "where"
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
						children: "'expiresAt'"
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
						children: "'<'"
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
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "new"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: " Date"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "())."
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "delete"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "()"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Because the store is shared and externalized, revocation is immediately visible to every instance — there is no per-process list to synchronize. A single sign-out invalidates the session everywhere: other tabs, other devices, and other instances all see the revoked session on their next request." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "multi-device-sessions",
			children: "Multi-device sessions"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Each sign-in creates its own session record, so the same account can hold several active sessions on different devices simultaneously. That is the normal state of affairs — and it is why revocation is per-session rather than per-account. Revoking one device's session leaves the others signed in; an account-wide ban revokes them all by deleting every row for that user." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "csrf-on-form-routes",
			children: "CSRF on Form Routes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Session authentication introduces CSRF exposure, so the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "csrf" }),
			" middleware uses the session token in a double-submit pattern and is enabled by default on form routes. Forms authenticate by sending both the session cookie and a matching token; mismatches are rejected before any handler runs. This composes with the auth middleware: sessions identify the request, CSRF proves the request came from the user's own browser."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "device-and-session-listing-v1x",
			children: "Device and Session Listing (v1.x)"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "In v1.x the session store powers a device and session listing inside Studio, so users can inspect every active session and revoke individual devices instead of signing out everywhere at once. Because the store holds one row per session, the listing is a query and the revoke is a delete — the same primitives the framework uses everywhere." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-client-side",
			children: "The Client Side"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"On the frontend the same identity arrives through ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useSession()" }),
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
			title: "the-client-side.tsx",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
				className: "line",
				children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "const"
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
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: "user"
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
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: "signOut"
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
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: "isPending"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: " } "
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#D73A49",
							"--shiki-dark": "#F97583"
						},
						children: "="
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: " useSession"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "()"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useSession()" }),
			" is SSR-safe: the server renders the authenticated view from the cookie, and the client hydrates the same state without a flash of logged-out UI. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "signOut" }),
			" hits the session revocation endpoint and updates every session-aware hook. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/auth/client-usage",
				children: "Client-Side Auth"
			}),
			" for the full frontend flow."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "session-maintenance",
			children: "Session Maintenance"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Routine hygiene is a plain operation against the store:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Expiry sweeps" }),
				" — delete rows past ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "expiresAt" }),
				" on a schedule, exactly as shown above."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Forced logout" }), " — delete the row for a player's session; the next request is unauthenticated."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Bans" }), " — delete all sessions for an account, then let policies block further sign-in."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Audit" }), " — query the store for active sessions per user for support and security review."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "All of these are ordinary model operations — sessions are just rows with the same query surface as any other scoped model." }),
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
					href: "/docs/auth/client-usage",
					children: "Client-Side Auth"
				}),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useSession()" }),
				" and sign-in flows in the browser"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/auth/configuration",
				children: "Auth Configuration"
			}), " — session strategy, expiry, and cookie settings"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/auth/protecting-routes",
					children: "Protecting Routes"
				}),
				" — turning ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session" }),
				" into route guards"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization",
				children: "Authorization"
			}), " — what a session allows, enforced by policies"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/default-protections",
				children: "Security"
			}), " — CSRF and session hardening"] }),
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
