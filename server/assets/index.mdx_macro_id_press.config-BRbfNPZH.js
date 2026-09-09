import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/security/index.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Security",
	"description": "Defense in depth across request, session, and tenant boundaries — protective defaults that hold at the framework boundary."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\nKwiva treats security as a property of the framework surface, not a checklist that application code must remember. Because requests, sessions, tenant isolation, validation, jobs, and page rendering all pass through framework-owned machinery, the defensive defaults land at every layer without you wiring them in. The security model is: defaults are safe, opt-outs are explicit and loud, and the attack surface of a Kwiva application is smaller than equivalent code written by hand.\n\n## Security at Every Layer [#security-at-every-layer]\n\nDefenses are placed where the attack actually arrives, across four layers:\n\n| Layer        | Defense                                                                                                                          |\n| ------------ | -------------------------------------------------------------------------------------------------------------------------------- |\n| **Request**  | Typecasts validate every input at the boundary, security headers ship by default, CSRF protection guards state-changing requests |\n| **Session**  | HttpOnly, SameSite, and Secure cookies; constant-time session handling                                                           |\n| **Identity** | Argon2id password hashing, rate-limited auth endpoints, enumeration-safe responses                                               |\n| **Tenant**   | Query scoping enforced by the tenant layer, missing resources return 404 to avoid information leaks                              |\n\nThe result is a stack where a vulnerability in application code has to defeat the framework boundary first — and the framework boundary is where the defaults are strongest.\n\n## The Threat Model [#the-threat-model]\n\nThe security documentation assumes an attacker who can:\n\n* Reach your public endpoints with crafted requests — manipulation of inputs, headers, and cookies\n* Observe session traffic and attempt session hijack or fixation\n* Probe multi-tenant behavior for cross-tenant data access\n* Attempt injection against queries and rendered output\n\nIt does not assume an attacker with the database credentials or the production filesystem. Secrets handling, heads-up production configuration, and dependency hygiene are covered separately in the production guide.\n\n## Protective Defaults [#protective-defaults]\n\nThe single most important posture in Kwiva: **the safe choice is the default**. A fresh application ships with:\n\n* Typed validation on controllers, models, jobs, events, and channels — unvalidated input never reaches an executor\n* CSRF double-submit token protection on state-changing requests\n* A strict, nonce-based Content Security Policy in production, with report-only mode in development\n* A hardened cookie policy — `HttpOnly`, `SameSite=lax`, `Secure` in production — with the CSRF cookie further restricted\n* Rate limiting on authentication endpoints (strict) and API mutation (default), with the ability to tune per route\n* Security headers middleware enabled by default, sending a conservative header set unless you override it\n* Identical 401 responses for unknown users and wrong passwords, so sign-in endpoints do not enumerate accounts\n* Enforced tenant scoping with 404-masking for cross-tenant resource access\n\nEach default is overridable — but overriding is an explicit, deliberate act with a documented trade-off, not an accident of configuration.\n\n## Tenant Isolation and Authorization [#tenant-isolation-and-authorization]\n\nTenant isolation is enforced in the query layer and in the response path:\n\n* Queries are scoped by the tenant layer to the arranged tenant; a lookup outside it returns nothing without leaking existence\n* Missing cross-tenant resources return 404 rather than 403, so an attacker cannot probe which IDs exist\n* Authorization policies run before side effects — a user cannot create, update, or delete through a route that outruns its policy\n\nAuthorization elsewhere is covered by [Policies](/docs/authorization/policies), and the isolation mechanism itself has its own in-depth treatment on [Tenancy Isolation](/docs/tenancy/isolation).\n\n## Where the Levers Are [#where-the-levers-are]\n\nEach defense ships with a documented override point. The table below maps concerns to pages on this documentation:\n\n| Concern                                                        | Page                                                      |\n| -------------------------------------------------------------- | --------------------------------------------------------- |\n| Default protections, CSRF, cookies, rate limits                | [Default Protections](/docs/security/default-protections) |\n| Security headers, CSP, per-route overrides                     | [Headers](/docs/security/headers)                         |\n| Typed validation on every input boundary                       | [Input Validation](/docs/security/input-validation)       |\n| Environment gating, secrets, audits, production-only hardening | [Production](/docs/security/production)                   |\n\n## Application Code Still Plays a Role [#application-code-still-plays-a-role]\n\nProtective defaults narrow the surface; they do not replace judgment. Three habits keep application code aligned to the framework's posture:\n\n1. **Do not disable defaults.** Most reportable vulnerabilities in Kwiva apps come from overriding a default without substituting a comparable control.\n2. **Log and correlate.** Error handling and observability cooperate: correlation IDs and structured error responses are security tools too, because they turn an incident into a traceable story.\n3. **Follow the lifecycles.** Deleting users, rotating keys, and clearing sessions have framework-supported paths — use them, and keep `key:generate` and its rotation flow in the deploy checklist.\n\nThe pages that follow are organized the same way the stack is: default protections first, then headers, then validation, then the production checklist. Each expands one defensive layer from \"this exists\" to \"this is how it behaves under attack.\"\n\n## Pressing on the Boundaries [#pressing-on-the-boundaries]\n\nA healthy security posture is one you can verify. Because the protections above live in framework-owned machinery, verifying them is a series of concrete, cheap probes rather than an audit of application code:\n\n* Send a state-changing request without the CSRF token — expected: rejected before the handler\n* Fetch a production response and read its headers — expected: the strict, nonce-based CSP and hardened cookie flags\n* Query a resource ID that exists in another tenant — expected: 404, identical to a missing ID\n* Attempt to sign in with an unknown account, then with a wrong password — expected: identical 401 responses\n* Read the response headers of every route you expose — expected: no dev-only headers leaking into production responses\n\nEach probe maps to a documented default on the next pages. When a probe returns something other than the expected result, you have found either an intentional override or a regression to fix — both are discoverable, which is the entire point of defaults.\n\n## The Security Checklist [#the-security-checklist]\n\nAs a working checklist for an application before it ships:\n\n* [ ] Authentication endpoints rate-limited; `key:generate` has been run and secrets are out of the repository\n* [ ] Sessions are HttpOnly and secure in production; CSRF protection active on mutations\n* [ ] Strict CSP enabled in production; development CSP in report-only mode\n* [ ] Inputs validated at every boundary — controllers, models, jobs, events, and channels\n* [ ] Policies attached to protected routes; tenant scoping verified against a second tenant\n* [ ] Debug and development-only endpoints disabled in production\n* [ ] Dependency audits pass, and the deploy checklist has been reviewed\n\nEach item has a dedicated page. The next five documents expand each defense from \"this exists\" to \"this is how it behaves.\"\n\n## What's Next [#whats-next]\n\n* [Default Protections](/docs/security/default-protections) — what a fresh Kwiva app blocks out of the box\n* [Headers](/docs/security/headers) — the security headers sent by default\n* [Input Validation](/docs/security/input-validation) — typed validation on every boundary\n* [Production](/docs/security/production) — environment gating and the production checklist\n* [Tenancy Isolation](/docs/tenancy/isolation) — the isolation mechanism behind 404-masking\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva treats security as a property of the framework surface, not a checklist that application code must remember. Because requests, sessions, tenant isolation, validation, jobs, and page rendering all pass through framework-owned machinery, the defensive defaults land at every layer without you wiring them in. The security model is: defaults are safe, opt-outs are explicit and loud, and the attack surface of a Kwiva application is smaller than equivalent code written by hand."
		},
		{
			"heading": "security-at-every-layer",
			"content": "Defenses are placed where the attack actually arrives, across four layers:"
		},
		{
			"heading": "security-at-every-layer",
			"content": "Layer"
		},
		{
			"heading": "security-at-every-layer",
			"content": "Defense"
		},
		{
			"heading": "security-at-every-layer",
			"content": "**Request**"
		},
		{
			"heading": "security-at-every-layer",
			"content": "Typecasts validate every input at the boundary, security headers ship by default, CSRF protection guards state-changing requests"
		},
		{
			"heading": "security-at-every-layer",
			"content": "**Session**"
		},
		{
			"heading": "security-at-every-layer",
			"content": "HttpOnly, SameSite, and Secure cookies; constant-time session handling"
		},
		{
			"heading": "security-at-every-layer",
			"content": "**Identity**"
		},
		{
			"heading": "security-at-every-layer",
			"content": "Argon2id password hashing, rate-limited auth endpoints, enumeration-safe responses"
		},
		{
			"heading": "security-at-every-layer",
			"content": "**Tenant**"
		},
		{
			"heading": "security-at-every-layer",
			"content": "Query scoping enforced by the tenant layer, missing resources return 404 to avoid information leaks"
		},
		{
			"heading": "security-at-every-layer",
			"content": "The result is a stack where a vulnerability in application code has to defeat the framework boundary first — and the framework boundary is where the defaults are strongest."
		},
		{
			"heading": "the-threat-model",
			"content": "The security documentation assumes an attacker who can:"
		},
		{
			"heading": "the-threat-model",
			"content": "Reach your public endpoints with crafted requests — manipulation of inputs, headers, and cookies"
		},
		{
			"heading": "the-threat-model",
			"content": "Observe session traffic and attempt session hijack or fixation"
		},
		{
			"heading": "the-threat-model",
			"content": "Probe multi-tenant behavior for cross-tenant data access"
		},
		{
			"heading": "the-threat-model",
			"content": "Attempt injection against queries and rendered output"
		},
		{
			"heading": "the-threat-model",
			"content": "It does not assume an attacker with the database credentials or the production filesystem. Secrets handling, heads-up production configuration, and dependency hygiene are covered separately in the production guide."
		},
		{
			"heading": "protective-defaults",
			"content": "The single most important posture in Kwiva: **the safe choice is the default**. A fresh application ships with:"
		},
		{
			"heading": "protective-defaults",
			"content": "Typed validation on controllers, models, jobs, events, and channels — unvalidated input never reaches an executor"
		},
		{
			"heading": "protective-defaults",
			"content": "CSRF double-submit token protection on state-changing requests"
		},
		{
			"heading": "protective-defaults",
			"content": "A strict, nonce-based Content Security Policy in production, with report-only mode in development"
		},
		{
			"heading": "protective-defaults",
			"content": "A hardened cookie policy — `HttpOnly`, `SameSite=lax`, `Secure` in production — with the CSRF cookie further restricted"
		},
		{
			"heading": "protective-defaults",
			"content": "Rate limiting on authentication endpoints (strict) and API mutation (default), with the ability to tune per route"
		},
		{
			"heading": "protective-defaults",
			"content": "Security headers middleware enabled by default, sending a conservative header set unless you override it"
		},
		{
			"heading": "protective-defaults",
			"content": "Identical 401 responses for unknown users and wrong passwords, so sign-in endpoints do not enumerate accounts"
		},
		{
			"heading": "protective-defaults",
			"content": "Enforced tenant scoping with 404-masking for cross-tenant resource access"
		},
		{
			"heading": "protective-defaults",
			"content": "Each default is overridable — but overriding is an explicit, deliberate act with a documented trade-off, not an accident of configuration."
		},
		{
			"heading": "tenant-isolation-and-authorization",
			"content": "Tenant isolation is enforced in the query layer and in the response path:"
		},
		{
			"heading": "tenant-isolation-and-authorization",
			"content": "Queries are scoped by the tenant layer to the arranged tenant; a lookup outside it returns nothing without leaking existence"
		},
		{
			"heading": "tenant-isolation-and-authorization",
			"content": "Missing cross-tenant resources return 404 rather than 403, so an attacker cannot probe which IDs exist"
		},
		{
			"heading": "tenant-isolation-and-authorization",
			"content": "Authorization policies run before side effects — a user cannot create, update, or delete through a route that outruns its policy"
		},
		{
			"heading": "tenant-isolation-and-authorization",
			"content": "Authorization elsewhere is covered by Policies, and the isolation mechanism itself has its own in-depth treatment on Tenancy Isolation."
		},
		{
			"heading": "where-the-levers-are",
			"content": "Each defense ships with a documented override point. The table below maps concerns to pages on this documentation:"
		},
		{
			"heading": "where-the-levers-are",
			"content": "Concern"
		},
		{
			"heading": "where-the-levers-are",
			"content": "Page"
		},
		{
			"heading": "where-the-levers-are",
			"content": "Default protections, CSRF, cookies, rate limits"
		},
		{
			"heading": "where-the-levers-are",
			"content": "Default Protections"
		},
		{
			"heading": "where-the-levers-are",
			"content": "Security headers, CSP, per-route overrides"
		},
		{
			"heading": "where-the-levers-are",
			"content": "Headers"
		},
		{
			"heading": "where-the-levers-are",
			"content": "Typed validation on every input boundary"
		},
		{
			"heading": "where-the-levers-are",
			"content": "Input Validation"
		},
		{
			"heading": "where-the-levers-are",
			"content": "Environment gating, secrets, audits, production-only hardening"
		},
		{
			"heading": "where-the-levers-are",
			"content": "Production"
		},
		{
			"heading": "application-code-still-plays-a-role",
			"content": "Protective defaults narrow the surface; they do not replace judgment. Three habits keep application code aligned to the framework's posture:"
		},
		{
			"heading": "application-code-still-plays-a-role",
			"content": "**Do not disable defaults.** Most reportable vulnerabilities in Kwiva apps come from overriding a default without substituting a comparable control."
		},
		{
			"heading": "application-code-still-plays-a-role",
			"content": "**Log and correlate.** Error handling and observability cooperate: correlation IDs and structured error responses are security tools too, because they turn an incident into a traceable story."
		},
		{
			"heading": "application-code-still-plays-a-role",
			"content": "**Follow the lifecycles.** Deleting users, rotating keys, and clearing sessions have framework-supported paths — use them, and keep `key:generate` and its rotation flow in the deploy checklist."
		},
		{
			"heading": "application-code-still-plays-a-role",
			"content": "The pages that follow are organized the same way the stack is: default protections first, then headers, then validation, then the production checklist. Each expands one defensive layer from \"this exists\" to \"this is how it behaves under attack.\""
		},
		{
			"heading": "pressing-on-the-boundaries",
			"content": "A healthy security posture is one you can verify. Because the protections above live in framework-owned machinery, verifying them is a series of concrete, cheap probes rather than an audit of application code:"
		},
		{
			"heading": "pressing-on-the-boundaries",
			"content": "Send a state-changing request without the CSRF token — expected: rejected before the handler"
		},
		{
			"heading": "pressing-on-the-boundaries",
			"content": "Fetch a production response and read its headers — expected: the strict, nonce-based CSP and hardened cookie flags"
		},
		{
			"heading": "pressing-on-the-boundaries",
			"content": "Query a resource ID that exists in another tenant — expected: 404, identical to a missing ID"
		},
		{
			"heading": "pressing-on-the-boundaries",
			"content": "Attempt to sign in with an unknown account, then with a wrong password — expected: identical 401 responses"
		},
		{
			"heading": "pressing-on-the-boundaries",
			"content": "Read the response headers of every route you expose — expected: no dev-only headers leaking into production responses"
		},
		{
			"heading": "pressing-on-the-boundaries",
			"content": "Each probe maps to a documented default on the next pages. When a probe returns something other than the expected result, you have found either an intentional override or a regression to fix — both are discoverable, which is the entire point of defaults."
		},
		{
			"heading": "the-security-checklist",
			"content": "As a working checklist for an application before it ships:"
		},
		{
			"heading": "the-security-checklist",
			"content": "Authentication endpoints rate-limited; `key:generate` has been run and secrets are out of the repository"
		},
		{
			"heading": "the-security-checklist",
			"content": "Sessions are HttpOnly and secure in production; CSRF protection active on mutations"
		},
		{
			"heading": "the-security-checklist",
			"content": "Strict CSP enabled in production; development CSP in report-only mode"
		},
		{
			"heading": "the-security-checklist",
			"content": "Inputs validated at every boundary — controllers, models, jobs, events, and channels"
		},
		{
			"heading": "the-security-checklist",
			"content": "Policies attached to protected routes; tenant scoping verified against a second tenant"
		},
		{
			"heading": "the-security-checklist",
			"content": "Debug and development-only endpoints disabled in production"
		},
		{
			"heading": "the-security-checklist",
			"content": "Dependency audits pass, and the deploy checklist has been reviewed"
		},
		{
			"heading": "the-security-checklist",
			"content": "Each item has a dedicated page. The next five documents expand each defense from \"this exists\" to \"this is how it behaves.\""
		},
		{
			"heading": "whats-next",
			"content": "Default Protections — what a fresh Kwiva app blocks out of the box"
		},
		{
			"heading": "whats-next",
			"content": "Headers — the security headers sent by default"
		},
		{
			"heading": "whats-next",
			"content": "Input Validation — typed validation on every boundary"
		},
		{
			"heading": "whats-next",
			"content": "Production — environment gating and the production checklist"
		},
		{
			"heading": "whats-next",
			"content": "Tenancy Isolation — the isolation mechanism behind 404-masking"
		}
	],
	"headings": [
		{
			"id": "security-at-every-layer",
			"content": "Security at Every Layer"
		},
		{
			"id": "the-threat-model",
			"content": "The Threat Model"
		},
		{
			"id": "protective-defaults",
			"content": "Protective Defaults"
		},
		{
			"id": "tenant-isolation-and-authorization",
			"content": "Tenant Isolation and Authorization"
		},
		{
			"id": "where-the-levers-are",
			"content": "Where the Levers Are"
		},
		{
			"id": "application-code-still-plays-a-role",
			"content": "Application Code Still Plays a Role"
		},
		{
			"id": "pressing-on-the-boundaries",
			"content": "Pressing on the Boundaries"
		},
		{
			"id": "the-security-checklist",
			"content": "The Security Checklist"
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
		url: "#security-at-every-layer",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Security at Every Layer" })
	},
	{
		depth: 2,
		url: "#the-threat-model",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Threat Model" })
	},
	{
		depth: 2,
		url: "#protective-defaults",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Protective Defaults" })
	},
	{
		depth: 2,
		url: "#tenant-isolation-and-authorization",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Tenant Isolation and Authorization" })
	},
	{
		depth: 2,
		url: "#where-the-levers-are",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Where the Levers Are" })
	},
	{
		depth: 2,
		url: "#application-code-still-plays-a-role",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Application Code Still Plays a Role" })
	},
	{
		depth: 2,
		url: "#pressing-on-the-boundaries",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Pressing on the Boundaries" })
	},
	{
		depth: 2,
		url: "#the-security-checklist",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Security Checklist" })
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
		input: "input",
		li: "li",
		ol: "ol",
		p: "p",
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva treats security as a property of the framework surface, not a checklist that application code must remember. Because requests, sessions, tenant isolation, validation, jobs, and page rendering all pass through framework-owned machinery, the defensive defaults land at every layer without you wiring them in. The security model is: defaults are safe, opt-outs are explicit and loud, and the attack surface of a Kwiva application is smaller than equivalent code written by hand." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "security-at-every-layer",
			children: "Security at Every Layer"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Defenses are placed where the attack actually arrives, across four layers:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Layer" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Defense" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Request" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Typecasts validate every input at the boundary, security headers ship by default, CSRF protection guards state-changing requests" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Session" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "HttpOnly, SameSite, and Secure cookies; constant-time session handling" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Identity" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Argon2id password hashing, rate-limited auth endpoints, enumeration-safe responses" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Tenant" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Query scoping enforced by the tenant layer, missing resources return 404 to avoid information leaks" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The result is a stack where a vulnerability in application code has to defeat the framework boundary first — and the framework boundary is where the defaults are strongest." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-threat-model",
			children: "The Threat Model"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The security documentation assumes an attacker who can:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Reach your public endpoints with crafted requests — manipulation of inputs, headers, and cookies" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Observe session traffic and attempt session hijack or fixation" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Probe multi-tenant behavior for cross-tenant data access" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Attempt injection against queries and rendered output" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "It does not assume an attacker with the database credentials or the production filesystem. Secrets handling, heads-up production configuration, and dependency hygiene are covered separately in the production guide." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "protective-defaults",
			children: "Protective Defaults"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The single most important posture in Kwiva: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "the safe choice is the default" }),
			". A fresh application ships with:"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Typed validation on controllers, models, jobs, events, and channels — unvalidated input never reaches an executor" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "CSRF double-submit token protection on state-changing requests" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "A strict, nonce-based Content Security Policy in production, with report-only mode in development" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				"A hardened cookie policy — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "HttpOnly" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "SameSite=lax" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "Secure" }),
				" in production — with the CSRF cookie further restricted"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Rate limiting on authentication endpoints (strict) and API mutation (default), with the ability to tune per route" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Security headers middleware enabled by default, sending a conservative header set unless you override it" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Identical 401 responses for unknown users and wrong passwords, so sign-in endpoints do not enumerate accounts" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Enforced tenant scoping with 404-masking for cross-tenant resource access" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Each default is overridable — but overriding is an explicit, deliberate act with a documented trade-off, not an accident of configuration." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "tenant-isolation-and-authorization",
			children: "Tenant Isolation and Authorization"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Tenant isolation is enforced in the query layer and in the response path:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Queries are scoped by the tenant layer to the arranged tenant; a lookup outside it returns nothing without leaking existence" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Missing cross-tenant resources return 404 rather than 403, so an attacker cannot probe which IDs exist" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Authorization policies run before side effects — a user cannot create, update, or delete through a route that outruns its policy" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Authorization elsewhere is covered by ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/policies",
				children: "Policies"
			}),
			", and the isolation mechanism itself has its own in-depth treatment on ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/isolation",
				children: "Tenancy Isolation"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "where-the-levers-are",
			children: "Where the Levers Are"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Each defense ships with a documented override point. The table below maps concerns to pages on this documentation:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Concern" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Page" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Default protections, CSRF, cookies, rate limits" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/default-protections",
				children: "Default Protections"
			}) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Security headers, CSP, per-route overrides" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/headers",
				children: "Headers"
			}) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Typed validation on every input boundary" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/input-validation",
				children: "Input Validation"
			}) })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Environment gating, secrets, audits, production-only hardening" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/production",
				children: "Production"
			}) })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "application-code-still-plays-a-role",
			children: "Application Code Still Plays a Role"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Protective defaults narrow the surface; they do not replace judgment. Three habits keep application code aligned to the framework's posture:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Do not disable defaults." }), " Most reportable vulnerabilities in Kwiva apps come from overriding a default without substituting a comparable control."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Log and correlate." }), " Error handling and observability cooperate: correlation IDs and structured error responses are security tools too, because they turn an incident into a traceable story."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Follow the lifecycles." }),
				" Deleting users, rotating keys, and clearing sessions have framework-supported paths — use them, and keep ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "key:generate" }),
				" and its rotation flow in the deploy checklist."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The pages that follow are organized the same way the stack is: default protections first, then headers, then validation, then the production checklist. Each expands one defensive layer from \"this exists\" to \"this is how it behaves under attack.\"" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "pressing-on-the-boundaries",
			children: "Pressing on the Boundaries"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A healthy security posture is one you can verify. Because the protections above live in framework-owned machinery, verifying them is a series of concrete, cheap probes rather than an audit of application code:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Send a state-changing request without the CSRF token — expected: rejected before the handler" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Fetch a production response and read its headers — expected: the strict, nonce-based CSP and hardened cookie flags" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Query a resource ID that exists in another tenant — expected: 404, identical to a missing ID" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Attempt to sign in with an unknown account, then with a wrong password — expected: identical 401 responses" }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Read the response headers of every route you expose — expected: no dev-only headers leaking into production responses" }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Each probe maps to a documented default on the next pages. When a probe returns something other than the expected result, you have found either an intentional override or a regression to fix — both are discoverable, which is the entire point of defaults." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-security-checklist",
			children: "The Security Checklist"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "As a working checklist for an application before it ships:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, {
			className: "contains-task-list",
			children: [
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Authentication endpoints rate-limited; ",
						(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "key:generate" }),
						" has been run and secrets are out of the repository"
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Sessions are HttpOnly and secure in production; CSRF protection active on mutations"
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Strict CSP enabled in production; development CSP in report-only mode"
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Inputs validated at every boundary — controllers, models, jobs, events, and channels"
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Policies attached to protected routes; tenant scoping verified against a second tenant"
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Debug and development-only endpoints disabled in production"
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.li, {
					className: "task-list-item",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.input, {
							type: "checkbox",
							disabled: true
						}),
						" ",
						"Dependency audits pass, and the deploy checklist has been reviewed"
					]
				}),
				"\n"
			]
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Each item has a dedicated page. The next five documents expand each defense from \"this exists\" to \"this is how it behaves.\"" }),
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
			}), " — what a fresh Kwiva app blocks out of the box"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/headers",
				children: "Headers"
			}), " — the security headers sent by default"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/input-validation",
				children: "Input Validation"
			}), " — typed validation on every boundary"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/production",
				children: "Production"
			}), " — environment gating and the production checklist"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy/isolation",
				children: "Tenancy Isolation"
			}), " — the isolation mechanism behind 404-masking"] }),
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
