import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/auth/providers.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Auth Providers",
	"description": "Password, OAuth, passkeys, and magic links — enabling providers, comparing their behavior, and rendering sign-in screens."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nProviders are how users prove who they are. `defineAuth` composes them from a single map, and each enabled provider contributes its endpoints, its hooks, and its UI requirements to the generated auth surface. You enable the methods your product needs and let the framework's auth engine handle the protocol details — token exchange, callback handling, credential storage, and session creation are all the framework's, never yours.\n\nEvery provider funnels into the same session machinery. That single fact shapes everything else on this page: the method a user chooses to sign in does not change what a session is, what `ctx.session` contains, or how policies treat the resulting identity. A password sign-in and a Google sign-in both end with a typed session user backed by the same user model row.\n\n## The Provider Map [#the-provider-map]\n\n```ts title=\"the-provider-map.ts\"\nexport default defineAuth({\n  providers: {\n    password: { enabled: true, minLength: 10 },\n    oauth: {\n      google: { clientId: env('GOOGLE_CLIENT_ID'), secret: env('GOOGLE_SECRET') },\n      github: true,\n    },\n    passkeys: { enabled: true },           // v1.x\n    magicLink: { enabled: true },          // v1.x (needs mail)\n  },\n})\n```\n\nUnlisted providers are simply absent — no routes registered, no dependencies pulled in, no UI to account for. The map is declarative in both directions: whatever you list becomes part of the generated surface, and whatever you omit never lands in the bundle.\n\n## Provider Comparison [#provider-comparison]\n\n| Provider   | How the user signs in                            | Routes                                                    | Status | Requires                   |\n| ---------- | ------------------------------------------------ | --------------------------------------------------------- | ------ | -------------------------- |\n| Password   | Email and password                               | `POST /auth/sign-up` · `/auth/sign-in` · `/auth/sign-out` | v1     | Nothing extra              |\n| OAuth      | Redirect through a third-party identity provider | `GET /auth/oauth/:provider` · callback                    | v1     | Provider credentials       |\n| Passkeys   | WebAuthn device credentials                      | `POST /auth/passkeys/*`                                   | v1.x   | A WebAuthn-capable runtime |\n| Magic link | Passwordless email link                          | `POST /auth/sign-in` (email flow)                         | v1.x   | A mail integration         |\n\n### Password [#password]\n\nThe default choice and the one every app can start with. Passwords are hashed with an engine-level argon2id policy — the framework never sees plaintext beyond the sign-up and sign-in boundaries — and the configurable `minLength` lets you enforce a floor that matches your threat model. Responses are enumeration-safe: `UNAUTHORIZED` is returned both when the email is unknown and when the password is wrong, so sign-in never reveals which accounts exist.\n\nThe flow is three routes: sign-up creates the account and a session, sign-in exchanges credentials for a session, and sign-out revokes it. The auth routes are additionally rate-limited by default through `src/config/api.ts`, so credential endpoints are throttled without you wiring anything.\n\n### OAuth [#oauth]\n\nFor delegated identity, the OAuth providers are configured as a per-provider list that stays open — Google and GitHub are the built-in names, and the pattern extends to any provider. Google takes explicit credentials:\n\n```ts title=\"oauth.ts\"\noauth: {\n  google: { clientId: env('GOOGLE_CLIENT_ID'), secret: env('GOOGLE_SECRET') },\n}\n```\n\n`github: true` opts into environment-driven defaults. The generated flow runs `GET /auth/oauth/:provider`, redirects through the identity provider, and handles the callback — creating the account on first sign-in and reusing it afterward. OAuth accounts are stored as engine-managed columns on the user model, so `ctx.session` looks identical whether the user arrived by password or by Google.\n\nThe OAuth handshake follows the standard OAuth2 flow: the browser is redirected to the identity provider, the user approves, and the callback exchanges the authorization grant for identity before the engine establishes a session for the resulting user record. If the same email later signs in with a password, both paths resolve to the same row — there is no split identity to reconcile.\n\n> \\[!NOTE]\n> The OAuth callback routes are intentionally framework-owned. You never write the redirect or token-exchange handler; you configure credentials and the routes appear.\n\n### Passkeys (v1.x) [#passkeys-v1x]\n\nWebAuthn lets users register a device credential — a built-in biometric or security key — and sign in without a password. `passkeys: { enabled: true }` adds the registration and authentication routes under `/auth/passkeys/*`. Passkeys compose cleanly with passwords: a user can sign up with a password and later add a passkey to the same account.\n\nThe registration handshake stores the public credential in engine-managed columns on the user model, and subsequent authentication verifies the device challenge — no secret is ever stored on the server. The framework owns the raw WebAuthn ceremony; your application sees the same session result as any other provider.\n\n### Magic Links (v1.x) [#magic-links-v1x]\n\nPasswordless sign-in sends a one-time link by email; following it creates or resumes a session. Because the token is delivered out of band, there is no password to leak or reset. This provider requires a mail integration to deliver the links, and `verifyEmail` user flows reuse the same delivery channel.\n\n## Enabling Multiple Providers [#enabling-multiple-providers]\n\nProviders are deliberately independent and stackable. The generated routes merge into one surface, hooks fire consistently for every sign-in method, and each user carries a single unified identity — the engine-managed columns track which accounts and credentials belong to whom, so mixed-method users are not separate records.\n\nOne consequence worth planning for: a user who signs in with a password and later signs in with Google is the same `session.user` — and therefore subject to the same policies and the same `role` — because both flows resolve to the same user model row. Provisioning, bans, and revocation therefore act on one account regardless of how the user authenticates.\n\n| Concern    | Behavior with multiple providers                                   |\n| ---------- | ------------------------------------------------------------------ |\n| Identity   | One user row per person, regardless of sign-in method              |\n| Hooks      | `onSignIn` fires exactly once per successful sign-in, any provider |\n| Revocation | Sign-out or ban invalidates every session, any provider            |\n| Policies   | Same `ctx.session`, same `role`, same decisions                    |\n\n## Sign-in Screens [#sign-in-screens]\n\nRendering is your choice. Providers work with ready-made screens from the ui-kit `AuthScreen` pattern, or with fully custom pages — the page just has to call the same generated endpoints. What you never have to write is the protocol layer: token exchange, callback handling, credential storage, and session creation are all the framework's.\n\nOn the client, the result of any provider is the same reactive identity exposed by `useSession()`. A minimal custom flow renders an `AuthScreen` from the ui-kit when the user is unauthenticated and the real app when a session exists — the provider only affects which form the screen shows, never what the hook hands back.\n\n## What's Next [#whats-next]\n\n* [Auth Configuration](/docs/auth/configuration) — the rest of the `defineAuth` surface\n* [Sessions](/docs/auth/sessions) — what a sign-in produces, and how it behaves\n* [Protecting Routes](/docs/auth/protecting-routes) — guarding what signed-in users can reach\n* [Client-Side Auth](/docs/auth/client-usage) — provider-agnostic `useSession()` in the frontend\n* [Security](/docs/security/default-protections) — rate limiting and enumeration resistance\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Providers are how users prove who they are. `defineAuth` composes them from a single map, and each enabled provider contributes its endpoints, its hooks, and its UI requirements to the generated auth surface. You enable the methods your product needs and let the framework's auth engine handle the protocol details — token exchange, callback handling, credential storage, and session creation are all the framework's, never yours."
		},
		{
			"heading": void 0,
			"content": "Every provider funnels into the same session machinery. That single fact shapes everything else on this page: the method a user chooses to sign in does not change what a session is, what `ctx.session` contains, or how policies treat the resulting identity. A password sign-in and a Google sign-in both end with a typed session user backed by the same user model row."
		},
		{
			"heading": "the-provider-map",
			"content": "Unlisted providers are simply absent — no routes registered, no dependencies pulled in, no UI to account for. The map is declarative in both directions: whatever you list becomes part of the generated surface, and whatever you omit never lands in the bundle."
		},
		{
			"heading": "provider-comparison",
			"content": "Provider"
		},
		{
			"heading": "provider-comparison",
			"content": "How the user signs in"
		},
		{
			"heading": "provider-comparison",
			"content": "Routes"
		},
		{
			"heading": "provider-comparison",
			"content": "Status"
		},
		{
			"heading": "provider-comparison",
			"content": "Requires"
		},
		{
			"heading": "provider-comparison",
			"content": "Password"
		},
		{
			"heading": "provider-comparison",
			"content": "Email and password"
		},
		{
			"heading": "provider-comparison",
			"content": "`POST /auth/sign-up` · `/auth/sign-in` · `/auth/sign-out`"
		},
		{
			"heading": "provider-comparison",
			"content": "v1"
		},
		{
			"heading": "provider-comparison",
			"content": "Nothing extra"
		},
		{
			"heading": "provider-comparison",
			"content": "OAuth"
		},
		{
			"heading": "provider-comparison",
			"content": "Redirect through a third-party identity provider"
		},
		{
			"heading": "provider-comparison",
			"content": "`GET /auth/oauth/:provider` · callback"
		},
		{
			"heading": "provider-comparison",
			"content": "v1"
		},
		{
			"heading": "provider-comparison",
			"content": "Provider credentials"
		},
		{
			"heading": "provider-comparison",
			"content": "Passkeys"
		},
		{
			"heading": "provider-comparison",
			"content": "WebAuthn device credentials"
		},
		{
			"heading": "provider-comparison",
			"content": "`POST /auth/passkeys/*`"
		},
		{
			"heading": "provider-comparison",
			"content": "v1.x"
		},
		{
			"heading": "provider-comparison",
			"content": "A WebAuthn-capable runtime"
		},
		{
			"heading": "provider-comparison",
			"content": "Magic link"
		},
		{
			"heading": "provider-comparison",
			"content": "Passwordless email link"
		},
		{
			"heading": "provider-comparison",
			"content": "`POST /auth/sign-in` (email flow)"
		},
		{
			"heading": "provider-comparison",
			"content": "v1.x"
		},
		{
			"heading": "provider-comparison",
			"content": "A mail integration"
		},
		{
			"heading": "password",
			"content": "The default choice and the one every app can start with. Passwords are hashed with an engine-level argon2id policy — the framework never sees plaintext beyond the sign-up and sign-in boundaries — and the configurable `minLength` lets you enforce a floor that matches your threat model. Responses are enumeration-safe: `UNAUTHORIZED` is returned both when the email is unknown and when the password is wrong, so sign-in never reveals which accounts exist."
		},
		{
			"heading": "password",
			"content": "The flow is three routes: sign-up creates the account and a session, sign-in exchanges credentials for a session, and sign-out revokes it. The auth routes are additionally rate-limited by default through `src/config/api.ts`, so credential endpoints are throttled without you wiring anything."
		},
		{
			"heading": "oauth",
			"content": "For delegated identity, the OAuth providers are configured as a per-provider list that stays open — Google and GitHub are the built-in names, and the pattern extends to any provider. Google takes explicit credentials:"
		},
		{
			"heading": "oauth",
			"content": "`github: true` opts into environment-driven defaults. The generated flow runs `GET /auth/oauth/:provider`, redirects through the identity provider, and handles the callback — creating the account on first sign-in and reusing it afterward. OAuth accounts are stored as engine-managed columns on the user model, so `ctx.session` looks identical whether the user arrived by password or by Google."
		},
		{
			"heading": "oauth",
			"content": "The OAuth handshake follows the standard OAuth2 flow: the browser is redirected to the identity provider, the user approves, and the callback exchanges the authorization grant for identity before the engine establishes a session for the resulting user record. If the same email later signs in with a password, both paths resolve to the same row — there is no split identity to reconcile."
		},
		{
			"heading": "oauth",
			"content": "> \\[!NOTE]\n> The OAuth callback routes are intentionally framework-owned. You never write the redirect or token-exchange handler; you configure credentials and the routes appear."
		},
		{
			"heading": "passkeys-v1x",
			"content": "WebAuthn lets users register a device credential — a built-in biometric or security key — and sign in without a password. `passkeys: { enabled: true }` adds the registration and authentication routes under `/auth/passkeys/*`. Passkeys compose cleanly with passwords: a user can sign up with a password and later add a passkey to the same account."
		},
		{
			"heading": "passkeys-v1x",
			"content": "The registration handshake stores the public credential in engine-managed columns on the user model, and subsequent authentication verifies the device challenge — no secret is ever stored on the server. The framework owns the raw WebAuthn ceremony; your application sees the same session result as any other provider."
		},
		{
			"heading": "magic-links-v1x",
			"content": "Passwordless sign-in sends a one-time link by email; following it creates or resumes a session. Because the token is delivered out of band, there is no password to leak or reset. This provider requires a mail integration to deliver the links, and `verifyEmail` user flows reuse the same delivery channel."
		},
		{
			"heading": "enabling-multiple-providers",
			"content": "Providers are deliberately independent and stackable. The generated routes merge into one surface, hooks fire consistently for every sign-in method, and each user carries a single unified identity — the engine-managed columns track which accounts and credentials belong to whom, so mixed-method users are not separate records."
		},
		{
			"heading": "enabling-multiple-providers",
			"content": "One consequence worth planning for: a user who signs in with a password and later signs in with Google is the same `session.user` — and therefore subject to the same policies and the same `role` — because both flows resolve to the same user model row. Provisioning, bans, and revocation therefore act on one account regardless of how the user authenticates."
		},
		{
			"heading": "enabling-multiple-providers",
			"content": "Concern"
		},
		{
			"heading": "enabling-multiple-providers",
			"content": "Behavior with multiple providers"
		},
		{
			"heading": "enabling-multiple-providers",
			"content": "Identity"
		},
		{
			"heading": "enabling-multiple-providers",
			"content": "One user row per person, regardless of sign-in method"
		},
		{
			"heading": "enabling-multiple-providers",
			"content": "Hooks"
		},
		{
			"heading": "enabling-multiple-providers",
			"content": "`onSignIn` fires exactly once per successful sign-in, any provider"
		},
		{
			"heading": "enabling-multiple-providers",
			"content": "Revocation"
		},
		{
			"heading": "enabling-multiple-providers",
			"content": "Sign-out or ban invalidates every session, any provider"
		},
		{
			"heading": "enabling-multiple-providers",
			"content": "Policies"
		},
		{
			"heading": "enabling-multiple-providers",
			"content": "Same `ctx.session`, same `role`, same decisions"
		},
		{
			"heading": "sign-in-screens",
			"content": "Rendering is your choice. Providers work with ready-made screens from the ui-kit `AuthScreen` pattern, or with fully custom pages — the page just has to call the same generated endpoints. What you never have to write is the protocol layer: token exchange, callback handling, credential storage, and session creation are all the framework's."
		},
		{
			"heading": "sign-in-screens",
			"content": "On the client, the result of any provider is the same reactive identity exposed by `useSession()`. A minimal custom flow renders an `AuthScreen` from the ui-kit when the user is unauthenticated and the real app when a session exists — the provider only affects which form the screen shows, never what the hook hands back."
		},
		{
			"heading": "whats-next",
			"content": "Auth Configuration — the rest of the `defineAuth` surface"
		},
		{
			"heading": "whats-next",
			"content": "Sessions — what a sign-in produces, and how it behaves"
		},
		{
			"heading": "whats-next",
			"content": "Protecting Routes — guarding what signed-in users can reach"
		},
		{
			"heading": "whats-next",
			"content": "Client-Side Auth — provider-agnostic `useSession()` in the frontend"
		},
		{
			"heading": "whats-next",
			"content": "Security — rate limiting and enumeration resistance"
		}
	],
	"headings": [
		{
			"id": "the-provider-map",
			"content": "The Provider Map"
		},
		{
			"id": "provider-comparison",
			"content": "Provider Comparison"
		},
		{
			"id": "password",
			"content": "Password"
		},
		{
			"id": "oauth",
			"content": "OAuth"
		},
		{
			"id": "passkeys-v1x",
			"content": "Passkeys (v1.x)"
		},
		{
			"id": "magic-links-v1x",
			"content": "Magic Links (v1.x)"
		},
		{
			"id": "enabling-multiple-providers",
			"content": "Enabling Multiple Providers"
		},
		{
			"id": "sign-in-screens",
			"content": "Sign-in Screens"
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
		url: "#the-provider-map",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Provider Map" })
	},
	{
		depth: 2,
		url: "#provider-comparison",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Provider Comparison" })
	},
	{
		depth: 3,
		url: "#password",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Password" })
	},
	{
		depth: 3,
		url: "#oauth",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "OAuth" })
	},
	{
		depth: 3,
		url: "#passkeys-v1x",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Passkeys (v1.x)" })
	},
	{
		depth: 3,
		url: "#magic-links-v1x",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Magic Links (v1.x)" })
	},
	{
		depth: 2,
		url: "#enabling-multiple-providers",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Enabling Multiple Providers" })
	},
	{
		depth: 2,
		url: "#sign-in-screens",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Sign-in Screens" })
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
			"Providers are how users prove who they are. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineAuth" }),
			" composes them from a single map, and each enabled provider contributes its endpoints, its hooks, and its UI requirements to the generated auth surface. You enable the methods your product needs and let the framework's auth engine handle the protocol details — token exchange, callback handling, credential storage, and session creation are all the framework's, never yours."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every provider funnels into the same session machinery. That single fact shapes everything else on this page: the method a user chooses to sign in does not change what a session is, what ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session" }),
			" contains, or how policies treat the resulting identity. A password sign-in and a Google sign-in both end with a typed session user backed by the same user model row."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-provider-map",
			children: "The Provider Map"
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
			title: "the-provider-map.ts",
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
						children: "})"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Unlisted providers are simply absent — no routes registered, no dependencies pulled in, no UI to account for. The map is declarative in both directions: whatever you list becomes part of the generated surface, and whatever you omit never lands in the bundle." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "provider-comparison",
			children: "Provider Comparison"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Provider" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "How the user signs in" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Routes" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Status" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Requires" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Password" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Email and password" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "POST /auth/sign-up" }),
					" · ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/auth/sign-in" }),
					" · ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/auth/sign-out" })
				] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "v1" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Nothing extra" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "OAuth" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Redirect through a third-party identity provider" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "GET /auth/oauth/:provider" }), " · callback"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "v1" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Provider credentials" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Passkeys" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "WebAuthn device credentials" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "POST /auth/passkeys/*" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "v1.x" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A WebAuthn-capable runtime" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Magic link" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Passwordless email link" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "POST /auth/sign-in" }), " (email flow)"] }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "v1.x" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "A mail integration" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "password",
			children: "Password"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The default choice and the one every app can start with. Passwords are hashed with an engine-level argon2id policy — the framework never sees plaintext beyond the sign-up and sign-in boundaries — and the configurable ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "minLength" }),
			" lets you enforce a floor that matches your threat model. Responses are enumeration-safe: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "UNAUTHORIZED" }),
			" is returned both when the email is unknown and when the password is wrong, so sign-in never reveals which accounts exist."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The flow is three routes: sign-up creates the account and a session, sign-in exchanges credentials for a session, and sign-out revokes it. The auth routes are additionally rate-limited by default through ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/api.ts" }),
			", so credential endpoints are throttled without you wiring anything."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "oauth",
			children: "OAuth"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "For delegated identity, the OAuth providers are configured as a per-provider list that stays open — Google and GitHub are the built-in names, and the pattern extends to any provider. Google takes explicit credentials:" }),
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
			title: "oauth.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "oauth"
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ": {"
					})]
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
							children: "  google"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": { "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "clientId"
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
							children: "), "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "secret"
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
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "}"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "github: true" }),
			" opts into environment-driven defaults. The generated flow runs ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "GET /auth/oauth/:provider" }),
			", redirects through the identity provider, and handles the callback — creating the account on first sign-in and reusing it afterward. OAuth accounts are stored as engine-managed columns on the user model, so ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session" }),
			" looks identical whether the user arrived by password or by Google."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The OAuth handshake follows the standard OAuth2 flow: the browser is redirected to the identity provider, the user approves, and the callback exchanges the authorization grant for identity before the engine establishes a session for the resulting user record. If the same email later signs in with a password, both paths resolve to the same row — there is no split identity to reconcile." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "[!NOTE]\nThe OAuth callback routes are intentionally framework-owned. You never write the redirect or token-exchange handler; you configure credentials and the routes appear." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "passkeys-v1x",
			children: "Passkeys (v1.x)"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"WebAuthn lets users register a device credential — a built-in biometric or security key — and sign in without a password. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "passkeys: { enabled: true }" }),
			" adds the registration and authentication routes under ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/auth/passkeys/*" }),
			". Passkeys compose cleanly with passwords: a user can sign up with a password and later add a passkey to the same account."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The registration handshake stores the public credential in engine-managed columns on the user model, and subsequent authentication verifies the device challenge — no secret is ever stored on the server. The framework owns the raw WebAuthn ceremony; your application sees the same session result as any other provider." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "magic-links-v1x",
			children: "Magic Links (v1.x)"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Passwordless sign-in sends a one-time link by email; following it creates or resumes a session. Because the token is delivered out of band, there is no password to leak or reset. This provider requires a mail integration to deliver the links, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "verifyEmail" }),
			" user flows reuse the same delivery channel."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "enabling-multiple-providers",
			children: "Enabling Multiple Providers"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Providers are deliberately independent and stackable. The generated routes merge into one surface, hooks fire consistently for every sign-in method, and each user carries a single unified identity — the engine-managed columns track which accounts and credentials belong to whom, so mixed-method users are not separate records." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"One consequence worth planning for: a user who signs in with a password and later signs in with Google is the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "session.user" }),
			" — and therefore subject to the same policies and the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "role" }),
			" — because both flows resolve to the same user model row. Provisioning, bans, and revocation therefore act on one account regardless of how the user authenticates."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Concern" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Behavior with multiple providers" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Identity" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "One user row per person, regardless of sign-in method" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Hooks" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onSignIn" }), " fires exactly once per successful sign-in, any provider"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Revocation" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Sign-out or ban invalidates every session, any provider" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Policies" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Same ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "ctx.session" }),
				", same ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "role" }),
				", same decisions"
			] })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "sign-in-screens",
			children: "Sign-in Screens"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Rendering is your choice. Providers work with ready-made screens from the ui-kit ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "AuthScreen" }),
			" pattern, or with fully custom pages — the page just has to call the same generated endpoints. What you never have to write is the protocol layer: token exchange, callback handling, credential storage, and session creation are all the framework's."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"On the client, the result of any provider is the same reactive identity exposed by ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useSession()" }),
			". A minimal custom flow renders an ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "AuthScreen" }),
			" from the ui-kit when the user is unauthenticated and the real app when a session exists — the provider only affects which form the screen shows, never what the hook hands back."
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
				" — the rest of the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineAuth" }),
				" surface"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/auth/sessions",
				children: "Sessions"
			}), " — what a sign-in produces, and how it behaves"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/auth/protecting-routes",
				children: "Protecting Routes"
			}), " — guarding what signed-in users can reach"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/auth/client-usage",
					children: "Client-Side Auth"
				}),
				" — provider-agnostic ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useSession()" }),
				" in the frontend"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/security/default-protections",
				children: "Security"
			}), " — rate limiting and enumeration resistance"] }),
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
