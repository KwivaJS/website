import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/auth/client-usage.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Client-Side Auth",
	"description": "useSession() in the browser, sign-in and sign-out flows, session-aware data hooks, and SSR-safe rendering."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\nAuthenticated frontends need three things: current identity, a way to change it, and UI that reacts when it changes. Kwiva delivers all three through `useSession()` and the session-aware data hooks, with server rendering that never flashes the wrong state. The session that arrives in the browser is the same typed identity the server uses — no client-side re-derivation, no duplicated auth logic in components.\n\n## The useSession Hook [#the-usesession-hook]\n\nThe frontend entry point is `useSession()`, which returns the current user, the sign-out action, and the pending state:\n\n```tsx title=\"the-usesession-hook.tsx\"\nconst { user, signOut, isPending } = useSession()\n```\n\n* **user** — the typed session user, or `null` when signed out.\n* **signOut** — revokes the session and updates every session-aware hook.\n* **isPending** — lets you render loading UI instead of a guessed state during the initial fetch.\n\nThe hook is reactive by default: page components subscribe, and the whole tree re-renders when identity changes — a signing out from a profile menu clears the navbar's avatar without a reload. Every component that reads `useSession()` observes the same underlying session, so identity changes propagate consistently across the tree.\n\n### Where the identity comes from [#where-the-identity-comes-from]\n\nThe hook resolves its value from the root context rather than making its own determinations about cookie contents. During server render the session is read from the cookie; on the client the same value is hydrated from the SSR payload. `user` therefore reflects the server's authenticated decision — the browser never has to re-derive \"who am I\" and risk disagreeing with the server.\n\n### The pending state [#the-pending-state]\n\n`isPending` covers the one moment where the hook does not yet know the answer: the initial fetch before identity resolves. Render a neutral state there instead of guessing. Guessing wrong produces the classic flash — a signed-out avatar that flips to the signed-in one, or a protected view that briefly renders for a stranger. The hook prefers the honest `isPending` so your UI can render a meaningful placeholder exactly once, then settle into the server's answer.\n\n## The Typed Identity in Components [#the-typed-identity-in-components]\n\nThe user object from `useSession()` is the same typed shape as the server's session user, down to the field names in your auth configuration. If you map `fields: { email, name, role }`, every component that reads `session.user.role` sees a typed enum, and every `session.user.email` is a string the type system knows. The pairing of `useSession()` and `useCan(...)` covers the two frontend questions — \"who is here?\" and \"what can they do?\" — without either hook needing to know how the answer was produced.\n\n### Reactivity across the tree [#reactivity-across-the-tree]\n\nThe hook subscribes to the shared session value, so identity changes propagate to every component that reads it — not just the component that called `signOut`. When a session is revoked server-side (an admin ban, a device revoke), the client does not need to wait for a full reload: the next session-sensitive operation picks up the null identity, conditional UI settles into the signed-out view, and `beforeLoad` guards on navigations enforce the boundary if the user tries to continue.\n\n## Sign-in Screens and the AuthScreen Pattern [#sign-in-screens-and-the-authscreen-pattern]\n\nThe ui-kit `AuthScreen` pattern covers the common flows — credential sign-in, OAuth buttons, and (in v1.x) passkey and magic-link entry points — and calls the generated endpoints on your behalf. Custom pages are equally welcome as long as they call the same endpoints. What the framework guarantees in both cases is that the *route* to a session is standard. The protocol details — hashing on the server, OAuth callback handling, token issuance — never leak into page code, so a custom page cannot accidentally implement credentials incorrectly.\n\n## Sign-In and Sign-Out Flows [#sign-in-and-sign-out-flows]\n\nThe generated auth endpoints are called either directly by your chosen screen or by the ready-made ui-kit `AuthScreen` pattern. A minimal custom flow calls the API and lets the hooks react:\n\n```tsx title=\"sign-in-and-sign-out-flows.tsx\"\nconst { user, isPending } = useSession()\n\nif (!user && !isPending) {\n  // Render the sign-in form; submitting calls POST /auth/sign-up\n  // or /auth/sign-in through the typed client.\n  return <AuthScreen />\n}\n\nreturn <Dashboard />\n```\n\nWhichever provider a user signs in with — password, OAuth, passkey, or magic link — the session object that `useSession()` exposes is the same shape. The provider affects only how the browser gets there, not what the hook hands back. OAuth redirect flows, passkey ceremonies, and magic link clicks all terminate in the same session state, so the conditional render above is provider-agnostic by construction.\n\nSign-out is symmetric: call `signOut()` and the hook flips to the signed-out state everywhere at once. Since revocation lives in the shared session store, a sign-out in one tab invalidates the session for every other tab and every other instance on the next request. The same call powers the \"sign out of this device\" and \"sign out everywhere\" paths — the difference is only how many session rows are removed.\n\n## Session-Aware Data Hooks [#session-aware-data-hooks]\n\nThe data hooks are session-aware by design. `useResource`, `useList`, and `useMutation` inherit identity from the authenticated client, so queries that depend on the current user just work:\n\n```tsx title=\"session-aware-data-hooks.tsx\"\nconst { data: myPosts } = useList(Post, { where: { status: 'published' } })\nconst { mutate } = useMutation(Post.update, {\n  optimistic: (input, current) => ({ ...current, ...input }),\n})\n```\n\nNo token plumbing, no manual headers. Session cookies flow automatically on every RPC call, and mutations that require specific permissions are authorised server-side by their policy — a session can call `posts.list` and still fail `posts.publish` without any client-side guard bookkeeping.\n\nThe client never grants itself access; the server enforces. Passing an ability check client-side is a UX optimization, not an access decision. `useCan` and conditional rendering shape the UI to the user's abilities, while the actual gate stays in the route lifecycle where no amount of client manipulation can bypass it.\n\n## SSR-Safe Session Rendering [#ssr-safe-session-rendering]\n\nAuth state is rendered correctly on the first paint, not corrected after hydration. The session is read from the cookie during server render, and the same identity is dehydrated into the data hooks for the client:\n\n* The server renders the signed-in view directly.\n* The client hydrates the identical state — no logged-out flash, no flicker race.\n* `beforeLoad` guards have already run server-side, so unauthenticated visitors are redirected before any protected markup is streamed.\n\nThis is why page guards belong in `beforeLoad` and not in a client-only effect: the server makes the decision, and the client simply agrees. A client-only effect would render the protected tree first and correct it after hydration — visible to the user, wasteful of bandwidth, and wrong on the first paint.\n\n## Root Context Injection [#root-context-injection]\n\nThe session is part of the root context available to the whole tree. `createRootWithContext` injects session, config, and client into your layout, so nested components access identity without prop drilling:\n\n```tsx title=\"root-context-injection.tsx\"\nexport default createRootWithContext({\n  session,\n  client,\n})\n```\n\nFrom there, `useSession()` resolves from context and every page, layout, and component can read the authenticated identity in the same typed way. The typed RPC client rides in the same context, so session cookies attach to every call without per-component wiring.\n\n## Conditional UI Patterns [#conditional-ui-patterns]\n\nThree patterns cover most authenticated UI:\n\n* **Gate whole views** — `beforeLoad` redirects unauthenticated visitors away from a page before it renders.\n* **Branch on identity** — `useSession()` decides which variant to render, as in the sign-in example above.\n* **Branch on ability** — `useCan('posts.publish')` shows or hides an action for an authenticated user who may not hold the permission.\n\nThe first is a route decision, the second a page decision, and the third a component decision — each at the right granularity, each backed by the same session.\n\n### Invariant guards [#invariant-guards]\n\nFor pages that must be reachable only by signed-in users, the invariant belongs in `beforeLoad`, not in component logic. Relying on `useSession()` alone in a component protects the *renderer* but not the *route* — a direct navigation, a deep link, or a stale client can still fetch data before the component decides to hide it. `beforeLoad` sits earlier, runs server-side, and redirects before the loader fetches anything, which is why the page-level pattern above uses it rather than a component effect.\n\n## What's Next [#whats-next]\n\n* [Sessions](/docs/auth/sessions) — what `useSession()` is really reading, and how it expires\n* [Protecting Routes](/docs/auth/protecting-routes) — `beforeLoad` guards that run before this UI renders\n* [Data Hooks](/docs/frontend/data-hooks) — session-aware `useResource`, `useList`, and `useMutation`\n* [RPC Client](/docs/frontend/rpc-client) — how session cookies flow through typed calls\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Authenticated frontends need three things: current identity, a way to change it, and UI that reacts when it changes. Kwiva delivers all three through `useSession()` and the session-aware data hooks, with server rendering that never flashes the wrong state. The session that arrives in the browser is the same typed identity the server uses — no client-side re-derivation, no duplicated auth logic in components."
		},
		{
			"heading": "the-usesession-hook",
			"content": "The frontend entry point is `useSession()`, which returns the current user, the sign-out action, and the pending state:"
		},
		{
			"heading": "the-usesession-hook",
			"content": "**user** — the typed session user, or `null` when signed out."
		},
		{
			"heading": "the-usesession-hook",
			"content": "**signOut** — revokes the session and updates every session-aware hook."
		},
		{
			"heading": "the-usesession-hook",
			"content": "**isPending** — lets you render loading UI instead of a guessed state during the initial fetch."
		},
		{
			"heading": "the-usesession-hook",
			"content": "The hook is reactive by default: page components subscribe, and the whole tree re-renders when identity changes — a signing out from a profile menu clears the navbar's avatar without a reload. Every component that reads `useSession()` observes the same underlying session, so identity changes propagate consistently across the tree."
		},
		{
			"heading": "where-the-identity-comes-from",
			"content": "The hook resolves its value from the root context rather than making its own determinations about cookie contents. During server render the session is read from the cookie; on the client the same value is hydrated from the SSR payload. `user` therefore reflects the server's authenticated decision — the browser never has to re-derive \"who am I\" and risk disagreeing with the server."
		},
		{
			"heading": "the-pending-state",
			"content": "`isPending` covers the one moment where the hook does not yet know the answer: the initial fetch before identity resolves. Render a neutral state there instead of guessing. Guessing wrong produces the classic flash — a signed-out avatar that flips to the signed-in one, or a protected view that briefly renders for a stranger. The hook prefers the honest `isPending` so your UI can render a meaningful placeholder exactly once, then settle into the server's answer."
		},
		{
			"heading": "the-typed-identity-in-components",
			"content": "The user object from `useSession()` is the same typed shape as the server's session user, down to the field names in your auth configuration. If you map `fields: { email, name, role }`, every component that reads `session.user.role` sees a typed enum, and every `session.user.email` is a string the type system knows. The pairing of `useSession()` and `useCan(...)` covers the two frontend questions — \"who is here?\" and \"what can they do?\" — without either hook needing to know how the answer was produced."
		},
		{
			"heading": "reactivity-across-the-tree",
			"content": "The hook subscribes to the shared session value, so identity changes propagate to every component that reads it — not just the component that called `signOut`. When a session is revoked server-side (an admin ban, a device revoke), the client does not need to wait for a full reload: the next session-sensitive operation picks up the null identity, conditional UI settles into the signed-out view, and `beforeLoad` guards on navigations enforce the boundary if the user tries to continue."
		},
		{
			"heading": "sign-in-screens-and-the-authscreen-pattern",
			"content": "The ui-kit `AuthScreen` pattern covers the common flows — credential sign-in, OAuth buttons, and (in v1.x) passkey and magic-link entry points — and calls the generated endpoints on your behalf. Custom pages are equally welcome as long as they call the same endpoints. What the framework guarantees in both cases is that the *route* to a session is standard. The protocol details — hashing on the server, OAuth callback handling, token issuance — never leak into page code, so a custom page cannot accidentally implement credentials incorrectly."
		},
		{
			"heading": "sign-in-and-sign-out-flows",
			"content": "The generated auth endpoints are called either directly by your chosen screen or by the ready-made ui-kit `AuthScreen` pattern. A minimal custom flow calls the API and lets the hooks react:"
		},
		{
			"heading": "sign-in-and-sign-out-flows",
			"content": "Whichever provider a user signs in with — password, OAuth, passkey, or magic link — the session object that `useSession()` exposes is the same shape. The provider affects only how the browser gets there, not what the hook hands back. OAuth redirect flows, passkey ceremonies, and magic link clicks all terminate in the same session state, so the conditional render above is provider-agnostic by construction."
		},
		{
			"heading": "sign-in-and-sign-out-flows",
			"content": "Sign-out is symmetric: call `signOut()` and the hook flips to the signed-out state everywhere at once. Since revocation lives in the shared session store, a sign-out in one tab invalidates the session for every other tab and every other instance on the next request. The same call powers the \"sign out of this device\" and \"sign out everywhere\" paths — the difference is only how many session rows are removed."
		},
		{
			"heading": "session-aware-data-hooks",
			"content": "The data hooks are session-aware by design. `useResource`, `useList`, and `useMutation` inherit identity from the authenticated client, so queries that depend on the current user just work:"
		},
		{
			"heading": "session-aware-data-hooks",
			"content": "No token plumbing, no manual headers. Session cookies flow automatically on every RPC call, and mutations that require specific permissions are authorised server-side by their policy — a session can call `posts.list` and still fail `posts.publish` without any client-side guard bookkeeping."
		},
		{
			"heading": "session-aware-data-hooks",
			"content": "The client never grants itself access; the server enforces. Passing an ability check client-side is a UX optimization, not an access decision. `useCan` and conditional rendering shape the UI to the user's abilities, while the actual gate stays in the route lifecycle where no amount of client manipulation can bypass it."
		},
		{
			"heading": "ssr-safe-session-rendering",
			"content": "Auth state is rendered correctly on the first paint, not corrected after hydration. The session is read from the cookie during server render, and the same identity is dehydrated into the data hooks for the client:"
		},
		{
			"heading": "ssr-safe-session-rendering",
			"content": "The server renders the signed-in view directly."
		},
		{
			"heading": "ssr-safe-session-rendering",
			"content": "The client hydrates the identical state — no logged-out flash, no flicker race."
		},
		{
			"heading": "ssr-safe-session-rendering",
			"content": "`beforeLoad` guards have already run server-side, so unauthenticated visitors are redirected before any protected markup is streamed."
		},
		{
			"heading": "ssr-safe-session-rendering",
			"content": "This is why page guards belong in `beforeLoad` and not in a client-only effect: the server makes the decision, and the client simply agrees. A client-only effect would render the protected tree first and correct it after hydration — visible to the user, wasteful of bandwidth, and wrong on the first paint."
		},
		{
			"heading": "root-context-injection",
			"content": "The session is part of the root context available to the whole tree. `createRootWithContext` injects session, config, and client into your layout, so nested components access identity without prop drilling:"
		},
		{
			"heading": "root-context-injection",
			"content": "From there, `useSession()` resolves from context and every page, layout, and component can read the authenticated identity in the same typed way. The typed RPC client rides in the same context, so session cookies attach to every call without per-component wiring."
		},
		{
			"heading": "conditional-ui-patterns",
			"content": "Three patterns cover most authenticated UI:"
		},
		{
			"heading": "conditional-ui-patterns",
			"content": "**Gate whole views** — `beforeLoad` redirects unauthenticated visitors away from a page before it renders."
		},
		{
			"heading": "conditional-ui-patterns",
			"content": "**Branch on identity** — `useSession()` decides which variant to render, as in the sign-in example above."
		},
		{
			"heading": "conditional-ui-patterns",
			"content": "**Branch on ability** — `useCan('posts.publish')` shows or hides an action for an authenticated user who may not hold the permission."
		},
		{
			"heading": "conditional-ui-patterns",
			"content": "The first is a route decision, the second a page decision, and the third a component decision — each at the right granularity, each backed by the same session."
		},
		{
			"heading": "invariant-guards",
			"content": "For pages that must be reachable only by signed-in users, the invariant belongs in `beforeLoad`, not in component logic. Relying on `useSession()` alone in a component protects the *renderer* but not the *route* — a direct navigation, a deep link, or a stale client can still fetch data before the component decides to hide it. `beforeLoad` sits earlier, runs server-side, and redirects before the loader fetches anything, which is why the page-level pattern above uses it rather than a component effect."
		},
		{
			"heading": "whats-next",
			"content": "Sessions — what `useSession()` is really reading, and how it expires"
		},
		{
			"heading": "whats-next",
			"content": "Protecting Routes — `beforeLoad` guards that run before this UI renders"
		},
		{
			"heading": "whats-next",
			"content": "Data Hooks — session-aware `useResource`, `useList`, and `useMutation`"
		},
		{
			"heading": "whats-next",
			"content": "RPC Client — how session cookies flow through typed calls"
		}
	],
	"headings": [
		{
			"id": "the-usesession-hook",
			"content": "The useSession Hook"
		},
		{
			"id": "where-the-identity-comes-from",
			"content": "Where the identity comes from"
		},
		{
			"id": "the-pending-state",
			"content": "The pending state"
		},
		{
			"id": "the-typed-identity-in-components",
			"content": "The Typed Identity in Components"
		},
		{
			"id": "reactivity-across-the-tree",
			"content": "Reactivity across the tree"
		},
		{
			"id": "sign-in-screens-and-the-authscreen-pattern",
			"content": "Sign-in Screens and the AuthScreen Pattern"
		},
		{
			"id": "sign-in-and-sign-out-flows",
			"content": "Sign-In and Sign-Out Flows"
		},
		{
			"id": "session-aware-data-hooks",
			"content": "Session-Aware Data Hooks"
		},
		{
			"id": "ssr-safe-session-rendering",
			"content": "SSR-Safe Session Rendering"
		},
		{
			"id": "root-context-injection",
			"content": "Root Context Injection"
		},
		{
			"id": "conditional-ui-patterns",
			"content": "Conditional UI Patterns"
		},
		{
			"id": "invariant-guards",
			"content": "Invariant guards"
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
		url: "#the-usesession-hook",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The useSession Hook" })
	},
	{
		depth: 3,
		url: "#where-the-identity-comes-from",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Where the identity comes from" })
	},
	{
		depth: 3,
		url: "#the-pending-state",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The pending state" })
	},
	{
		depth: 2,
		url: "#the-typed-identity-in-components",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Typed Identity in Components" })
	},
	{
		depth: 3,
		url: "#reactivity-across-the-tree",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Reactivity across the tree" })
	},
	{
		depth: 2,
		url: "#sign-in-screens-and-the-authscreen-pattern",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Sign-in Screens and the AuthScreen Pattern" })
	},
	{
		depth: 2,
		url: "#sign-in-and-sign-out-flows",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Sign-In and Sign-Out Flows" })
	},
	{
		depth: 2,
		url: "#session-aware-data-hooks",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Session-Aware Data Hooks" })
	},
	{
		depth: 2,
		url: "#ssr-safe-session-rendering",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "SSR-Safe Session Rendering" })
	},
	{
		depth: 2,
		url: "#root-context-injection",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Root Context Injection" })
	},
	{
		depth: 2,
		url: "#conditional-ui-patterns",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Conditional UI Patterns" })
	},
	{
		depth: 3,
		url: "#invariant-guards",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Invariant guards" })
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
		em: "em",
		h2: "h2",
		h3: "h3",
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
			"Authenticated frontends need three things: current identity, a way to change it, and UI that reacts when it changes. Kwiva delivers all three through ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useSession()" }),
			" and the session-aware data hooks, with server rendering that never flashes the wrong state. The session that arrives in the browser is the same typed identity the server uses — no client-side re-derivation, no duplicated auth logic in components."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-usesession-hook",
			children: "The useSession Hook"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The frontend entry point is ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useSession()" }),
			", which returns the current user, the sign-out action, and the pending state:"
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
			title: "the-usesession-hook.tsx",
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
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "user" }),
				" — the typed session user, or ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "null" }),
				" when signed out."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "signOut" }), " — revokes the session and updates every session-aware hook."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "isPending" }), " — lets you render loading UI instead of a guessed state during the initial fetch."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The hook is reactive by default: page components subscribe, and the whole tree re-renders when identity changes — a signing out from a profile menu clears the navbar's avatar without a reload. Every component that reads ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useSession()" }),
			" observes the same underlying session, so identity changes propagate consistently across the tree."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "where-the-identity-comes-from",
			children: "Where the identity comes from"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The hook resolves its value from the root context rather than making its own determinations about cookie contents. During server render the session is read from the cookie; on the client the same value is hydrated from the SSR payload. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "user" }),
			" therefore reflects the server's authenticated decision — the browser never has to re-derive \"who am I\" and risk disagreeing with the server."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "the-pending-state",
			children: "The pending state"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "isPending" }),
			" covers the one moment where the hook does not yet know the answer: the initial fetch before identity resolves. Render a neutral state there instead of guessing. Guessing wrong produces the classic flash — a signed-out avatar that flips to the signed-in one, or a protected view that briefly renders for a stranger. The hook prefers the honest ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "isPending" }),
			" so your UI can render a meaningful placeholder exactly once, then settle into the server's answer."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-typed-identity-in-components",
			children: "The Typed Identity in Components"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The user object from ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useSession()" }),
			" is the same typed shape as the server's session user, down to the field names in your auth configuration. If you map ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "fields: { email, name, role }" }),
			", every component that reads ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "session.user.role" }),
			" sees a typed enum, and every ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "session.user.email" }),
			" is a string the type system knows. The pairing of ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useSession()" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useCan(...)" }),
			" covers the two frontend questions — \"who is here?\" and \"what can they do?\" — without either hook needing to know how the answer was produced."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "reactivity-across-the-tree",
			children: "Reactivity across the tree"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The hook subscribes to the shared session value, so identity changes propagate to every component that reads it — not just the component that called ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "signOut" }),
			". When a session is revoked server-side (an admin ban, a device revoke), the client does not need to wait for a full reload: the next session-sensitive operation picks up the null identity, conditional UI settles into the signed-out view, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeLoad" }),
			" guards on navigations enforce the boundary if the user tries to continue."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "sign-in-screens-and-the-authscreen-pattern",
			children: "Sign-in Screens and the AuthScreen Pattern"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ui-kit ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "AuthScreen" }),
			" pattern covers the common flows — credential sign-in, OAuth buttons, and (in v1.x) passkey and magic-link entry points — and calls the generated endpoints on your behalf. Custom pages are equally welcome as long as they call the same endpoints. What the framework guarantees in both cases is that the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.em, { children: "route" }),
			" to a session is standard. The protocol details — hashing on the server, OAuth callback handling, token issuance — never leak into page code, so a custom page cannot accidentally implement credentials incorrectly."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "sign-in-and-sign-out-flows",
			children: "Sign-In and Sign-Out Flows"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The generated auth endpoints are called either directly by your chosen screen or by the ready-made ui-kit ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "AuthScreen" }),
			" pattern. A minimal custom flow calls the API and lets the hooks react:"
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
			title: "sign-in-and-sign-out-flows.tsx",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
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
							children: "if"
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
							children: "user "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "&&"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " !"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "isPending) {"
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
						children: "  // Render the sign-in form; submitting calls POST /auth/sign-up"
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
						children: "  // or /auth/sign-in through the typed client."
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
							children: "  return"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "AuthScreen"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " />"
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
							children: "return"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " <"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "Dashboard"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " />"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Whichever provider a user signs in with — password, OAuth, passkey, or magic link — the session object that ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useSession()" }),
			" exposes is the same shape. The provider affects only how the browser gets there, not what the hook hands back. OAuth redirect flows, passkey ceremonies, and magic link clicks all terminate in the same session state, so the conditional render above is provider-agnostic by construction."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Sign-out is symmetric: call ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "signOut()" }),
			" and the hook flips to the signed-out state everywhere at once. Since revocation lives in the shared session store, a sign-out in one tab invalidates the session for every other tab and every other instance on the next request. The same call powers the \"sign out of this device\" and \"sign out everywhere\" paths — the difference is only how many session rows are removed."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "session-aware-data-hooks",
			children: "Session-Aware Data Hooks"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The data hooks are session-aware by design. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useResource" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useList" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useMutation" }),
			" inherit identity from the authenticated client, so queries that depend on the current user just work:"
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
			title: "session-aware-data-hooks.tsx",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
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
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "data"
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
							children: "myPosts"
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
							children: " useList"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(Post, { where: { status: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'published'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " } })"
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
							children: "mutate"
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
							children: " useMutation"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(Post.update, {"
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
							children: "  optimistic"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": ("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "input"
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
							children: "current"
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
							children: "current, "
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
							children: "input }),"
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
			"No token plumbing, no manual headers. Session cookies flow automatically on every RPC call, and mutations that require specific permissions are authorised server-side by their policy — a session can call ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.list" }),
			" and still fail ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts.publish" }),
			" without any client-side guard bookkeeping."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The client never grants itself access; the server enforces. Passing an ability check client-side is a UX optimization, not an access decision. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useCan" }),
			" and conditional rendering shape the UI to the user's abilities, while the actual gate stays in the route lifecycle where no amount of client manipulation can bypass it."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "ssr-safe-session-rendering",
			children: "SSR-Safe Session Rendering"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Auth state is rendered correctly on the first paint, not corrected after hydration. The session is read from the cookie during server render, and the same identity is dehydrated into the data hooks for the client:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The server renders the signed-in view directly." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "The client hydrates the identical state — no logged-out flash, no flicker race." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeLoad" }), " guards have already run server-side, so unauthenticated visitors are redirected before any protected markup is streamed."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"This is why page guards belong in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeLoad" }),
			" and not in a client-only effect: the server makes the decision, and the client simply agrees. A client-only effect would render the protected tree first and correct it after hydration — visible to the user, wasteful of bandwidth, and wrong on the first paint."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "root-context-injection",
			children: "Root Context Injection"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The session is part of the root context available to the whole tree. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "createRootWithContext" }),
			" injects session, config, and client into your layout, so nested components access identity without prop drilling:"
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
			title: "root-context-injection.tsx",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z\" fill=\"currentColor\" /></svg>",
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
							children: " createRootWithContext"
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
						children: "  session,"
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
						children: "  client,"
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
			"From there, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useSession()" }),
			" resolves from context and every page, layout, and component can read the authenticated identity in the same typed way. The typed RPC client rides in the same context, so session cookies attach to every call without per-component wiring."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "conditional-ui-patterns",
			children: "Conditional UI Patterns"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Three patterns cover most authenticated UI:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Gate whole views" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeLoad" }),
				" redirects unauthenticated visitors away from a page before it renders."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Branch on identity" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useSession()" }),
				" decides which variant to render, as in the sign-in example above."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Branch on ability" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useCan('posts.publish')" }),
				" shows or hides an action for an authenticated user who may not hold the permission."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The first is a route decision, the second a page decision, and the third a component decision — each at the right granularity, each backed by the same session." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "invariant-guards",
			children: "Invariant guards"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"For pages that must be reachable only by signed-in users, the invariant belongs in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeLoad" }),
			", not in component logic. Relying on ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useSession()" }),
			" alone in a component protects the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.em, { children: "renderer" }),
			" but not the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.em, { children: "route" }),
			" — a direct navigation, a deep link, or a stale client can still fetch data before the component decides to hide it. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeLoad" }),
			" sits earlier, runs server-side, and redirects before the loader fetches anything, which is why the page-level pattern above uses it rather than a component effect."
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
					href: "/docs/auth/sessions",
					children: "Sessions"
				}),
				" — what ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useSession()" }),
				" is really reading, and how it expires"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/auth/protecting-routes",
					children: "Protecting Routes"
				}),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "beforeLoad" }),
				" guards that run before this UI renders"
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/frontend/data-hooks",
					children: "Data Hooks"
				}),
				" — session-aware ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useResource" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useList" }),
				", and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useMutation" })
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/frontend/rpc-client",
				children: "RPC Client"
			}), " — how session cookies flow through typed calls"] }),
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
