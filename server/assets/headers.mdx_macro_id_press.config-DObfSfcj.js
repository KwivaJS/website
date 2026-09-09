import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/security/headers.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Headers",
	"description": "The security headers a fresh Kwiva app sends by default — CSP with nonces, framing, MIME, and privacy headers — plus per-route overrides."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nKwiva handles the security headers for you. Every response that leaves a Kwiva application — SSR-rendered pages, API responses, and middleware responses alike — passes through the security headers middleware, enabled by default, with a conservative header set applied unless you override it.\n\n## Default Header Set [#default-header-set]\n\nA fresh application sends:\n\n| Header                      | Default value                | What it defends against                                  |\n| --------------------------- | ---------------------------- | -------------------------------------------------------- |\n| `Content-Security-Policy`   | Nonce-based, strict          | XSS and injection-into-executed-content                  |\n| `X-Content-Type-Options`    | `nosniff`                    | MIME sniffing and downstream content-upgrade attacks     |\n| `X-Frame-Options`           | `DENY`                       | Clickjacking via embedded frames                         |\n| `Referrer-Policy`           | Restrictive default          | Leaking the current origin in the `Referer` header       |\n| `Strict-Transport-Security` | Enabled for production hosts | Downgrade and protocol-sniffing attacks                  |\n| `Permissions-Policy`        | Restricted default           | Abuse of browser feature APIs (camera, mic, geolocation) |\n\nHeader names follow standards casing as written here; case is honored as configured. The table is additive-friendly: unwelcome browser features and unsafe framing are closed by default and unlocked per route when an app genuinely needs them.\n\n## Content Security Policy [#content-security-policy]\n\nThe CSP is the largest default header, and it follows the protocol in the default protections:\n\n* **Production** — strict enforcement with nonces. Every response carries a one-time nonce; script and style sources require it, and `unsafe-inline` is not granted where it can be avoided.\n* **Development** — report-only. Violations are reported without enforcement, so they surface in the dev overlay while you build instead of breaking your loop.\n\nThe policy is driven by a `defaults` dict in the security configuration. If name- or value-sensitive adjustments are needed, they can be provided inline per request — which is the escape hatch for third-party widget integrations that require a specific script source.\n\n> \\[!NOTE]\n> Report-only mode is the development posture because blocking a script you are actively editing is noise, not signal. Arrays of violations appear in the overlay as warnings — see [Dev Overlay](/docs/observability/dev-overlay) — and the same policy, flipped to enforce, is what ships to production.\n\n## Configuration [#configuration]\n\nHeaders are configurable through the security config via lower-cased field names, mapping 1:1 to their HTTP equivalents:\n\n```ts title=\"configuration.ts\"\nexport default defineConfig('security', {\n  defaults: {\n    securityHeaders: {\n      'x-content-type-options': 'nosniff',\n      'x-frame-options': 'DENY',\n      'referrer-policy': 'strict-origin-when-cross-origin',\n      'content-security-policy-report-only': null, // default report-only in dev\n    },\n  },\n})\n```\n\nThe `securityHeaders` dictionary belongs to the same `defineConfig` module as every other security toggle, so environments can ship different header sets without changing request code. A production preset that enforces the strict CSP is exactly the same shape as the development preset that reports it.\n\n## CSP and Nonces [#csp-and-nonces]\n\nNonce-based CSP is the default because of what nonces guarantee: each response binds its inline and external scripts to a value generated when the response was produced. A stored or reflected injection that lands in a later response fails the nonce check — CSP enforcement becomes the framework's answer to XSS that application-level escaping missed.\n\nThe nonce is applied automatically to scripts and styles Kwiva emits, so hydration, page transitions, and streaming all work under the strict policy without a compatibility carve-out. When you add third-party widgets:\n\n* **Prefer an explicit `script-src` value per widget** over `unsafe-inline`\n* **Use inline, per-request overrides** for the narrow, specific source a widget needs — the escape hatch exists precisely so one integration never forces a loosened global policy\n* **Verify in report-only dev** that the widget's violations are what the allowlist covers, then flip to enforce\n\nThe posture is additive: enforce the strictest possible set, and widen per integration, per request, permanently visible in diffs.\n\n## Directives Minimum [#directives-minimum]\n\nThe framework's CSP default ships the directives needed to run an SSR-reactive application safely, then closes what it can. Where the framework cannot know your intent — external embeds, image hosts, worker payloads — the defaults stay conservative and the inline per-request override exists to admit exactly what a given page needs.\n\n## Per-Route Overrides [#per-route-overrides]\n\nThe header set is not a blunt instrument. A route that embeds an OAuth2 dialog in an iframe, a page that needs a specific permissions policy for camera access, or a widget endpoint with a narrow script source can override headers for that route alone:\n\n```ts title=\"per-route-overrides.ts\"\nexport default defineController('widgets', (c) => ({\n  view: c.get('/', async ({ headers }) => {\n    headers.set('frame-ancestors', \"'self' https://partner.example\")\n    return { ok: true }\n  }),\n}))\n```\n\nOverrides widen one route while every other route keeps the defaults — the surface change is bounded, visible, and reviewable in the route file, not buried in a global config edit.\n\n## Applying to Static Assets [#applying-to-static-assets]\n\nThe security headers middleware covers responses from the application surface, including prerendered and streamed pages, so the audit of a deployed page is short: fetch the production URL and read the headers. Static assets served by the platform follow the same header directives, keeping the CSP and privacy headers consistent between documents and their resources.\n\n## Headers as a Contract [#headers-as-a-contract]\n\nTreat the header set as a deployable contract, not set-and-forget configuration. A few practices keep it reviewable:\n\n* **Read them in every environment** — a dev-mode fetch should show report-only CSP and permissive friendliness; a production fetch should show the enforced, strict set\n* **Diff via the telemetry** — CSP violations reported during development are a preview of production enforcement; reconcile them by override, not by loosening the global policy\n* **Keep widening explicit** — every third-party integration that requires a header change should appear as a per-route override or a named directive, visible in the route file or config diff\n* **Confirm the hardening headers stayed** — `x-content-type-options`, `x-frame-options`, and the privacy headers are cheap to drop silently during a config edit and expensive to rediscover\n\nThe contract view is also the debugging view: when a production report says \"this page lacks a header,\" the answer is one production fetch away, and the fix is one config key away.\n\n## Verifying What's Actually Sent [#verifying-whats-actually-sent]\n\nThe fastest verification is to fetch a production response and read its headers. Because the same telemetry that renders in the overlay also drives headers, a dev-mode violation report is often the earliest signal that an integration needs a per-route override — and a production fetch confirms the enforcement state before an incident does.\n\n## What's Next [#whats-next]\n\n* [Default Protections](/docs/security/default-protections) — CSP, cookies, rate limits, and tenant masking as one posture\n* [CORS](/docs/http/cors) — the orthogonal header story for cross-origin clients\n* [Middleware](/docs/http/middleware) — where the security headers middleware sits in the chain\n* [Controllers](/docs/http/controllers) — writing headers per route\n* [Production](/docs/security/production) — environment gating and the production checklist\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva handles the security headers for you. Every response that leaves a Kwiva application — SSR-rendered pages, API responses, and middleware responses alike — passes through the security headers middleware, enabled by default, with a conservative header set applied unless you override it."
		},
		{
			"heading": "default-header-set",
			"content": "A fresh application sends:"
		},
		{
			"heading": "default-header-set",
			"content": "Header"
		},
		{
			"heading": "default-header-set",
			"content": "Default value"
		},
		{
			"heading": "default-header-set",
			"content": "What it defends against"
		},
		{
			"heading": "default-header-set",
			"content": "`Content-Security-Policy`"
		},
		{
			"heading": "default-header-set",
			"content": "Nonce-based, strict"
		},
		{
			"heading": "default-header-set",
			"content": "XSS and injection-into-executed-content"
		},
		{
			"heading": "default-header-set",
			"content": "`X-Content-Type-Options`"
		},
		{
			"heading": "default-header-set",
			"content": "`nosniff`"
		},
		{
			"heading": "default-header-set",
			"content": "MIME sniffing and downstream content-upgrade attacks"
		},
		{
			"heading": "default-header-set",
			"content": "`X-Frame-Options`"
		},
		{
			"heading": "default-header-set",
			"content": "`DENY`"
		},
		{
			"heading": "default-header-set",
			"content": "Clickjacking via embedded frames"
		},
		{
			"heading": "default-header-set",
			"content": "`Referrer-Policy`"
		},
		{
			"heading": "default-header-set",
			"content": "Restrictive default"
		},
		{
			"heading": "default-header-set",
			"content": "Leaking the current origin in the `Referer` header"
		},
		{
			"heading": "default-header-set",
			"content": "`Strict-Transport-Security`"
		},
		{
			"heading": "default-header-set",
			"content": "Enabled for production hosts"
		},
		{
			"heading": "default-header-set",
			"content": "Downgrade and protocol-sniffing attacks"
		},
		{
			"heading": "default-header-set",
			"content": "`Permissions-Policy`"
		},
		{
			"heading": "default-header-set",
			"content": "Restricted default"
		},
		{
			"heading": "default-header-set",
			"content": "Abuse of browser feature APIs (camera, mic, geolocation)"
		},
		{
			"heading": "default-header-set",
			"content": "Header names follow standards casing as written here; case is honored as configured. The table is additive-friendly: unwelcome browser features and unsafe framing are closed by default and unlocked per route when an app genuinely needs them."
		},
		{
			"heading": "content-security-policy",
			"content": "The CSP is the largest default header, and it follows the protocol in the default protections:"
		},
		{
			"heading": "content-security-policy",
			"content": "**Production** — strict enforcement with nonces. Every response carries a one-time nonce; script and style sources require it, and `unsafe-inline` is not granted where it can be avoided."
		},
		{
			"heading": "content-security-policy",
			"content": "**Development** — report-only. Violations are reported without enforcement, so they surface in the dev overlay while you build instead of breaking your loop."
		},
		{
			"heading": "content-security-policy",
			"content": "The policy is driven by a `defaults` dict in the security configuration. If name- or value-sensitive adjustments are needed, they can be provided inline per request — which is the escape hatch for third-party widget integrations that require a specific script source."
		},
		{
			"heading": "content-security-policy",
			"content": "> \\[!NOTE]\n> Report-only mode is the development posture because blocking a script you are actively editing is noise, not signal. Arrays of violations appear in the overlay as warnings — see Dev Overlay — and the same policy, flipped to enforce, is what ships to production."
		},
		{
			"heading": "configuration",
			"content": "Headers are configurable through the security config via lower-cased field names, mapping 1:1 to their HTTP equivalents:"
		},
		{
			"heading": "configuration",
			"content": "The `securityHeaders` dictionary belongs to the same `defineConfig` module as every other security toggle, so environments can ship different header sets without changing request code. A production preset that enforces the strict CSP is exactly the same shape as the development preset that reports it."
		},
		{
			"heading": "csp-and-nonces",
			"content": "Nonce-based CSP is the default because of what nonces guarantee: each response binds its inline and external scripts to a value generated when the response was produced. A stored or reflected injection that lands in a later response fails the nonce check — CSP enforcement becomes the framework's answer to XSS that application-level escaping missed."
		},
		{
			"heading": "csp-and-nonces",
			"content": "The nonce is applied automatically to scripts and styles Kwiva emits, so hydration, page transitions, and streaming all work under the strict policy without a compatibility carve-out. When you add third-party widgets:"
		},
		{
			"heading": "csp-and-nonces",
			"content": "**Prefer an explicit `script-src` value per widget** over `unsafe-inline`"
		},
		{
			"heading": "csp-and-nonces",
			"content": "**Use inline, per-request overrides** for the narrow, specific source a widget needs — the escape hatch exists precisely so one integration never forces a loosened global policy"
		},
		{
			"heading": "csp-and-nonces",
			"content": "**Verify in report-only dev** that the widget's violations are what the allowlist covers, then flip to enforce"
		},
		{
			"heading": "csp-and-nonces",
			"content": "The posture is additive: enforce the strictest possible set, and widen per integration, per request, permanently visible in diffs."
		},
		{
			"heading": "directives-minimum",
			"content": "The framework's CSP default ships the directives needed to run an SSR-reactive application safely, then closes what it can. Where the framework cannot know your intent — external embeds, image hosts, worker payloads — the defaults stay conservative and the inline per-request override exists to admit exactly what a given page needs."
		},
		{
			"heading": "per-route-overrides",
			"content": "The header set is not a blunt instrument. A route that embeds an OAuth2 dialog in an iframe, a page that needs a specific permissions policy for camera access, or a widget endpoint with a narrow script source can override headers for that route alone:"
		},
		{
			"heading": "per-route-overrides",
			"content": "Overrides widen one route while every other route keeps the defaults — the surface change is bounded, visible, and reviewable in the route file, not buried in a global config edit."
		},
		{
			"heading": "applying-to-static-assets",
			"content": "The security headers middleware covers responses from the application surface, including prerendered and streamed pages, so the audit of a deployed page is short: fetch the production URL and read the headers. Static assets served by the platform follow the same header directives, keeping the CSP and privacy headers consistent between documents and their resources."
		},
		{
			"heading": "headers-as-a-contract",
			"content": "Treat the header set as a deployable contract, not set-and-forget configuration. A few practices keep it reviewable:"
		},
		{
			"heading": "headers-as-a-contract",
			"content": "**Read them in every environment** — a dev-mode fetch should show report-only CSP and permissive friendliness; a production fetch should show the enforced, strict set"
		},
		{
			"heading": "headers-as-a-contract",
			"content": "**Diff via the telemetry** — CSP violations reported during development are a preview of production enforcement; reconcile them by override, not by loosening the global policy"
		},
		{
			"heading": "headers-as-a-contract",
			"content": "**Keep widening explicit** — every third-party integration that requires a header change should appear as a per-route override or a named directive, visible in the route file or config diff"
		},
		{
			"heading": "headers-as-a-contract",
			"content": "**Confirm the hardening headers stayed** — `x-content-type-options`, `x-frame-options`, and the privacy headers are cheap to drop silently during a config edit and expensive to rediscover"
		},
		{
			"heading": "headers-as-a-contract",
			"content": "The contract view is also the debugging view: when a production report says \"this page lacks a header,\" the answer is one production fetch away, and the fix is one config key away."
		},
		{
			"heading": "verifying-whats-actually-sent",
			"content": "The fastest verification is to fetch a production response and read its headers. Because the same telemetry that renders in the overlay also drives headers, a dev-mode violation report is often the earliest signal that an integration needs a per-route override — and a production fetch confirms the enforcement state before an incident does."
		},
		{
			"heading": "whats-next",
			"content": "Default Protections — CSP, cookies, rate limits, and tenant masking as one posture"
		},
		{
			"heading": "whats-next",
			"content": "CORS — the orthogonal header story for cross-origin clients"
		},
		{
			"heading": "whats-next",
			"content": "Middleware — where the security headers middleware sits in the chain"
		},
		{
			"heading": "whats-next",
			"content": "Controllers — writing headers per route"
		},
		{
			"heading": "whats-next",
			"content": "Production — environment gating and the production checklist"
		}
	],
	"headings": [
		{
			"id": "default-header-set",
			"content": "Default Header Set"
		},
		{
			"id": "content-security-policy",
			"content": "Content Security Policy"
		},
		{
			"id": "configuration",
			"content": "Configuration"
		},
		{
			"id": "csp-and-nonces",
			"content": "CSP and Nonces"
		},
		{
			"id": "directives-minimum",
			"content": "Directives Minimum"
		},
		{
			"id": "per-route-overrides",
			"content": "Per-Route Overrides"
		},
		{
			"id": "applying-to-static-assets",
			"content": "Applying to Static Assets"
		},
		{
			"id": "headers-as-a-contract",
			"content": "Headers as a Contract"
		},
		{
			"id": "verifying-whats-actually-sent",
			"content": "Verifying What's Actually Sent"
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
		url: "#default-header-set",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Default Header Set" })
	},
	{
		depth: 2,
		url: "#content-security-policy",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Content Security Policy" })
	},
	{
		depth: 2,
		url: "#configuration",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Configuration" })
	},
	{
		depth: 2,
		url: "#csp-and-nonces",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "CSP and Nonces" })
	},
	{
		depth: 2,
		url: "#directives-minimum",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Directives Minimum" })
	},
	{
		depth: 2,
		url: "#per-route-overrides",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Per-Route Overrides" })
	},
	{
		depth: 2,
		url: "#applying-to-static-assets",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Applying to Static Assets" })
	},
	{
		depth: 2,
		url: "#headers-as-a-contract",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Headers as a Contract" })
	},
	{
		depth: 2,
		url: "#verifying-whats-actually-sent",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Verifying What's Actually Sent" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva handles the security headers for you. Every response that leaves a Kwiva application — SSR-rendered pages, API responses, and middleware responses alike — passes through the security headers middleware, enabled by default, with a conservative header set applied unless you override it." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "default-header-set",
			children: "Default Header Set"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A fresh application sends:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Header" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Default value" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it defends against" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Content-Security-Policy" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Nonce-based, strict" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "XSS and injection-into-executed-content" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "X-Content-Type-Options" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "nosniff" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "MIME sniffing and downstream content-upgrade attacks" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "X-Frame-Options" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "DENY" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Clickjacking via embedded frames" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Referrer-Policy" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Restrictive default" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"Leaking the current origin in the ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Referer" }),
					" header"
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Strict-Transport-Security" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Enabled for production hosts" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Downgrade and protocol-sniffing attacks" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Permissions-Policy" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Restricted default" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Abuse of browser feature APIs (camera, mic, geolocation)" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Header names follow standards casing as written here; case is honored as configured. The table is additive-friendly: unwelcome browser features and unsafe framing are closed by default and unlocked per route when an app genuinely needs them." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "content-security-policy",
			children: "Content Security Policy"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The CSP is the largest default header, and it follows the protocol in the default protections:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Production" }),
				" — strict enforcement with nonces. Every response carries a one-time nonce; script and style sources require it, and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "unsafe-inline" }),
				" is not granted where it can be avoided."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Development" }), " — report-only. Violations are reported without enforcement, so they surface in the dev overlay while you build instead of breaking your loop."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The policy is driven by a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defaults" }),
			" dict in the security configuration. If name- or value-sensitive adjustments are needed, they can be provided inline per request — which is the escape hatch for third-party widget integrations that require a specific script source."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!NOTE]\nReport-only mode is the development posture because blocking a script you are actively editing is noise, not signal. Arrays of violations appear in the overlay as warnings — see ",
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/observability/dev-overlay",
					children: "Dev Overlay"
				}),
				" — and the same policy, flipped to enforce, is what ships to production."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "configuration",
			children: "Configuration"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Headers are configurable through the security config via lower-cased field names, mapping 1:1 to their HTTP equivalents:" }),
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
			title: "configuration.ts",
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
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "    securityHeaders: {"
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
							children: "      'x-content-type-options'"
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
							children: "'nosniff'"
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "      'x-frame-options'"
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
							children: "'DENY'"
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "      'referrer-policy'"
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
							children: "'strict-origin-when-cross-origin'"
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "      'content-security-policy-report-only'"
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "null"
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
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// default report-only in dev"
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
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "securityHeaders" }),
			" dictionary belongs to the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineConfig" }),
			" module as every other security toggle, so environments can ship different header sets without changing request code. A production preset that enforces the strict CSP is exactly the same shape as the development preset that reports it."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "csp-and-nonces",
			children: "CSP and Nonces"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Nonce-based CSP is the default because of what nonces guarantee: each response binds its inline and external scripts to a value generated when the response was produced. A stored or reflected injection that lands in a later response fails the nonce check — CSP enforcement becomes the framework's answer to XSS that application-level escaping missed." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The nonce is applied automatically to scripts and styles Kwiva emits, so hydration, page transitions, and streaming all work under the strict policy without a compatibility carve-out. When you add third-party widgets:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.strong, { children: [
					"Prefer an explicit ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "script-src" }),
					" value per widget"
				] }),
				" over ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "unsafe-inline" })
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Use inline, per-request overrides" }), " for the narrow, specific source a widget needs — the escape hatch exists precisely so one integration never forces a loosened global policy"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Verify in report-only dev" }), " that the widget's violations are what the allowlist covers, then flip to enforce"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The posture is additive: enforce the strictest possible set, and widen per integration, per request, permanently visible in diffs." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "directives-minimum",
			children: "Directives Minimum"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The framework's CSP default ships the directives needed to run an SSR-reactive application safely, then closes what it can. Where the framework cannot know your intent — external embeds, image hosts, worker payloads — the defaults stay conservative and the inline per-request override exists to admit exactly what a given page needs." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "per-route-overrides",
			children: "Per-Route Overrides"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The header set is not a blunt instrument. A route that embeds an OAuth2 dialog in an iframe, a page that needs a specific permissions policy for camera access, or a widget endpoint with a narrow script source can override headers for that route alone:" }),
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
							children: " defineController"
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
							children: "'widgets'"
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
							children: "  view: c."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "get"
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
							children: "'/'"
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
							children: " ({ "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "headers"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "    headers."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "set"
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
							children: "'frame-ancestors'"
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
							children: "\"'self' https://partner.example\""
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
							children: "    return"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " { ok: "
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
							children: " }"
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
						children: "  }),"
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
						children: "}))"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Overrides widen one route while every other route keeps the defaults — the surface change is bounded, visible, and reviewable in the route file, not buried in a global config edit." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "applying-to-static-assets",
			children: "Applying to Static Assets"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The security headers middleware covers responses from the application surface, including prerendered and streamed pages, so the audit of a deployed page is short: fetch the production URL and read the headers. Static assets served by the platform follow the same header directives, keeping the CSP and privacy headers consistent between documents and their resources." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "headers-as-a-contract",
			children: "Headers as a Contract"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Treat the header set as a deployable contract, not set-and-forget configuration. A few practices keep it reviewable:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Read them in every environment" }), " — a dev-mode fetch should show report-only CSP and permissive friendliness; a production fetch should show the enforced, strict set"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Diff via the telemetry" }), " — CSP violations reported during development are a preview of production enforcement; reconcile them by override, not by loosening the global policy"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Keep widening explicit" }), " — every third-party integration that requires a header change should appear as a per-route override or a named directive, visible in the route file or config diff"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Confirm the hardening headers stayed" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "x-content-type-options" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "x-frame-options" }),
				", and the privacy headers are cheap to drop silently during a config edit and expensive to rediscover"
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The contract view is also the debugging view: when a production report says \"this page lacks a header,\" the answer is one production fetch away, and the fix is one config key away." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "verifying-whats-actually-sent",
			children: "Verifying What's Actually Sent"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The fastest verification is to fetch a production response and read its headers. Because the same telemetry that renders in the overlay also drives headers, a dev-mode violation report is often the earliest signal that an integration needs a per-route override — and a production fetch confirms the enforcement state before an incident does." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/default-protections",
				children: "Default Protections"
			}), " — CSP, cookies, rate limits, and tenant masking as one posture"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/cors",
				children: "CORS"
			}), " — the orthogonal header story for cross-origin clients"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/middleware",
				children: "Middleware"
			}), " — where the security headers middleware sits in the chain"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/controllers",
				children: "Controllers"
			}), " — writing headers per route"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/production",
				children: "Production"
			}), " — environment gating and the production checklist"] }),
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
