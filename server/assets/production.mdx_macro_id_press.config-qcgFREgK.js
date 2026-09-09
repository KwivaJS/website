import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/security/production.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Production",
	"description": "Environment-gated config, secret rotation, typed environment access, and the hardening checklist before every deploy."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\nProduction configuration is where defaults meet reality. Kwiva's answer is environment gating: the same `defineConfig` module that runs in development renders a strict, secret-safe production surface, and a preflight gate verifies the environment before the app serves traffic. This page is the checklist between development completeness and production readiness.\n\n## Environment-Gated Configuration [#environment-gated-configuration]\n\nThe `defineConfig` machinery supports per-environment modules. A production preset that enforces the strict CSP, discards pretty-printed logs, and tightens sessions is the same shape as the development preset that reports CSP violations and pretty-prints:\n\n```ts title=\"environment-gated-configuration.ts\"\nexport default defineConfig('security', {\n  production: {\n    securityHeaders: {\n      'content-security-policy': \"...\",   // enforce in prod\n    },\n  },\n})\n```\n\nThe preflight gate (`verify` in the build preset) blocks the deploy when the environment fails a defined check — a missing `DATABASE_URL`, a development-only leak, or a mismatched key. Verified-for-production environments are the only ones the gate lets through.\n\n## Typed Environment Access [#typed-environment-access]\n\nProduction code reads configuration through `env`, not by reaching into the process environment object. Plain runtime access to untrusted process environment is not allowed; configuration is verified and typed:\n\n```ts title=\"typed-environment-access.ts\"\nenv('DATABASE_URL')        // typed, verified, allowed\nprocess.env.X              // not accessible at runtime in app code\n```\n\nThe translation rule: production code uses `env`, and the environment is the untrusted input that configuration verifies. A missing or malformed variable fails the preflight rather than shipping default-forgotten behavior.\n\n## Onboarding and Secrets [#onboarding-and-secrets]\n\nThe onboarding process enforces the boundary between public and private configuration:\n\n* Only `KWIVA_PUBLIC_` variables are made available in the client bundle\n* Everything else stays server-side, so secrets referenced by page-adjacent code cannot accidentally reach the client\n* Environment names and values stay out of the repository and out of source control history\n\nA secret rotation is a roll of the key file, not a code change: `key:generate` writes a fresh key, and `--rotate` signals the running app to pick it up (details below).\n\n## Key Rotation [#key-rotation]\n\nSessions, and any value that depends on the application key, are signed by `key:generate` output. Rotating the key invalidates outstanding sessions — the expected semantic for a confidential credential — and the rotation flow makes it deliberate:\n\n```bash title=\"terminal\"\nkwiva key:generate --rotate\n```\n\nRotation is a deploy-time operation with a documented consequence (signed sessions reset), which is exactly what a focused, reviewable security action should look like. Running rotation outside a deploy window is the way to force-logout every user accidentally.\n\n## Session Hardening [#session-hardening]\n\nSessions default to HttpOnly with SameSite set in production. On top of the defaults, production preflight verifies:\n\n* **Secure transport**: cookies carry the `Secure` flag, so sessions are only sent over HTTPS\n* **Session TTLs**: absolute and idle timeouts are bounded to the app's threat model\n* **CORS tightening**: the cross-origin allowlist is the production value, not the development catch-all\n\nThe auth and session surfaces document their own tightening — sessions on [Auth and Sessions](/docs/auth/sessions), CORS on [HTTP CORS](/docs/http/cors).\n\n## No Debug Endpoints in Production [#no-debug-endpoints-in-production]\n\nThe debugging and development surface is disabled when the environment is not development. This includes:\n\n* Debug endpoints and their tooling\n* Dev-only verbosity in logs\n* The development overlay's telemetry rendering, which is a development surface by design\n\nBy the time production serves traffic, the only way to reach telemetry is through the configured exporters and the documented `/healthz` and `/readyz` endpoints — see [Tracing](/docs/observability/tracing).\n\n## Rate Limits in Production [#rate-limits-in-production]\n\nRate limits default safe for authentication (strict) and API mutation (standard). Production tuning is about capacity, not posture:\n\n* Raise limits where legitimate application traffic is known to exceed the default\n* Keep authentication strict — credential stuffing is a production-time threat, not a development one\n* Confirm rate-limit events flow to logs and notifications, so a spike is observable while it happens\n\nThe event composition is the same mechanism documented in Default Protections; production is where it starts mattering.\n\n## What Production Means for Logs and Telemetry [#what-production-means-for-logs-and-telemetry]\n\nProduction observability is the security surface's evidence layer, and production settings exist to make that layer trustworthy:\n\n* Logs stay **structured JSON** — the pretty printer is a development device; production output is raw and forwardable\n* **Exporters** are configured with a real endpoint, and the collector outage path (swallowed and counted, never fatal) is the standing guarantee\n* The **dev overlay is development-only** — production renders telemetry through the configured pipeline, not through the overlay\n* `/healthz` and `/readyz` remain the only always-on endpoints, giving orchestrators a definitive readiness signal without exposing debug machinery\n\nThe correlation IDs documented under observability double as incident tooling: a report that carries `requestId` resolves to its spans, logs, and series without time-bounded search. See [Observability](/docs/observability) for the full path.\n\n## Dependency Audits [#dependency-audits]\n\nThe production release includes a dependency audit stage: third-party code is scanned for known, documented vulnerabilities, and the pipeline blocks when findings are unresolved. The expectation is a clean audit on every deploy and a documented decision for anything the audit flags:\n\n* **Fixed** — bump the dependency and re-run the scan\n* **Accepted** — record the rationale (unreachable surface, no public exploit for this version) in the deploy note\n* **None** — clean bill, ship\n\nAudits run before the security gate in CI so a blocked deploy is explained by a flag, not discovered on the running server.\n\n## Identity and Multi-Tenancy in Production [#identity-and-multi-tenancy-in-production]\n\nTwo surfaces deserve production-specific attention beyond the defaults:\n\n* **Session turnover** — sessions are the walking credential. Production preflight verifies bounded TTLs and secure transport; deliberate rotation via `key:generate --rotate` is the sanctioned way to invalidate all signed sessions at once, which is exactly what a leaked-key incident requires.\n* **Tenant isolation at volume** — scoping fixed the single-tenant honest bug in development; production verifies it against real app traffic. Probing a cross-tenant ID from a second tenant's session must return 404 at scale the way it does in tests, with the same slow-path masking under load.\n\nNeither behavior changes at scale in the framework's model — but production is where a regression in either becomes an incident, so the preflight gate verifies both before traffic.\n\n## The Checklist Before Each Deploy [#the-checklist-before-each-deploy]\n\nThe production page composes with the deploy checklist. Before a deploy is green:\n\n```text title=\"the-checklist-before-each-deploy.txt\"\nkey:generate has been run and the key is out of the repository\nsecret rotation flow reviewed — sessions can be invalidated deliberately\nCSP enforced (production preset), no development-only CSP allowlists\nsessions and CORS are production-hardened values\ndebug and development endpoints disabled\nrate limits tuned to capacity; auth routes stay strict\ndependency audit passes; accepted findings are documented\npreflight gate passes against the target environment\n```\n\n## What's Next [#whats-next]\n\n* [Production Checklist](/docs/deployment/production-checklist) — the deploy-time companion to this page\n* [Default Protections](/docs/security/default-protections) — the defaults this page hardens further\n* [Headers](/docs/security/headers) — the CSP enforcement switching per environment\n* [Auth and Sessions](/docs/auth/sessions) — session and CSRF hardening in production\n* [Configuration](/docs/core-concepts/configuration) — per-environment modules and the preflight gate\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Production configuration is where defaults meet reality. Kwiva's answer is environment gating: the same `defineConfig` module that runs in development renders a strict, secret-safe production surface, and a preflight gate verifies the environment before the app serves traffic. This page is the checklist between development completeness and production readiness."
		},
		{
			"heading": "environment-gated-configuration",
			"content": "The `defineConfig` machinery supports per-environment modules. A production preset that enforces the strict CSP, discards pretty-printed logs, and tightens sessions is the same shape as the development preset that reports CSP violations and pretty-prints:"
		},
		{
			"heading": "environment-gated-configuration",
			"content": "The preflight gate (`verify` in the build preset) blocks the deploy when the environment fails a defined check — a missing `DATABASE_URL`, a development-only leak, or a mismatched key. Verified-for-production environments are the only ones the gate lets through."
		},
		{
			"heading": "typed-environment-access",
			"content": "Production code reads configuration through `env`, not by reaching into the process environment object. Plain runtime access to untrusted process environment is not allowed; configuration is verified and typed:"
		},
		{
			"heading": "typed-environment-access",
			"content": "The translation rule: production code uses `env`, and the environment is the untrusted input that configuration verifies. A missing or malformed variable fails the preflight rather than shipping default-forgotten behavior."
		},
		{
			"heading": "onboarding-and-secrets",
			"content": "The onboarding process enforces the boundary between public and private configuration:"
		},
		{
			"heading": "onboarding-and-secrets",
			"content": "Only `KWIVA_PUBLIC_` variables are made available in the client bundle"
		},
		{
			"heading": "onboarding-and-secrets",
			"content": "Everything else stays server-side, so secrets referenced by page-adjacent code cannot accidentally reach the client"
		},
		{
			"heading": "onboarding-and-secrets",
			"content": "Environment names and values stay out of the repository and out of source control history"
		},
		{
			"heading": "onboarding-and-secrets",
			"content": "A secret rotation is a roll of the key file, not a code change: `key:generate` writes a fresh key, and `--rotate` signals the running app to pick it up (details below)."
		},
		{
			"heading": "key-rotation",
			"content": "Sessions, and any value that depends on the application key, are signed by `key:generate` output. Rotating the key invalidates outstanding sessions — the expected semantic for a confidential credential — and the rotation flow makes it deliberate:"
		},
		{
			"heading": "key-rotation",
			"content": "Rotation is a deploy-time operation with a documented consequence (signed sessions reset), which is exactly what a focused, reviewable security action should look like. Running rotation outside a deploy window is the way to force-logout every user accidentally."
		},
		{
			"heading": "session-hardening",
			"content": "Sessions default to HttpOnly with SameSite set in production. On top of the defaults, production preflight verifies:"
		},
		{
			"heading": "session-hardening",
			"content": "**Secure transport**: cookies carry the `Secure` flag, so sessions are only sent over HTTPS"
		},
		{
			"heading": "session-hardening",
			"content": "**Session TTLs**: absolute and idle timeouts are bounded to the app's threat model"
		},
		{
			"heading": "session-hardening",
			"content": "**CORS tightening**: the cross-origin allowlist is the production value, not the development catch-all"
		},
		{
			"heading": "session-hardening",
			"content": "The auth and session surfaces document their own tightening — sessions on Auth and Sessions, CORS on HTTP CORS."
		},
		{
			"heading": "no-debug-endpoints-in-production",
			"content": "The debugging and development surface is disabled when the environment is not development. This includes:"
		},
		{
			"heading": "no-debug-endpoints-in-production",
			"content": "Debug endpoints and their tooling"
		},
		{
			"heading": "no-debug-endpoints-in-production",
			"content": "Dev-only verbosity in logs"
		},
		{
			"heading": "no-debug-endpoints-in-production",
			"content": "The development overlay's telemetry rendering, which is a development surface by design"
		},
		{
			"heading": "no-debug-endpoints-in-production",
			"content": "By the time production serves traffic, the only way to reach telemetry is through the configured exporters and the documented `/healthz` and `/readyz` endpoints — see Tracing."
		},
		{
			"heading": "rate-limits-in-production",
			"content": "Rate limits default safe for authentication (strict) and API mutation (standard). Production tuning is about capacity, not posture:"
		},
		{
			"heading": "rate-limits-in-production",
			"content": "Raise limits where legitimate application traffic is known to exceed the default"
		},
		{
			"heading": "rate-limits-in-production",
			"content": "Keep authentication strict — credential stuffing is a production-time threat, not a development one"
		},
		{
			"heading": "rate-limits-in-production",
			"content": "Confirm rate-limit events flow to logs and notifications, so a spike is observable while it happens"
		},
		{
			"heading": "rate-limits-in-production",
			"content": "The event composition is the same mechanism documented in Default Protections; production is where it starts mattering."
		},
		{
			"heading": "what-production-means-for-logs-and-telemetry",
			"content": "Production observability is the security surface's evidence layer, and production settings exist to make that layer trustworthy:"
		},
		{
			"heading": "what-production-means-for-logs-and-telemetry",
			"content": "Logs stay **structured JSON** — the pretty printer is a development device; production output is raw and forwardable"
		},
		{
			"heading": "what-production-means-for-logs-and-telemetry",
			"content": "**Exporters** are configured with a real endpoint, and the collector outage path (swallowed and counted, never fatal) is the standing guarantee"
		},
		{
			"heading": "what-production-means-for-logs-and-telemetry",
			"content": "The **dev overlay is development-only** — production renders telemetry through the configured pipeline, not through the overlay"
		},
		{
			"heading": "what-production-means-for-logs-and-telemetry",
			"content": "`/healthz` and `/readyz` remain the only always-on endpoints, giving orchestrators a definitive readiness signal without exposing debug machinery"
		},
		{
			"heading": "what-production-means-for-logs-and-telemetry",
			"content": "The correlation IDs documented under observability double as incident tooling: a report that carries `requestId` resolves to its spans, logs, and series without time-bounded search. See Observability for the full path."
		},
		{
			"heading": "dependency-audits",
			"content": "The production release includes a dependency audit stage: third-party code is scanned for known, documented vulnerabilities, and the pipeline blocks when findings are unresolved. The expectation is a clean audit on every deploy and a documented decision for anything the audit flags:"
		},
		{
			"heading": "dependency-audits",
			"content": "**Fixed** — bump the dependency and re-run the scan"
		},
		{
			"heading": "dependency-audits",
			"content": "**Accepted** — record the rationale (unreachable surface, no public exploit for this version) in the deploy note"
		},
		{
			"heading": "dependency-audits",
			"content": "**None** — clean bill, ship"
		},
		{
			"heading": "dependency-audits",
			"content": "Audits run before the security gate in CI so a blocked deploy is explained by a flag, not discovered on the running server."
		},
		{
			"heading": "identity-and-multi-tenancy-in-production",
			"content": "Two surfaces deserve production-specific attention beyond the defaults:"
		},
		{
			"heading": "identity-and-multi-tenancy-in-production",
			"content": "**Session turnover** — sessions are the walking credential. Production preflight verifies bounded TTLs and secure transport; deliberate rotation via `key:generate --rotate` is the sanctioned way to invalidate all signed sessions at once, which is exactly what a leaked-key incident requires."
		},
		{
			"heading": "identity-and-multi-tenancy-in-production",
			"content": "**Tenant isolation at volume** — scoping fixed the single-tenant honest bug in development; production verifies it against real app traffic. Probing a cross-tenant ID from a second tenant's session must return 404 at scale the way it does in tests, with the same slow-path masking under load."
		},
		{
			"heading": "identity-and-multi-tenancy-in-production",
			"content": "Neither behavior changes at scale in the framework's model — but production is where a regression in either becomes an incident, so the preflight gate verifies both before traffic."
		},
		{
			"heading": "the-checklist-before-each-deploy",
			"content": "The production page composes with the deploy checklist. Before a deploy is green:"
		},
		{
			"heading": "whats-next",
			"content": "Production Checklist — the deploy-time companion to this page"
		},
		{
			"heading": "whats-next",
			"content": "Default Protections — the defaults this page hardens further"
		},
		{
			"heading": "whats-next",
			"content": "Headers — the CSP enforcement switching per environment"
		},
		{
			"heading": "whats-next",
			"content": "Auth and Sessions — session and CSRF hardening in production"
		},
		{
			"heading": "whats-next",
			"content": "Configuration — per-environment modules and the preflight gate"
		}
	],
	"headings": [
		{
			"id": "environment-gated-configuration",
			"content": "Environment-Gated Configuration"
		},
		{
			"id": "typed-environment-access",
			"content": "Typed Environment Access"
		},
		{
			"id": "onboarding-and-secrets",
			"content": "Onboarding and Secrets"
		},
		{
			"id": "key-rotation",
			"content": "Key Rotation"
		},
		{
			"id": "session-hardening",
			"content": "Session Hardening"
		},
		{
			"id": "no-debug-endpoints-in-production",
			"content": "No Debug Endpoints in Production"
		},
		{
			"id": "rate-limits-in-production",
			"content": "Rate Limits in Production"
		},
		{
			"id": "what-production-means-for-logs-and-telemetry",
			"content": "What Production Means for Logs and Telemetry"
		},
		{
			"id": "dependency-audits",
			"content": "Dependency Audits"
		},
		{
			"id": "identity-and-multi-tenancy-in-production",
			"content": "Identity and Multi-Tenancy in Production"
		},
		{
			"id": "the-checklist-before-each-deploy",
			"content": "The Checklist Before Each Deploy"
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
		url: "#environment-gated-configuration",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Environment-Gated Configuration" })
	},
	{
		depth: 2,
		url: "#typed-environment-access",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Typed Environment Access" })
	},
	{
		depth: 2,
		url: "#onboarding-and-secrets",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Onboarding and Secrets" })
	},
	{
		depth: 2,
		url: "#key-rotation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Key Rotation" })
	},
	{
		depth: 2,
		url: "#session-hardening",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Session Hardening" })
	},
	{
		depth: 2,
		url: "#no-debug-endpoints-in-production",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "No Debug Endpoints in Production" })
	},
	{
		depth: 2,
		url: "#rate-limits-in-production",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Rate Limits in Production" })
	},
	{
		depth: 2,
		url: "#what-production-means-for-logs-and-telemetry",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What Production Means for Logs and Telemetry" })
	},
	{
		depth: 2,
		url: "#dependency-audits",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Dependency Audits" })
	},
	{
		depth: 2,
		url: "#identity-and-multi-tenancy-in-production",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Identity and Multi-Tenancy in Production" })
	},
	{
		depth: 2,
		url: "#the-checklist-before-each-deploy",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Checklist Before Each Deploy" })
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
		li: "li",
		p: "p",
		pre: "pre",
		span: "span",
		strong: "strong",
		ul: "ul",
		...props.components
	};
	return (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Production configuration is where defaults meet reality. Kwiva's answer is environment gating: the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineConfig" }),
			" module that runs in development renders a strict, secret-safe production surface, and a preflight gate verifies the environment before the app serves traffic. This page is the checklist between development completeness and production readiness."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "environment-gated-configuration",
			children: "Environment-Gated Configuration"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineConfig" }),
			" machinery supports per-environment modules. A production preset that enforces the strict CSP, discards pretty-printed logs, and tightens sessions is the same shape as the development preset that reports CSP violations and pretty-prints:"
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
			title: "environment-gated-configuration.ts",
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
						children: "  production: {"
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
							children: "      'content-security-policy'"
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
							children: "\"...\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ",   "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// enforce in prod"
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
			"The preflight gate (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "verify" }),
			" in the build preset) blocks the deploy when the environment fails a defined check — a missing ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "DATABASE_URL" }),
			", a development-only leak, or a mismatched key. Verified-for-production environments are the only ones the gate lets through."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "typed-environment-access",
			children: "Typed Environment Access"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Production code reads configuration through ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env" }),
			", not by reaching into the process environment object. Plain runtime access to untrusted process environment is not allowed; configuration is verified and typed:"
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
			title: "typed-environment-access.ts",
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
							children: "'DATABASE_URL'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")        "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// typed, verified, allowed"
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
							children: "process.env."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "X"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "              // not accessible at runtime in app code"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The translation rule: production code uses ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "env" }),
			", and the environment is the untrusted input that configuration verifies. A missing or malformed variable fails the preflight rather than shipping default-forgotten behavior."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "onboarding-and-secrets",
			children: "Onboarding and Secrets"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The onboarding process enforces the boundary between public and private configuration:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Only ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "KWIVA_PUBLIC_" }),
				" variables are made available in the client bundle"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Everything else stays server-side, so secrets referenced by page-adjacent code cannot accidentally reach the client" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Environment names and values stay out of the repository and out of source control history" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A secret rotation is a roll of the key file, not a code change: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "key:generate" }),
			" writes a fresh key, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "--rotate" }),
			" signals the running app to pick it up (details below)."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "key-rotation",
			children: "Key Rotation"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Sessions, and any value that depends on the application key, are signed by ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "key:generate" }),
			" output. Rotating the key invalidates outstanding sessions — the expected semantic for a confidential credential — and the rotation flow makes it deliberate:"
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
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
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
						children: " key:generate"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: " --rotate"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Rotation is a deploy-time operation with a documented consequence (signed sessions reset), which is exactly what a focused, reviewable security action should look like. Running rotation outside a deploy window is the way to force-logout every user accidentally." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "session-hardening",
			children: "Session Hardening"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Sessions default to HttpOnly with SameSite set in production. On top of the defaults, production preflight verifies:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Secure transport" }),
				": cookies carry the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Secure" }),
				" flag, so sessions are only sent over HTTPS"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Session TTLs" }), ": absolute and idle timeouts are bounded to the app's threat model"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "CORS tightening" }), ": the cross-origin allowlist is the production value, not the development catch-all"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The auth and session surfaces document their own tightening — sessions on ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/auth/sessions",
				children: "Auth and Sessions"
			}),
			", CORS on ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/cors",
				children: "HTTP CORS"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "no-debug-endpoints-in-production",
			children: "No Debug Endpoints in Production"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The debugging and development surface is disabled when the environment is not development. This includes:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Debug endpoints and their tooling" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Dev-only verbosity in logs" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The development overlay's telemetry rendering, which is a development surface by design" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"By the time production serves traffic, the only way to reach telemetry is through the configured exporters and the documented ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/healthz" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/readyz" }),
			" endpoints — see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability/tracing",
				children: "Tracing"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "rate-limits-in-production",
			children: "Rate Limits in Production"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Rate limits default safe for authentication (strict) and API mutation (standard). Production tuning is about capacity, not posture:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Raise limits where legitimate application traffic is known to exceed the default" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Keep authentication strict — credential stuffing is a production-time threat, not a development one" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Confirm rate-limit events flow to logs and notifications, so a spike is observable while it happens" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The event composition is the same mechanism documented in Default Protections; production is where it starts mattering." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-production-means-for-logs-and-telemetry",
			children: "What Production Means for Logs and Telemetry"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Production observability is the security surface's evidence layer, and production settings exist to make that layer trustworthy:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"Logs stay ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "structured JSON" }),
				" — the pretty printer is a development device; production output is raw and forwardable"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Exporters" }), " are configured with a real endpoint, and the collector outage path (swallowed and counted, never fatal) is the standing guarantee"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"The ",
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "dev overlay is development-only" }),
				" — production renders telemetry through the configured pipeline, not through the overlay"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/healthz" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/readyz" }),
				" remain the only always-on endpoints, giving orchestrators a definitive readiness signal without exposing debug machinery"
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The correlation IDs documented under observability double as incident tooling: a report that carries ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requestId" }),
			" resolves to its spans, logs, and series without time-bounded search. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/observability",
				children: "Observability"
			}),
			" for the full path."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "dependency-audits",
			children: "Dependency Audits"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The production release includes a dependency audit stage: third-party code is scanned for known, documented vulnerabilities, and the pipeline blocks when findings are unresolved. The expectation is a clean audit on every deploy and a documented decision for anything the audit flags:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Fixed" }), " — bump the dependency and re-run the scan"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Accepted" }), " — record the rationale (unreachable surface, no public exploit for this version) in the deploy note"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "None" }), " — clean bill, ship"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Audits run before the security gate in CI so a blocked deploy is explained by a flag, not discovered on the running server." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "identity-and-multi-tenancy-in-production",
			children: "Identity and Multi-Tenancy in Production"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Two surfaces deserve production-specific attention beyond the defaults:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Session turnover" }),
				" — sessions are the walking credential. Production preflight verifies bounded TTLs and secure transport; deliberate rotation via ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "key:generate --rotate" }),
				" is the sanctioned way to invalidate all signed sessions at once, which is exactly what a leaked-key incident requires."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Tenant isolation at volume" }), " — scoping fixed the single-tenant honest bug in development; production verifies it against real app traffic. Probing a cross-tenant ID from a second tenant's session must return 404 at scale the way it does in tests, with the same slow-path masking under load."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Neither behavior changes at scale in the framework's model — but production is where a regression in either becomes an incident, so the preflight gate verifies both before traffic." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-checklist-before-each-deploy",
			children: "The Checklist Before Each Deploy"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The production page composes with the deploy checklist. Before a deploy is green:" }),
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
			title: "the-checklist-before-each-deploy.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "key:generate has been run and the key is out of the repository" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "secret rotation flow reviewed — sessions can be invalidated deliberately" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "CSP enforced (production preset), no development-only CSP allowlists" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "sessions and CORS are production-hardened values" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "debug and development endpoints disabled" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "rate limits tuned to capacity; auth routes stay strict" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "dependency audit passes; accepted findings are documented" })
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "preflight gate passes against the target environment" })
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/production-checklist",
				children: "Production Checklist"
			}), " — the deploy-time companion to this page"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/default-protections",
				children: "Default Protections"
			}), " — the defaults this page hardens further"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/headers",
				children: "Headers"
			}), " — the CSP enforcement switching per environment"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/auth/sessions",
				children: "Auth and Sessions"
			}), " — session and CSRF hardening in production"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/core-concepts/configuration",
				children: "Configuration"
			}), " — per-environment modules and the preflight gate"] }),
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
