import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/http/cors.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "CORS & Security Headers",
	"description": "CORS presets from src/config/cors.ts, per-route overrides, and default security headers with CSP."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nCross-origin access and response security headers are handled by built-in middleware with sensible defaults, configurable presets, and per-route overrides. The `cors` middleware enforces the cross-origin policy you configure; the `security-headers` middleware applies CSP, HSTS, and the standard protection headers.\n\nBoth share the same model: a baseline from the config folder, tightened or widened by inline options, and always applied before the handler runs. Server routes can override both at matched-path granularity through route rules.\n\n## CORS Presets [#cors-presets]\n\nCORS is configured centrally in `src/config/cors.ts`:\n\n```ts title=\"src/config/cors.ts\"\n// src/config/cors.ts\nimport { defineConfig } from '@kwiva/config'\n\nexport default defineConfig('cors', {\n  defaults: {\n    origins: ['https://acme.dev'],\n    methods: ['GET', 'POST'],\n    credentials: true,\n  },\n})\n```\n\n* `origins` — the allowed origins list\n* `methods` — the allowed HTTP methods\n* `credentials` — whether credentials are allowed in cross-origin requests\n\nWhen the `cors` middleware is on the global stack, this preset is applied to every request. See [Middleware](/docs/http/middleware) for how the stack is assembled.\n\n> \\[!NOTE]\n> The config folder is the single source of origin defaults. The same pattern that drives the API, cache, and app configs drives CORS — inline declarations at the controller or route scope override the preset, never fork it.\n\n## Per-Route Overrides [#per-route-overrides]\n\nInline options win over config values, so a controller or route can override the global preset:\n\n```ts title=\"per-route-overrides.ts\"\ndefineController('posts', (c) => ({ ... }), {\n  prefix: '/posts',\n  tags: ['posts'],\n  cors: { origins: ['https://acme.dev'] },\n})\n```\n\nServer routes apply CORS at the rule level, including combined rules:\n\n```ts title=\"src/routes/rules.ts\"\n// src/routes/rules.ts\ndefineServerRoute('/api/**', { cors: true, rateLimit: { max: 600, per: 60 } })\n```\n\nThe inner resolution for a request is: route rule, then controller option, then the global preset. The most specific declaration wins.\n\n## The CORS Middleware [#the-cors-middleware]\n\nThe `cors` built-in handles both sides of the cross-origin exchange:\n\n* **Preflight** — an `OPTIONS` request is answered with the negotiated headers, or denied when the origin is not allowed.\n* **Actual requests** — the negotiated headers are attached to the response; requests from disallowed origins fail before reaching the handler.\n* **Credentials** — when `credentials: true`, an explicit `origins` list is required; wildcard origins are refused, because a wildcard cannot carry credentials safely.\n\n## Security Headers [#security-headers]\n\nThe `security-headers` middleware applies the default protection set to every response:\n\n| Header                    | Default role                                                |\n| ------------------------- | ----------------------------------------------------------- |\n| Content Security Policy   | Restrictive baseline policy with nonce-based script support |\n| Strict-Transport-Security | Enforce HTTPS for the domain                                |\n| X-Content-Type-Options    | Disable MIME sniffing                                       |\n| X-Frame-Options           | Deny framing by default                                     |\n| Referrer-Policy           | Limit referrer leakage                                      |\n\nThe defaults are applied out of the box; no configuration is needed to get a reasonable baseline. The CSP is nonce-based, so inline scripts the application legitimately emits are allowed through per-request nonces while attacker-injected inline scripts remain blocked. See [Security: default protections](/docs/security/default-protections).\n\n## CSP Configuration [#csp-configuration]\n\nContent Security Policy is where you refine the baseline for your application — script sources, style sources, and frame ancestors. The defaults are overridable per route through the `headers` route rule, so embedded or standalone surfaces get their own policy:\n\n```ts title=\"src/routes/rules-2.ts\"\n// src/routes/rules.ts\ndefineServerRoute('/embed/**', {\n  headers: {\n    'content-security-policy': \"frame-ancestors 'self' https://embed.acme.dev\",\n  },\n})\n```\n\nThe `headers` rule applies arbitrary response headers to matched paths and composes with other rules on the same route. See [Security: headers](/docs/security/headers) for the full policy surface.\n\n## Resolution Order [#resolution-order]\n\nCORS plus header resolution follows specificity:\n\n| Declaration                       | Wins over                        |\n| --------------------------------- | -------------------------------- |\n| Route-level `cors` rule or option | Controller option, global preset |\n| Controller `cors` option          | Global preset                    |\n| `src/config/cors.ts` preset       | Defaults                         |\n\nInline options always win over config folder values, consistent with the rest of the framework — see [Configuration](/docs/core-concepts/configuration).\n\n## CORS on Server Routes [#cors-on-server-routes]\n\nServer routes can enforce CORS at matched-path granularity, including combined rules:\n\n```ts title=\"src/routes/rules-3.ts\"\n// src/routes/rules.ts\ndefineServerRoute('/api/public/**', {\n  cors: { origins: ['https://app.acme.dev'], credentials: true },\n})\ndefineServerRoute('/api/admin/**', { cors: true, rateLimit: { max: 120, per: 60 } })\n```\n\nA rule with `cors: true` applies the configured preset to that path. A rule with an explicit `cors` object overrides it for that path only — other paths keep their own configuration.\n\n## Supporting Concerns [#supporting-concerns]\n\n* **Rate limiting** pairs with CORS at the rule level, as shown above, and is documented in [Response Caching](/docs/http/caching) and [Security](/docs/security).\n* **Sessions and credentials** — CORS presets that allow credentials require matching cookie behavior; the session middleware is documented under [Auth: sessions](/docs/auth/sessions).\n* **Production posture** — header and origin decisions differ between environments; see [Security: production](/docs/security/production).\n\n## Origin Matching [#origin-matching]\n\nOrigins are compared exactly — scheme, host, and port. `https://app.acme.dev` and `https://app.acme.dev:8443` are different origins, and `https://acme.dev` does not cover `.acme.dev` subdomains unless listed. List each origin a real client will present; wildcard origins are refused when credentials are enabled.\n\n## Preflight and Caching [#preflight-and-caching]\n\nA cross-origin request that sends non-simple headers or methods triggers an `OPTIONS` preflight. The middleware answers it with the negotiated allow-headers and allow-methods and sets `access-control-max-age` so the browser caches the preflight. Simple GET and POST requests can bypass preflight entirely yet still receive the negotiated response headers — an origin never seen in a preflight can still arrive as a regular CORS request.\n\n## CSP Nonces [#csp-nonces]\n\nThe default CSP is nonce-based: each response carries a `nonce` on its script-src, and framework-emitted inline scripts are stamped with it. Content the application controls is authorized by the nonce; content it does not control has no nonce and is blocked. The `headers` rule can tighten or relax the policy for a path without touching the global baseline. See [Security: headers](/docs/security/headers).\n\n## Troubleshooting Matrix [#troubleshooting-matrix]\n\n| Symptom                                    | Likely cause                                                 |\n| ------------------------------------------ | ------------------------------------------------------------ |\n| Preflight blocked, no headers on `OPTIONS` | Origin not in `origins`, or CORS middleware not on the stack |\n| Credentials refused                        | Wildcard origin combined with `credentials: true`            |\n| Headers present but no cookies sent        | `credentials` disabled, or cookie `sameSite` mismatch        |\n| One path behaves differently               | A more specific route rule overrides the preset              |\n\n## Combined Rules [#combined-rules]\n\n`cors` composes with other rules on the same server route — `rateLimit`, `headers`, `cache` — and rules on more specific paths override broader ones. A public API path can carry a permissive origin and a stricter limit in one declaration while the admin path keeps tighter origins. See [Response Caching](/docs/http/caching).\n\n## Non-Browser Clients and Reflection [#non-browser-clients-and-reflection]\n\nCORS is a browser mechanism. Native apps, servers, and CLI tools send requests without origin checks and ignore the returned headers entirely — for them the middleware is harmless but unneeded. The framework never reflects the request `Origin` back into `Access-Control-Allow-Origin` (that is a cross-origin data-exfiltration pattern); it only echoes origins you listed explicitly. Credentialed requests are matched against `origins` and fail the preflight when absent.\n\n## When CORS Rules Apply [#when-cors-rules-apply]\n\nA route is CORS-protected only when the `cors` rule is attached to it — the preset applies everywhere by default, and a route that sets `cors: false` exposes the endpoint to browsers without CORS enforcement. Disabling CORS does not relax authentication: the `auth` middleware and guards still run. CORS governs which origins a browser may call; authentication governs who may succeed.\n\n## What's Next [#whats-next]\n\n1. [Security: default protections](/docs/security/default-protections) — the baseline security surfaces\n2. [Security: headers](/docs/security/headers) — header configuration and CSP details\n3. [Middleware](/docs/http/middleware) — the `cors` and `security-headers` built-ins on the stack\n4. [Routes & Routing](/docs/http/routes) — server routes and the `headers` rule\n5. [Security: production](/docs/security/production) — production hardening\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Cross-origin access and response security headers are handled by built-in middleware with sensible defaults, configurable presets, and per-route overrides. The `cors` middleware enforces the cross-origin policy you configure; the `security-headers` middleware applies CSP, HSTS, and the standard protection headers."
		},
		{
			"heading": void 0,
			"content": "Both share the same model: a baseline from the config folder, tightened or widened by inline options, and always applied before the handler runs. Server routes can override both at matched-path granularity through route rules."
		},
		{
			"heading": "cors-presets",
			"content": "CORS is configured centrally in `src/config/cors.ts`:"
		},
		{
			"heading": "cors-presets",
			"content": "`origins` — the allowed origins list"
		},
		{
			"heading": "cors-presets",
			"content": "`methods` — the allowed HTTP methods"
		},
		{
			"heading": "cors-presets",
			"content": "`credentials` — whether credentials are allowed in cross-origin requests"
		},
		{
			"heading": "cors-presets",
			"content": "When the `cors` middleware is on the global stack, this preset is applied to every request. See Middleware for how the stack is assembled."
		},
		{
			"heading": "cors-presets",
			"content": "> \\[!NOTE]\n> The config folder is the single source of origin defaults. The same pattern that drives the API, cache, and app configs drives CORS — inline declarations at the controller or route scope override the preset, never fork it."
		},
		{
			"heading": "per-route-overrides",
			"content": "Inline options win over config values, so a controller or route can override the global preset:"
		},
		{
			"heading": "per-route-overrides",
			"content": "Server routes apply CORS at the rule level, including combined rules:"
		},
		{
			"heading": "per-route-overrides",
			"content": "The inner resolution for a request is: route rule, then controller option, then the global preset. The most specific declaration wins."
		},
		{
			"heading": "the-cors-middleware",
			"content": "The `cors` built-in handles both sides of the cross-origin exchange:"
		},
		{
			"heading": "the-cors-middleware",
			"content": "**Preflight** — an `OPTIONS` request is answered with the negotiated headers, or denied when the origin is not allowed."
		},
		{
			"heading": "the-cors-middleware",
			"content": "**Actual requests** — the negotiated headers are attached to the response; requests from disallowed origins fail before reaching the handler."
		},
		{
			"heading": "the-cors-middleware",
			"content": "**Credentials** — when `credentials: true`, an explicit `origins` list is required; wildcard origins are refused, because a wildcard cannot carry credentials safely."
		},
		{
			"heading": "security-headers",
			"content": "The `security-headers` middleware applies the default protection set to every response:"
		},
		{
			"heading": "security-headers",
			"content": "Header"
		},
		{
			"heading": "security-headers",
			"content": "Default role"
		},
		{
			"heading": "security-headers",
			"content": "Content Security Policy"
		},
		{
			"heading": "security-headers",
			"content": "Restrictive baseline policy with nonce-based script support"
		},
		{
			"heading": "security-headers",
			"content": "Strict-Transport-Security"
		},
		{
			"heading": "security-headers",
			"content": "Enforce HTTPS for the domain"
		},
		{
			"heading": "security-headers",
			"content": "X-Content-Type-Options"
		},
		{
			"heading": "security-headers",
			"content": "Disable MIME sniffing"
		},
		{
			"heading": "security-headers",
			"content": "X-Frame-Options"
		},
		{
			"heading": "security-headers",
			"content": "Deny framing by default"
		},
		{
			"heading": "security-headers",
			"content": "Referrer-Policy"
		},
		{
			"heading": "security-headers",
			"content": "Limit referrer leakage"
		},
		{
			"heading": "security-headers",
			"content": "The defaults are applied out of the box; no configuration is needed to get a reasonable baseline. The CSP is nonce-based, so inline scripts the application legitimately emits are allowed through per-request nonces while attacker-injected inline scripts remain blocked. See Security: default protections."
		},
		{
			"heading": "csp-configuration",
			"content": "Content Security Policy is where you refine the baseline for your application — script sources, style sources, and frame ancestors. The defaults are overridable per route through the `headers` route rule, so embedded or standalone surfaces get their own policy:"
		},
		{
			"heading": "csp-configuration",
			"content": "The `headers` rule applies arbitrary response headers to matched paths and composes with other rules on the same route. See Security: headers for the full policy surface."
		},
		{
			"heading": "resolution-order",
			"content": "CORS plus header resolution follows specificity:"
		},
		{
			"heading": "resolution-order",
			"content": "Declaration"
		},
		{
			"heading": "resolution-order",
			"content": "Wins over"
		},
		{
			"heading": "resolution-order",
			"content": "Route-level `cors` rule or option"
		},
		{
			"heading": "resolution-order",
			"content": "Controller option, global preset"
		},
		{
			"heading": "resolution-order",
			"content": "Controller `cors` option"
		},
		{
			"heading": "resolution-order",
			"content": "Global preset"
		},
		{
			"heading": "resolution-order",
			"content": "`src/config/cors.ts` preset"
		},
		{
			"heading": "resolution-order",
			"content": "Defaults"
		},
		{
			"heading": "resolution-order",
			"content": "Inline options always win over config folder values, consistent with the rest of the framework — see Configuration."
		},
		{
			"heading": "cors-on-server-routes",
			"content": "Server routes can enforce CORS at matched-path granularity, including combined rules:"
		},
		{
			"heading": "cors-on-server-routes",
			"content": "A rule with `cors: true` applies the configured preset to that path. A rule with an explicit `cors` object overrides it for that path only — other paths keep their own configuration."
		},
		{
			"heading": "supporting-concerns",
			"content": "**Rate limiting** pairs with CORS at the rule level, as shown above, and is documented in Response Caching and Security."
		},
		{
			"heading": "supporting-concerns",
			"content": "**Sessions and credentials** — CORS presets that allow credentials require matching cookie behavior; the session middleware is documented under Auth: sessions."
		},
		{
			"heading": "supporting-concerns",
			"content": "**Production posture** — header and origin decisions differ between environments; see Security: production."
		},
		{
			"heading": "origin-matching",
			"content": "Origins are compared exactly — scheme, host, and port. `https://app.acme.dev` and `https://app.acme.dev:8443` are different origins, and `https://acme.dev` does not cover `.acme.dev` subdomains unless listed. List each origin a real client will present; wildcard origins are refused when credentials are enabled."
		},
		{
			"heading": "preflight-and-caching",
			"content": "A cross-origin request that sends non-simple headers or methods triggers an `OPTIONS` preflight. The middleware answers it with the negotiated allow-headers and allow-methods and sets `access-control-max-age` so the browser caches the preflight. Simple GET and POST requests can bypass preflight entirely yet still receive the negotiated response headers — an origin never seen in a preflight can still arrive as a regular CORS request."
		},
		{
			"heading": "csp-nonces",
			"content": "The default CSP is nonce-based: each response carries a `nonce` on its script-src, and framework-emitted inline scripts are stamped with it. Content the application controls is authorized by the nonce; content it does not control has no nonce and is blocked. The `headers` rule can tighten or relax the policy for a path without touching the global baseline. See Security: headers."
		},
		{
			"heading": "troubleshooting-matrix",
			"content": "Symptom"
		},
		{
			"heading": "troubleshooting-matrix",
			"content": "Likely cause"
		},
		{
			"heading": "troubleshooting-matrix",
			"content": "Preflight blocked, no headers on `OPTIONS`"
		},
		{
			"heading": "troubleshooting-matrix",
			"content": "Origin not in `origins`, or CORS middleware not on the stack"
		},
		{
			"heading": "troubleshooting-matrix",
			"content": "Credentials refused"
		},
		{
			"heading": "troubleshooting-matrix",
			"content": "Wildcard origin combined with `credentials: true`"
		},
		{
			"heading": "troubleshooting-matrix",
			"content": "Headers present but no cookies sent"
		},
		{
			"heading": "troubleshooting-matrix",
			"content": "`credentials` disabled, or cookie `sameSite` mismatch"
		},
		{
			"heading": "troubleshooting-matrix",
			"content": "One path behaves differently"
		},
		{
			"heading": "troubleshooting-matrix",
			"content": "A more specific route rule overrides the preset"
		},
		{
			"heading": "combined-rules",
			"content": "`cors` composes with other rules on the same server route — `rateLimit`, `headers`, `cache` — and rules on more specific paths override broader ones. A public API path can carry a permissive origin and a stricter limit in one declaration while the admin path keeps tighter origins. See Response Caching."
		},
		{
			"heading": "non-browser-clients-and-reflection",
			"content": "CORS is a browser mechanism. Native apps, servers, and CLI tools send requests without origin checks and ignore the returned headers entirely — for them the middleware is harmless but unneeded. The framework never reflects the request `Origin` back into `Access-Control-Allow-Origin` (that is a cross-origin data-exfiltration pattern); it only echoes origins you listed explicitly. Credentialed requests are matched against `origins` and fail the preflight when absent."
		},
		{
			"heading": "when-cors-rules-apply",
			"content": "A route is CORS-protected only when the `cors` rule is attached to it — the preset applies everywhere by default, and a route that sets `cors: false` exposes the endpoint to browsers without CORS enforcement. Disabling CORS does not relax authentication: the `auth` middleware and guards still run. CORS governs which origins a browser may call; authentication governs who may succeed."
		},
		{
			"heading": "whats-next",
			"content": "Security: default protections — the baseline security surfaces"
		},
		{
			"heading": "whats-next",
			"content": "Security: headers — header configuration and CSP details"
		},
		{
			"heading": "whats-next",
			"content": "Middleware — the `cors` and `security-headers` built-ins on the stack"
		},
		{
			"heading": "whats-next",
			"content": "Routes & Routing — server routes and the `headers` rule"
		},
		{
			"heading": "whats-next",
			"content": "Security: production — production hardening"
		}
	],
	"headings": [
		{
			"id": "cors-presets",
			"content": "CORS Presets"
		},
		{
			"id": "per-route-overrides",
			"content": "Per-Route Overrides"
		},
		{
			"id": "the-cors-middleware",
			"content": "The CORS Middleware"
		},
		{
			"id": "security-headers",
			"content": "Security Headers"
		},
		{
			"id": "csp-configuration",
			"content": "CSP Configuration"
		},
		{
			"id": "resolution-order",
			"content": "Resolution Order"
		},
		{
			"id": "cors-on-server-routes",
			"content": "CORS on Server Routes"
		},
		{
			"id": "supporting-concerns",
			"content": "Supporting Concerns"
		},
		{
			"id": "origin-matching",
			"content": "Origin Matching"
		},
		{
			"id": "preflight-and-caching",
			"content": "Preflight and Caching"
		},
		{
			"id": "csp-nonces",
			"content": "CSP Nonces"
		},
		{
			"id": "troubleshooting-matrix",
			"content": "Troubleshooting Matrix"
		},
		{
			"id": "combined-rules",
			"content": "Combined Rules"
		},
		{
			"id": "non-browser-clients-and-reflection",
			"content": "Non-Browser Clients and Reflection"
		},
		{
			"id": "when-cors-rules-apply",
			"content": "When CORS Rules Apply"
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
		url: "#cors-presets",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "CORS Presets" })
	},
	{
		depth: 2,
		url: "#per-route-overrides",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Per-Route Overrides" })
	},
	{
		depth: 2,
		url: "#the-cors-middleware",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The CORS Middleware" })
	},
	{
		depth: 2,
		url: "#security-headers",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Security Headers" })
	},
	{
		depth: 2,
		url: "#csp-configuration",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "CSP Configuration" })
	},
	{
		depth: 2,
		url: "#resolution-order",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Resolution Order" })
	},
	{
		depth: 2,
		url: "#cors-on-server-routes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "CORS on Server Routes" })
	},
	{
		depth: 2,
		url: "#supporting-concerns",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Supporting Concerns" })
	},
	{
		depth: 2,
		url: "#origin-matching",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Origin Matching" })
	},
	{
		depth: 2,
		url: "#preflight-and-caching",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Preflight and Caching" })
	},
	{
		depth: 2,
		url: "#csp-nonces",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "CSP Nonces" })
	},
	{
		depth: 2,
		url: "#troubleshooting-matrix",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Troubleshooting Matrix" })
	},
	{
		depth: 2,
		url: "#combined-rules",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Combined Rules" })
	},
	{
		depth: 2,
		url: "#non-browser-clients-and-reflection",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Non-Browser Clients and Reflection" })
	},
	{
		depth: 2,
		url: "#when-cors-rules-apply",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "When CORS Rules Apply" })
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
			"Cross-origin access and response security headers are handled by built-in middleware with sensible defaults, configurable presets, and per-route overrides. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cors" }),
			" middleware enforces the cross-origin policy you configure; the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "security-headers" }),
			" middleware applies CSP, HSTS, and the standard protection headers."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Both share the same model: a baseline from the config folder, tightened or widened by inline options, and always applied before the handler runs. Server routes can override both at matched-path granularity through route rules." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "cors-presets",
			children: "CORS Presets"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"CORS is configured centrally in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/cors.ts" }),
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
			title: "src/config/cors.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/config/cors.ts"
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
							children: " { defineConfig } "
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
							children: " '@kwiva/config'"
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
							children: "'cors'"
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
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "    origins: ["
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
							children: "],"
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
							children: "    methods: ["
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'GET'"
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
							children: "'POST'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "],"
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
							children: "    credentials: "
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "origins" }), " — the allowed origins list"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "methods" }), " — the allowed HTTP methods"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "credentials" }), " — whether credentials are allowed in cross-origin requests"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"When the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cors" }),
			" middleware is on the global stack, this preset is applied to every request. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/middleware",
				children: "Middleware"
			}),
			" for how the stack is assembled."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "[!NOTE]\nThe config folder is the single source of origin defaults. The same pattern that drives the API, cache, and app configs drives CORS — inline declarations at the controller or route scope override the preset, never fork it." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "per-route-overrides",
			children: "Per-Route Overrides"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Inline options win over config values, so a controller or route can override the global preset:" }),
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
			title: "per-route-overrides.ts",
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
							children: "defineController"
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
							children: "'/posts'"
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
							children: "  tags: ["
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
							children: "],"
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
							children: "] },"
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Server routes apply CORS at the rule level, including combined rules:" }),
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
			title: "src/routes/rules.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/routes/rules.ts"
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
							children: "defineServerRoute"
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
							children: "'/api/**'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", { cors: "
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
							children: ", rateLimit: { max: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "600"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", per: "
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " } })"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The inner resolution for a request is: route rule, then controller option, then the global preset. The most specific declaration wins." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-cors-middleware",
			children: "The CORS Middleware"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cors" }),
			" built-in handles both sides of the cross-origin exchange:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Preflight" }),
				" — an ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "OPTIONS" }),
				" request is answered with the negotiated headers, or denied when the origin is not allowed."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Actual requests" }), " — the negotiated headers are attached to the response; requests from disallowed origins fail before reaching the handler."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Credentials" }),
				" — when ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "credentials: true" }),
				", an explicit ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "origins" }),
				" list is required; wildcard origins are refused, because a wildcard cannot carry credentials safely."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "security-headers",
			children: "Security Headers"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "security-headers" }),
			" middleware applies the default protection set to every response:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Header" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Default role" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Content Security Policy" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Restrictive baseline policy with nonce-based script support" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Strict-Transport-Security" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Enforce HTTPS for the domain" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "X-Content-Type-Options" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Disable MIME sniffing" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "X-Frame-Options" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Deny framing by default" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Referrer-Policy" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Limit referrer leakage" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The defaults are applied out of the box; no configuration is needed to get a reasonable baseline. The CSP is nonce-based, so inline scripts the application legitimately emits are allowed through per-request nonces while attacker-injected inline scripts remain blocked. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/default-protections",
				children: "Security: default protections"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "csp-configuration",
			children: "CSP Configuration"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Content Security Policy is where you refine the baseline for your application — script sources, style sources, and frame ancestors. The defaults are overridable per route through the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "headers" }),
			" route rule, so embedded or standalone surfaces get their own policy:"
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
			title: "src/routes/rules-2.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/routes/rules.ts"
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
							children: "defineServerRoute"
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
							children: "'/embed/**'"
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
						children: "  headers: {"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "    'content-security-policy'"
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"frame-ancestors 'self' https://embed.acme.dev\""
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
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "headers" }),
			" rule applies arbitrary response headers to matched paths and composes with other rules on the same route. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/headers",
				children: "Security: headers"
			}),
			" for the full policy surface."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "resolution-order",
			children: "Resolution Order"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "CORS plus header resolution follows specificity:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Declaration" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Wins over" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Route-level ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cors" }),
				" rule or option"
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Controller option, global preset" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Controller ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cors" }),
				" option"
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Global preset" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/cors.ts" }), " preset"] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Defaults" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Inline options always win over config folder values, consistent with the rest of the framework — see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/configuration",
				children: "Configuration"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "cors-on-server-routes",
			children: "CORS on Server Routes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Server routes can enforce CORS at matched-path granularity, including combined rules:" }),
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
			title: "src/routes/rules-3.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/routes/rules.ts"
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
							children: "defineServerRoute"
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
							children: "'/api/public/**'"
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
							children: "'https://app.acme.dev'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "], credentials: "
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
						children: "})"
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
							children: "defineServerRoute"
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
							children: "'/api/admin/**'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", { cors: "
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
							children: ", rateLimit: { max: "
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
							children: ", per: "
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " } })"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A rule with ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cors: true" }),
			" applies the configured preset to that path. A rule with an explicit ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cors" }),
			" object overrides it for that path only — other paths keep their own configuration."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "supporting-concerns",
			children: "Supporting Concerns"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Rate limiting" }),
				" pairs with CORS at the rule level, as shown above, and is documented in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/http/caching",
					children: "Response Caching"
				}),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/security",
					children: "Security"
				}),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Sessions and credentials" }),
				" — CORS presets that allow credentials require matching cookie behavior; the session middleware is documented under ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/auth/sessions",
					children: "Auth: sessions"
				}),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Production posture" }),
				" — header and origin decisions differ between environments; see ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/security/production",
					children: "Security: production"
				}),
				"."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "origin-matching",
			children: "Origin Matching"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Origins are compared exactly — scheme, host, and port. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "https://app.acme.dev" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "https://app.acme.dev:8443" }),
			" are different origins, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "https://acme.dev" }),
			" does not cover ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".acme.dev" }),
			" subdomains unless listed. List each origin a real client will present; wildcard origins are refused when credentials are enabled."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "preflight-and-caching",
			children: "Preflight and Caching"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A cross-origin request that sends non-simple headers or methods triggers an ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "OPTIONS" }),
			" preflight. The middleware answers it with the negotiated allow-headers and allow-methods and sets ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "access-control-max-age" }),
			" so the browser caches the preflight. Simple GET and POST requests can bypass preflight entirely yet still receive the negotiated response headers — an origin never seen in a preflight can still arrive as a regular CORS request."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "csp-nonces",
			children: "CSP Nonces"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The default CSP is nonce-based: each response carries a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "nonce" }),
			" on its script-src, and framework-emitted inline scripts are stamped with it. Content the application controls is authorized by the nonce; content it does not control has no nonce and is blocked. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "headers" }),
			" rule can tighten or relax the policy for a path without touching the global baseline. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/headers",
				children: "Security: headers"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "troubleshooting-matrix",
			children: "Troubleshooting Matrix"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Symptom" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Likely cause" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Preflight blocked, no headers on ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "OPTIONS" })] }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Origin not in ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "origins" }),
				", or CORS middleware not on the stack"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Credentials refused" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Wildcard origin combined with ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "credentials: true" })] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Headers present but no cookies sent" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "credentials" }),
				" disabled, or cookie ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "sameSite" }),
				" mismatch"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "One path behaves differently" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A more specific route rule overrides the preset" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "combined-rules",
			children: "Combined Rules"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cors" }),
			" composes with other rules on the same server route — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "rateLimit" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "headers" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cache" }),
			" — and rules on more specific paths override broader ones. A public API path can carry a permissive origin and a stricter limit in one declaration while the admin path keeps tighter origins. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/caching",
				children: "Response Caching"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "non-browser-clients-and-reflection",
			children: "Non-Browser Clients and Reflection"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"CORS is a browser mechanism. Native apps, servers, and CLI tools send requests without origin checks and ignore the returned headers entirely — for them the middleware is harmless but unneeded. The framework never reflects the request ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Origin" }),
			" back into ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Access-Control-Allow-Origin" }),
			" (that is a cross-origin data-exfiltration pattern); it only echoes origins you listed explicitly. Credentialed requests are matched against ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "origins" }),
			" and fail the preflight when absent."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "when-cors-rules-apply",
			children: "When CORS Rules Apply"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A route is CORS-protected only when the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cors" }),
			" rule is attached to it — the preset applies everywhere by default, and a route that sets ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cors: false" }),
			" exposes the endpoint to browsers without CORS enforcement. Disabling CORS does not relax authentication: the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "auth" }),
			" middleware and guards still run. CORS governs which origins a browser may call; authentication governs who may succeed."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/default-protections",
				children: "Security: default protections"
			}), " — the baseline security surfaces"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/headers",
				children: "Security: headers"
			}), " — header configuration and CSP details"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/http/middleware",
					children: "Middleware"
				}),
				" — the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "cors" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "security-headers" }),
				" built-ins on the stack"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/http/routes",
					children: "Routes & Routing"
				}),
				" — server routes and the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "headers" }),
				" rule"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/production",
				children: "Security: production"
			}), " — production hardening"] }),
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
