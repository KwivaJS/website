import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/security/default-protections.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Default Protections",
	"description": "CSP, CSRF, typed validation, cookie hardening, rate limits, and tenant isolation — what a fresh Kwiva app blocks out of the box."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nA fresh Kwiva application is not blank-hardened but default-hardened. The following protections are active before you write application code, and each one blocks a specific, named class of attack. The practical effect: the framework boundary rejects what naive application code would have passed through.\n\n## Input Validation at Every Boundary [#input-validation-at-every-boundary]\n\nEvery executor in Kwiva validates its input through a typed schema — controllers, models, jobs, events, and channels all reject malformed or oversized input before any side effect runs. Validation is enforced at the boundary, so a value that was accepted into a controller is already trusted inside the executor.\n\nThe implication for security is structural: there is no \"unvalidated input reaches code\" path in the framework's model. A crafted payload that targets a hole in your validation logic fails in the schema layer, before it reaches a query, a job, or a channel handler. See [Input Validation](/docs/security/input-validation) for how this works in each executor type.\n\n## CSRF Protection [#csrf-protection]\n\nState-changing requests — anything that is not a verb-safe read — are protected by a double-submit token:\n\n* The CSRF cookie is set on the response that establishes the session\n* The token is submitted alongside the request, typically as a form field\n* The server rejects requests where the submitted token does not match the cookie value\n\nThe design requires no per-session server state and no database lookups on mutation, which keeps performance flat while the protection stays active. Because the token rides in a cookie that is not allowed to be read by other origins, a cross-site request forged to your endpoint arrives without the token and is rejected.\n\n> \\[!NOTE]\n> CSRF applies to anything that mutates state — including route targets that are unusual but still write to storage. When in doubt, keep the ceremony on the request rather than expecting the server to infer intent.\n\n## Cookie Hardening [#cookie-hardening]\n\nCookie settings default to the secure end of the spectrum:\n\n| Cookie  | Setting                                            | Why                                                                                                       |\n| ------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |\n| Session | `HttpOnly`, `SameSite=lax`, `Secure` in production | JavaScript cannot read it; the browser restricts cross-site sending; transport is encrypted in production |\n| CSRF    | Same, plus restricted further                      | The token is only ever sent alongside legitimate same-site requests                                       |\n\nEven with an XSS-bisecting Content Security Policy active, the HttpOnly cookie means a script running in the same origin cannot read the session cookie, and SameSite blocks the browser from attaching the session on cross-site requests.\n\n## Content Security Policy [#content-security-policy]\n\nA CSP is shipped by default, and it switches behavior by environment:\n\n* **Development** — report-only mode. Policy violations are reported (to the dev overlay while developing) but not enforced, so the loop stays fast while you build.\n* **Production** — strict enforcement with a nonce-based policy. Every response carries a one-time nonce, script and style sources require it, and `unsafe-inline` is not granted where it can be avoided.\n\nThe nonce binds executed content to the response that delivered it, which is the defense that keeps a stored or reflected injection from being treated as trusted markup. The header set and per-route control live on [Headers](/docs/security/headers).\n\n## Authentication Hardening [#authentication-hardening]\n\nSign-in and session endpoints get two protections by default:\n\n* **Rate limiting is strict.** Authentication routes have an aggressive default limit, tuned to slow credential stuffing while leaving legitimate users unaffected. The limit is adjustable, and the rate-limit event composes with notifications.\n* **Identical responses.** Attempting to sign in as an unknown user and attempting to sign in with a wrong password produce the same 401 response. There is no difference in status, timing, or body shape that an enumerator can use to learn which accounts exist.\n\nPassword hashing uses Argon2id, the memory-hard algorithm selected by the auth layer, and session tokens are handled constant-time. These defaults mean credential-based attacks are slowed, non-enumerable, and safe against the common timing and enumeration probes.\n\n## Rate Limiting Beyond Auth [#rate-limiting-beyond-auth]\n\nRate limiting is not an auth-only feature. Protection defaults by endpoint type:\n\n| Surface               | Default posture                                                  |\n| --------------------- | ---------------------------------------------------------------- |\n| Authentication routes | Strict — slow credential stuffing and brute force                |\n| Other API mutations   | API default rate limit, tuned for legitimate application traffic |\n| Per-route tuning      | Every route can raise or lower its limit                         |\n\nA route that floods, an endpoint that burns compute, or a webhook that retries in a tight loop all hit a limit before consuming the app's capacity. When a limit fires, the event is visible in logs as a recoverable anomaly and surfaces in the dev overlay during development.\n\n## Tenant Isolation and 404-Masking [#tenant-isolation-and-404-masking]\n\nThe tenant layer enforces scoping at the query level and masks failures at the response level:\n\n* Queries are scoped to the arranged tenant, so a lookup for a resource in another tenant returns nothing\n* Resource-lookup failures surface as **404**, not authorization errors\n\nReturning 404 rather than 403 for a missing or foreign resource is deliberate: an attacker probing IDs gets the same response for an ID that exists but belongs to someone else and for an ID that never existed. The endpoint cannot be used to enumerate tenant data. See [Tenancy Isolation](/docs/tenancy/isolation) for the full mechanism.\n\n## Secrets and the Public Prefix [#secrets-and-the-public-prefix]\n\nSecret-config values are gated by an allowlist prefix: only `KWIVA_PUBLIC_` variables are exposed client-side. Everything else in your environment stays server-side. This is a default that removes the most common secrets leak — a developer-ready environment variable finding its way into the client bundle because it was referenced in a page-adjacent file. See [Production](/docs/security/production) for the `key:generate` key rotation flow.\n\n## Request ID on Every Response [#request-id-on-every-response]\n\nEvery response carries `x-request-id` — derived from the incoming header or generated when absent — which gives you a per-request thread to pull on throughout the middleware chain and across background work. It is listed here because correlation IDs are a security tool: an incident report that arrives with an ID resolves to its exact spans, logs, and metrics instead of a time-bounded search. See [Tracing](/docs/observability/tracing) for the distributed story, and [Logging](/docs/observability/logging) for the correlation fields.\n\n## Overriding a Default [#overriding-a-default]\n\nDefaults are safe because they are defaults, and each one has a documented override:\n\n```ts title=\"overriding-a-default.ts\"\nexport default defineConfig('security', {\n  defaults: {\n    // overrides are explicit, intentional, and replacement-in-kind\n  },\n})\n```\n\nThe security config uses the same `defineConfig` pattern as every other module, which means all protection toggles — CSP mode, cookie settings, rate limits, header sets — are configurable per environment and inline per request. The guidance for overrides is the same everywhere: do not disable a default unless you are simultaneously substituting a comparable control of your own.\n\n## What's Next [#whats-next]\n\n* [Headers](/docs/security/headers) — the exact headers a fresh app sends, and per-route overrides\n* [Input Validation](/docs/security/input-validation) — typed validation on every boundary in depth\n* [Production](/docs/security/production) — keys, secrets, and the production checklist\n* [Tenancy Isolation](/docs/tenancy/isolation) — how scoping and 404-masking are enforced\n* [Auth and Sessions](/docs/auth) — how the session and rate-limit defaults compose with sign-in flows\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "A fresh Kwiva application is not blank-hardened but default-hardened. The following protections are active before you write application code, and each one blocks a specific, named class of attack. The practical effect: the framework boundary rejects what naive application code would have passed through."
		},
		{
			"heading": "input-validation-at-every-boundary",
			"content": "Every executor in Kwiva validates its input through a typed schema — controllers, models, jobs, events, and channels all reject malformed or oversized input before any side effect runs. Validation is enforced at the boundary, so a value that was accepted into a controller is already trusted inside the executor."
		},
		{
			"heading": "input-validation-at-every-boundary",
			"content": "The implication for security is structural: there is no \"unvalidated input reaches code\" path in the framework's model. A crafted payload that targets a hole in your validation logic fails in the schema layer, before it reaches a query, a job, or a channel handler. See Input Validation for how this works in each executor type."
		},
		{
			"heading": "csrf-protection",
			"content": "State-changing requests — anything that is not a verb-safe read — are protected by a double-submit token:"
		},
		{
			"heading": "csrf-protection",
			"content": "The CSRF cookie is set on the response that establishes the session"
		},
		{
			"heading": "csrf-protection",
			"content": "The token is submitted alongside the request, typically as a form field"
		},
		{
			"heading": "csrf-protection",
			"content": "The server rejects requests where the submitted token does not match the cookie value"
		},
		{
			"heading": "csrf-protection",
			"content": "The design requires no per-session server state and no database lookups on mutation, which keeps performance flat while the protection stays active. Because the token rides in a cookie that is not allowed to be read by other origins, a cross-site request forged to your endpoint arrives without the token and is rejected."
		},
		{
			"heading": "csrf-protection",
			"content": "> \\[!NOTE]\n> CSRF applies to anything that mutates state — including route targets that are unusual but still write to storage. When in doubt, keep the ceremony on the request rather than expecting the server to infer intent."
		},
		{
			"heading": "cookie-hardening",
			"content": "Cookie settings default to the secure end of the spectrum:"
		},
		{
			"heading": "cookie-hardening",
			"content": "Cookie"
		},
		{
			"heading": "cookie-hardening",
			"content": "Setting"
		},
		{
			"heading": "cookie-hardening",
			"content": "Why"
		},
		{
			"heading": "cookie-hardening",
			"content": "Session"
		},
		{
			"heading": "cookie-hardening",
			"content": "`HttpOnly`, `SameSite=lax`, `Secure` in production"
		},
		{
			"heading": "cookie-hardening",
			"content": "JavaScript cannot read it; the browser restricts cross-site sending; transport is encrypted in production"
		},
		{
			"heading": "cookie-hardening",
			"content": "CSRF"
		},
		{
			"heading": "cookie-hardening",
			"content": "Same, plus restricted further"
		},
		{
			"heading": "cookie-hardening",
			"content": "The token is only ever sent alongside legitimate same-site requests"
		},
		{
			"heading": "cookie-hardening",
			"content": "Even with an XSS-bisecting Content Security Policy active, the HttpOnly cookie means a script running in the same origin cannot read the session cookie, and SameSite blocks the browser from attaching the session on cross-site requests."
		},
		{
			"heading": "content-security-policy",
			"content": "A CSP is shipped by default, and it switches behavior by environment:"
		},
		{
			"heading": "content-security-policy",
			"content": "**Development** — report-only mode. Policy violations are reported (to the dev overlay while developing) but not enforced, so the loop stays fast while you build."
		},
		{
			"heading": "content-security-policy",
			"content": "**Production** — strict enforcement with a nonce-based policy. Every response carries a one-time nonce, script and style sources require it, and `unsafe-inline` is not granted where it can be avoided."
		},
		{
			"heading": "content-security-policy",
			"content": "The nonce binds executed content to the response that delivered it, which is the defense that keeps a stored or reflected injection from being treated as trusted markup. The header set and per-route control live on Headers."
		},
		{
			"heading": "authentication-hardening",
			"content": "Sign-in and session endpoints get two protections by default:"
		},
		{
			"heading": "authentication-hardening",
			"content": "**Rate limiting is strict.** Authentication routes have an aggressive default limit, tuned to slow credential stuffing while leaving legitimate users unaffected. The limit is adjustable, and the rate-limit event composes with notifications."
		},
		{
			"heading": "authentication-hardening",
			"content": "**Identical responses.** Attempting to sign in as an unknown user and attempting to sign in with a wrong password produce the same 401 response. There is no difference in status, timing, or body shape that an enumerator can use to learn which accounts exist."
		},
		{
			"heading": "authentication-hardening",
			"content": "Password hashing uses Argon2id, the memory-hard algorithm selected by the auth layer, and session tokens are handled constant-time. These defaults mean credential-based attacks are slowed, non-enumerable, and safe against the common timing and enumeration probes."
		},
		{
			"heading": "rate-limiting-beyond-auth",
			"content": "Rate limiting is not an auth-only feature. Protection defaults by endpoint type:"
		},
		{
			"heading": "rate-limiting-beyond-auth",
			"content": "Surface"
		},
		{
			"heading": "rate-limiting-beyond-auth",
			"content": "Default posture"
		},
		{
			"heading": "rate-limiting-beyond-auth",
			"content": "Authentication routes"
		},
		{
			"heading": "rate-limiting-beyond-auth",
			"content": "Strict — slow credential stuffing and brute force"
		},
		{
			"heading": "rate-limiting-beyond-auth",
			"content": "Other API mutations"
		},
		{
			"heading": "rate-limiting-beyond-auth",
			"content": "API default rate limit, tuned for legitimate application traffic"
		},
		{
			"heading": "rate-limiting-beyond-auth",
			"content": "Per-route tuning"
		},
		{
			"heading": "rate-limiting-beyond-auth",
			"content": "Every route can raise or lower its limit"
		},
		{
			"heading": "rate-limiting-beyond-auth",
			"content": "A route that floods, an endpoint that burns compute, or a webhook that retries in a tight loop all hit a limit before consuming the app's capacity. When a limit fires, the event is visible in logs as a recoverable anomaly and surfaces in the dev overlay during development."
		},
		{
			"heading": "tenant-isolation-and-404-masking",
			"content": "The tenant layer enforces scoping at the query level and masks failures at the response level:"
		},
		{
			"heading": "tenant-isolation-and-404-masking",
			"content": "Queries are scoped to the arranged tenant, so a lookup for a resource in another tenant returns nothing"
		},
		{
			"heading": "tenant-isolation-and-404-masking",
			"content": "Resource-lookup failures surface as **404**, not authorization errors"
		},
		{
			"heading": "tenant-isolation-and-404-masking",
			"content": "Returning 404 rather than 403 for a missing or foreign resource is deliberate: an attacker probing IDs gets the same response for an ID that exists but belongs to someone else and for an ID that never existed. The endpoint cannot be used to enumerate tenant data. See Tenancy Isolation for the full mechanism."
		},
		{
			"heading": "secrets-and-the-public-prefix",
			"content": "Secret-config values are gated by an allowlist prefix: only `KWIVA_PUBLIC_` variables are exposed client-side. Everything else in your environment stays server-side. This is a default that removes the most common secrets leak — a developer-ready environment variable finding its way into the client bundle because it was referenced in a page-adjacent file. See Production for the `key:generate` key rotation flow."
		},
		{
			"heading": "request-id-on-every-response",
			"content": "Every response carries `x-request-id` — derived from the incoming header or generated when absent — which gives you a per-request thread to pull on throughout the middleware chain and across background work. It is listed here because correlation IDs are a security tool: an incident report that arrives with an ID resolves to its exact spans, logs, and metrics instead of a time-bounded search. See Tracing for the distributed story, and Logging for the correlation fields."
		},
		{
			"heading": "overriding-a-default",
			"content": "Defaults are safe because they are defaults, and each one has a documented override:"
		},
		{
			"heading": "overriding-a-default",
			"content": "The security config uses the same `defineConfig` pattern as every other module, which means all protection toggles — CSP mode, cookie settings, rate limits, header sets — are configurable per environment and inline per request. The guidance for overrides is the same everywhere: do not disable a default unless you are simultaneously substituting a comparable control of your own."
		},
		{
			"heading": "whats-next",
			"content": "Headers — the exact headers a fresh app sends, and per-route overrides"
		},
		{
			"heading": "whats-next",
			"content": "Input Validation — typed validation on every boundary in depth"
		},
		{
			"heading": "whats-next",
			"content": "Production — keys, secrets, and the production checklist"
		},
		{
			"heading": "whats-next",
			"content": "Tenancy Isolation — how scoping and 404-masking are enforced"
		},
		{
			"heading": "whats-next",
			"content": "Auth and Sessions — how the session and rate-limit defaults compose with sign-in flows"
		}
	],
	"headings": [
		{
			"id": "input-validation-at-every-boundary",
			"content": "Input Validation at Every Boundary"
		},
		{
			"id": "csrf-protection",
			"content": "CSRF Protection"
		},
		{
			"id": "cookie-hardening",
			"content": "Cookie Hardening"
		},
		{
			"id": "content-security-policy",
			"content": "Content Security Policy"
		},
		{
			"id": "authentication-hardening",
			"content": "Authentication Hardening"
		},
		{
			"id": "rate-limiting-beyond-auth",
			"content": "Rate Limiting Beyond Auth"
		},
		{
			"id": "tenant-isolation-and-404-masking",
			"content": "Tenant Isolation and 404-Masking"
		},
		{
			"id": "secrets-and-the-public-prefix",
			"content": "Secrets and the Public Prefix"
		},
		{
			"id": "request-id-on-every-response",
			"content": "Request ID on Every Response"
		},
		{
			"id": "overriding-a-default",
			"content": "Overriding a Default"
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
		url: "#input-validation-at-every-boundary",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Input Validation at Every Boundary" })
	},
	{
		depth: 2,
		url: "#csrf-protection",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "CSRF Protection" })
	},
	{
		depth: 2,
		url: "#cookie-hardening",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Cookie Hardening" })
	},
	{
		depth: 2,
		url: "#content-security-policy",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Content Security Policy" })
	},
	{
		depth: 2,
		url: "#authentication-hardening",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Authentication Hardening" })
	},
	{
		depth: 2,
		url: "#rate-limiting-beyond-auth",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Rate Limiting Beyond Auth" })
	},
	{
		depth: 2,
		url: "#tenant-isolation-and-404-masking",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Tenant Isolation and 404-Masking" })
	},
	{
		depth: 2,
		url: "#secrets-and-the-public-prefix",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Secrets and the Public Prefix" })
	},
	{
		depth: 2,
		url: "#request-id-on-every-response",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Request ID on Every Response" })
	},
	{
		depth: 2,
		url: "#overriding-a-default",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Overriding a Default" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A fresh Kwiva application is not blank-hardened but default-hardened. The following protections are active before you write application code, and each one blocks a specific, named class of attack. The practical effect: the framework boundary rejects what naive application code would have passed through." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "input-validation-at-every-boundary",
			children: "Input Validation at Every Boundary"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every executor in Kwiva validates its input through a typed schema — controllers, models, jobs, events, and channels all reject malformed or oversized input before any side effect runs. Validation is enforced at the boundary, so a value that was accepted into a controller is already trusted inside the executor." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The implication for security is structural: there is no \"unvalidated input reaches code\" path in the framework's model. A crafted payload that targets a hole in your validation logic fails in the schema layer, before it reaches a query, a job, or a channel handler. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/input-validation",
				children: "Input Validation"
			}),
			" for how this works in each executor type."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "csrf-protection",
			children: "CSRF Protection"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "State-changing requests — anything that is not a verb-safe read — are protected by a double-submit token:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The CSRF cookie is set on the response that establishes the session" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The token is submitted alongside the request, typically as a form field" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The server rejects requests where the submitted token does not match the cookie value" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The design requires no per-session server state and no database lookups on mutation, which keeps performance flat while the protection stays active. Because the token rides in a cookie that is not allowed to be read by other origins, a cross-site request forged to your endpoint arrives without the token and is rejected." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "[!NOTE]\nCSRF applies to anything that mutates state — including route targets that are unusual but still write to storage. When in doubt, keep the ceremony on the request rather than expecting the server to infer intent." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "cookie-hardening",
			children: "Cookie Hardening"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Cookie settings default to the secure end of the spectrum:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Cookie" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Setting" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Why" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Session" }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "HttpOnly" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "SameSite=lax" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Secure" }),
				" in production"
			] }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "JavaScript cannot read it; the browser restricts cross-site sending; transport is encrypted in production" })
		] }), (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "CSRF" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Same, plus restricted further" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "The token is only ever sent alongside legitimate same-site requests" })
		] })] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Even with an XSS-bisecting Content Security Policy active, the HttpOnly cookie means a script running in the same origin cannot read the session cookie, and SameSite blocks the browser from attaching the session on cross-site requests." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "content-security-policy",
			children: "Content Security Policy"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A CSP is shipped by default, and it switches behavior by environment:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Development" }), " — report-only mode. Policy violations are reported (to the dev overlay while developing) but not enforced, so the loop stays fast while you build."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Production" }),
				" — strict enforcement with a nonce-based policy. Every response carries a one-time nonce, script and style sources require it, and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "unsafe-inline" }),
				" is not granted where it can be avoided."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The nonce binds executed content to the response that delivered it, which is the defense that keeps a stored or reflected injection from being treated as trusted markup. The header set and per-route control live on ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/headers",
				children: "Headers"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "authentication-hardening",
			children: "Authentication Hardening"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Sign-in and session endpoints get two protections by default:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Rate limiting is strict." }), " Authentication routes have an aggressive default limit, tuned to slow credential stuffing while leaving legitimate users unaffected. The limit is adjustable, and the rate-limit event composes with notifications."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Identical responses." }), " Attempting to sign in as an unknown user and attempting to sign in with a wrong password produce the same 401 response. There is no difference in status, timing, or body shape that an enumerator can use to learn which accounts exist."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Password hashing uses Argon2id, the memory-hard algorithm selected by the auth layer, and session tokens are handled constant-time. These defaults mean credential-based attacks are slowed, non-enumerable, and safe against the common timing and enumeration probes." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "rate-limiting-beyond-auth",
			children: "Rate Limiting Beyond Auth"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Rate limiting is not an auth-only feature. Protection defaults by endpoint type:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Surface" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Default posture" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Authentication routes" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Strict — slow credential stuffing and brute force" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Other API mutations" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "API default rate limit, tuned for legitimate application traffic" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Per-route tuning" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Every route can raise or lower its limit" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A route that floods, an endpoint that burns compute, or a webhook that retries in a tight loop all hit a limit before consuming the app's capacity. When a limit fires, the event is visible in logs as a recoverable anomaly and surfaces in the dev overlay during development." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "tenant-isolation-and-404-masking",
			children: "Tenant Isolation and 404-Masking"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The tenant layer enforces scoping at the query level and masks failures at the response level:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Queries are scoped to the arranged tenant, so a lookup for a resource in another tenant returns nothing" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Resource-lookup failures surface as ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "404" }),
				", not authorization errors"
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Returning 404 rather than 403 for a missing or foreign resource is deliberate: an attacker probing IDs gets the same response for an ID that exists but belongs to someone else and for an ID that never existed. The endpoint cannot be used to enumerate tenant data. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/isolation",
				children: "Tenancy Isolation"
			}),
			" for the full mechanism."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "secrets-and-the-public-prefix",
			children: "Secrets and the Public Prefix"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Secret-config values are gated by an allowlist prefix: only ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "KWIVA_PUBLIC_" }),
			" variables are exposed client-side. Everything else in your environment stays server-side. This is a default that removes the most common secrets leak — a developer-ready environment variable finding its way into the client bundle because it was referenced in a page-adjacent file. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/production",
				children: "Production"
			}),
			" for the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "key:generate" }),
			" key rotation flow."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "request-id-on-every-response",
			children: "Request ID on Every Response"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every response carries ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "x-request-id" }),
			" — derived from the incoming header or generated when absent — which gives you a per-request thread to pull on throughout the middleware chain and across background work. It is listed here because correlation IDs are a security tool: an incident report that arrives with an ID resolves to its exact spans, logs, and metrics instead of a time-bounded search. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/tracing",
				children: "Tracing"
			}),
			" for the distributed story, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/logging",
				children: "Logging"
			}),
			" for the correlation fields."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "overriding-a-default",
			children: "Overriding a Default"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Defaults are safe because they are defaults, and each one has a documented override:" }),
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
			title: "overriding-a-default.ts",
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
							children: " defineConfig"
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
							children: "'security'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", {"
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
						children: "  defaults: {"
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
						children: "    // overrides are explicit, intentional, and replacement-in-kind"
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
			"The security config uses the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineConfig" }),
			" pattern as every other module, which means all protection toggles — CSP mode, cookie settings, rate limits, header sets — are configurable per environment and inline per request. The guidance for overrides is the same everywhere: do not disable a default unless you are simultaneously substituting a comparable control of your own."
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
				href: "/docs/security/headers",
				children: "Headers"
			}), " — the exact headers a fresh app sends, and per-route overrides"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/input-validation",
				children: "Input Validation"
			}), " — typed validation on every boundary in depth"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/production",
				children: "Production"
			}), " — keys, secrets, and the production checklist"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/isolation",
				children: "Tenancy Isolation"
			}), " — how scoping and 404-masking are enforced"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/auth",
				children: "Auth and Sessions"
			}), " — how the session and rate-limit defaults compose with sign-in flows"] }),
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
