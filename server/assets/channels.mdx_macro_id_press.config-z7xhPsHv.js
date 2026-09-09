import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/realtime/channels.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Channels",
	"description": "Subscribe to named channels with dynamic segments, enforce access at the handshake, and broadcast to connected clients."
};
var lastModified = /* @__PURE__ */ new Date(1788959971e3);
var _markdown = "\n\nChannels are Kwiva's WebSocket broadcast primitive. A channel is a named stream of messages; clients subscribe by name, servers broadcast into them, and access control is part of the channel definition rather than an afterthought. A channel is also a first-class route citizen: it runs through the same request pipeline as a REST handler, which is exactly why session and tenant state are available while it authorizes.\n\nWhere raw sockets give you one connection, channels give you a named, policy-checked, fan-out addressable group of connections. The `c.ws` route that opens a connection and the `channel()` factory that names and scopes it are complementary — see [WebSockets](/docs/http/websockets) for the socket-level surface and this page for the broadcast layer.\n\n## Defining a Channel [#defining-a-channel]\n\nA channel is defined once with the `channel()` factory from `@kwiva/http`:\n\n```ts title=\"defining-a-channel.ts\"\nimport { channel } from '@kwiva/http'\n\nexport const chat = channel('chat.{roomId}')\n  .policy(({ params, session }) => session.user && isMember(session.user, params.roomId))\n  .on('message', ({ payload }) => broadcast(payload))\n  .presence(true)\n```\n\nThis single definition declares the channel's name pattern, who may join it, and how inbound messages are handled. The definition is also the documentation: an operator reading the file sees the rule that governs every subscription to the channel family.\n\n## Dynamic Channel Names [#dynamic-channel-names]\n\nChannel names support segments. The `chat` channel family takes a dynamic room segment, so each room is one channel rather than a single blanket channel for the whole feature. When a client subscribes to `chat.42`, the subscribe handshake resolves the room segment from the requested name, and the resolved value is available to the channel's policy as `params.roomId`.\n\nDynamic segments give you:\n\n* **Isolation** — room A never sees room B's traffic.\n* **Authorization** — the policy receives the resolved segment, so membership checks are exact.\n* **Automatic fan-out** — a broadcast to `chat.42` addresses exactly one room without server-side bookkeeping.\n\nThe same idea covers user-scoped channels (`user.{id}`) and board-scoped channels (`board.{id}`), where the dynamic segment identifies the user or the board. Segments are typed from the pattern, so `params.roomId` inside the policy is a typed value, not a string you parse.\n\n## Subscribing [#subscribing]\n\nA client joins a channel by name. Subscribing is where authorization is enforced: the subscribe request is checked against the channel's policy before a connection is established, so a denied client never receives a working socket. The check happens during the WebSocket handshake, using the same policy engine that guards REST routes — the session is resolved, the tenant is resolved, and the channel policy runs against both.\n\nThe framework handles the transport details — the WebSocket upgrade, lifecycle, and socket bookkeeping. Your definition supplies only the three things that are actually specific to your product: the name pattern, the access rule, and the message handler. Any guard or middleware mounted on a `c.ws` route runs its checks on the connection before the upgrade completes, so unauthenticated clients are rejected at the handshake rather than when they send their first message.\n\n## Authorization at the Handshake [#authorization-at-the-handshake]\n\nChannel authorization is policy-based and mirrors REST authorization. The policy receives the resolved `params` and the caller's `session`, and returns a boolean:\n\n```ts title=\"authorization-at-the-handshake.ts\"\nexport const chat = channel('chat.{roomId}')\n  .policy(({ params, session }) => session.user && isMember(session.user, params.roomId))\n```\n\nA member check like `isMember` keeps the rule readable: the room segment is resolved from the subscription, the session tells you who is calling, and the policy decides whether they belong. The same policies that guard REST routes shape channel access, so an administrator who can read a room's messages can subscribe to its channel with no separate entitlement. See [Policies](/docs/authorization/policies) for the policy model that powers it.\n\n## Handling Messages [#handling-messages]\n\nAfter subscription, inbound messages route through the handlers defined on the channel. A message handler receives the typed payload and a reference to the originating socket:\n\n```ts title=\"handling-messages.ts\"\n.on('message', ({ payload }) => broadcast(payload))\n```\n\nThe handler shown echoes every message back to the whole room — the canonical chat pattern. Handlers can do more: persist first, then broadcast; filter or transform before fan-out; or route into a domain event for downstream processing. Because messages are validated against the channel's schema before the handler runs, a malformed message is rejected at the channel and never reaches your handler logic or the room.\n\n## Broadcasting from the Server [#broadcasting-from-the-server]\n\nAnywhere in your application, the `broadcast` function pushes a payload into a channel by name:\n\n```ts title=\"broadcasting-from-the-server.ts\"\n// server-side emit from anywhere in your app\nimport { broadcast } from '@kwiva/http'\n\nbroadcast('chat.42', { type: 'message', body: 'Hello' })\n```\n\nBroadcast calls are ordinary server-side operations — they can run in a controller, a job, a task, or an event listener, which is exactly how model lifecycle hooks can announce changes in realtime. The broadcast address is the concrete channel name; when multiple instances are deployed, the framework fans the message out to every instance that holds subscribers (see [Scaling Realtime](/docs/realtime/scaling)).\n\n## Model-Driven Broadcasting [#model-driven-broadcasting]\n\nThe most common broadcast is \"this record changed\", and Kwiva provides hook sugar for it on models:\n\n```ts title=\"model-driven-broadcasting.ts\"\nPost.onCreated(() => broadcast('posts'))\n```\n\nOn create, everyone subscribed to `posts` is notified. The same pattern composes with the other lifecycle hooks, and because the broadcast is a plain call, handlers can pass additional context:\n\n```ts title=\"model-driven-broadcasting-2.ts\"\nPost.onUpdated(async (post) => broadcast('posts', { id: post.id, status: post.status }))\n```\n\n## Tenant Scoping [#tenant-scoping]\n\nChannels inherit the application's tenancy rules. When tenancy is configured, subscription resolution and broadcast fan-out operate inside the resolved tenant's scope, the same scope that constrains queries, cache keys, and storage prefixes — so a client in one tenant cannot address or observe another tenant's channel traffic, even with a crafted channel name. Cross-tenant subscription attempts resolve exactly like cross-tenant record access: as if the channel does not exist. See [Tenancy](/docs/tenancy).\n\n## Presence (v1.x) [#presence-v1x]\n\nPresence tracks who is joined to a channel. On a channel with presence enabled, the framework records join and leave events, and clients can read the member set:\n\n```ts title=\"presence-v1.ts\"\n// server side\n.presence(true)\n\n// client side\nconst { members } = usePresence(`chat.${roomId}`)\n```\n\nPresence powers \"who is online in this room\" UI without custom bookkeeping. The member list and join and leave events are available to subscribers, and presence state is scoped per channel name. Presence is part of the realtime fast-follow and layers cleanly onto the same channel definitions — enabling it is a one-line option, not a parallel system. Across instances, presence state is coordinated through shared state rather than assumed to converge by accident (see [Scaling Realtime](/docs/realtime/scaling)).\n\n## Channel Publishing from a Route [#channel-publishing-from-a-route]\n\nChannels also compose with raw socket routes. A `c.ws` endpoint inside a controller subscribes a socket to a channel on open and publishes inbound frames on message:\n\n```ts title=\"channel-publishing-from-a-route.ts\"\nchat: c.ws('/chat', {\n  open: (ws) => chat.subscribe(ws),\n  message: (ws, { data }) => chat.publish(data),\n  close: (ws) => chat.unsubscribe(ws),\n})\n```\n\nSubscribing a client to a channel and publishing to it are separate operations, so membership is explicit: `open` subscribes, handlers publish, and `close` typically unsubscribes — intermediate code can even move a connection between channels without a reconnect.\n\n## Transport Matrix [#transport-matrix]\n\n| Concern                  | Behavior                                                                                                |\n| ------------------------ | ------------------------------------------------------------------------------------------------------- |\n| Subscribe authorization  | Policy-checked during the WebSocket handshake                                                           |\n| Inbound message handling | Channel handlers, validated before execution                                                            |\n| Outbound fan-out         | `broadcast(name, payload)` from any server code                                                         |\n| Transport                | Framework-owned channel engine over the server's WebSocket upgrade; stateful primitives on edge presets |\n| One-directional fallback | SSE over the same channel semantics when WebSockets are blocked                                         |\n\n## What's Next [#whats-next]\n\n* [Events & Broadcasting](/docs/realtime/events) — route domain events into channels\n* [Client-Side Realtime](/docs/realtime/client-usage) — subscribe with `useChannel` and `usePresence`\n* [Scaling Realtime](/docs/realtime/scaling) — how channels behave across instances\n* [WebSockets](/docs/http/websockets) — raw socket routes for custom protocols\n* [Authorization](/docs/authorization/policies) — the policy model that guards subscriptions\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Channels are Kwiva's WebSocket broadcast primitive. A channel is a named stream of messages; clients subscribe by name, servers broadcast into them, and access control is part of the channel definition rather than an afterthought. A channel is also a first-class route citizen: it runs through the same request pipeline as a REST handler, which is exactly why session and tenant state are available while it authorizes."
		},
		{
			"heading": void 0,
			"content": "Where raw sockets give you one connection, channels give you a named, policy-checked, fan-out addressable group of connections. The `c.ws` route that opens a connection and the `channel()` factory that names and scopes it are complementary — see WebSockets for the socket-level surface and this page for the broadcast layer."
		},
		{
			"heading": "defining-a-channel",
			"content": "A channel is defined once with the `channel()` factory from `@kwiva/http`:"
		},
		{
			"heading": "defining-a-channel",
			"content": "This single definition declares the channel's name pattern, who may join it, and how inbound messages are handled. The definition is also the documentation: an operator reading the file sees the rule that governs every subscription to the channel family."
		},
		{
			"heading": "dynamic-channel-names",
			"content": "Channel names support segments. The `chat` channel family takes a dynamic room segment, so each room is one channel rather than a single blanket channel for the whole feature. When a client subscribes to `chat.42`, the subscribe handshake resolves the room segment from the requested name, and the resolved value is available to the channel's policy as `params.roomId`."
		},
		{
			"heading": "dynamic-channel-names",
			"content": "Dynamic segments give you:"
		},
		{
			"heading": "dynamic-channel-names",
			"content": "**Isolation** — room A never sees room B's traffic."
		},
		{
			"heading": "dynamic-channel-names",
			"content": "**Authorization** — the policy receives the resolved segment, so membership checks are exact."
		},
		{
			"heading": "dynamic-channel-names",
			"content": "**Automatic fan-out** — a broadcast to `chat.42` addresses exactly one room without server-side bookkeeping."
		},
		{
			"heading": "dynamic-channel-names",
			"content": "The same idea covers user-scoped channels (`user.{id}`) and board-scoped channels (`board.{id}`), where the dynamic segment identifies the user or the board. Segments are typed from the pattern, so `params.roomId` inside the policy is a typed value, not a string you parse."
		},
		{
			"heading": "subscribing",
			"content": "A client joins a channel by name. Subscribing is where authorization is enforced: the subscribe request is checked against the channel's policy before a connection is established, so a denied client never receives a working socket. The check happens during the WebSocket handshake, using the same policy engine that guards REST routes — the session is resolved, the tenant is resolved, and the channel policy runs against both."
		},
		{
			"heading": "subscribing",
			"content": "The framework handles the transport details — the WebSocket upgrade, lifecycle, and socket bookkeeping. Your definition supplies only the three things that are actually specific to your product: the name pattern, the access rule, and the message handler. Any guard or middleware mounted on a `c.ws` route runs its checks on the connection before the upgrade completes, so unauthenticated clients are rejected at the handshake rather than when they send their first message."
		},
		{
			"heading": "authorization-at-the-handshake",
			"content": "Channel authorization is policy-based and mirrors REST authorization. The policy receives the resolved `params` and the caller's `session`, and returns a boolean:"
		},
		{
			"heading": "authorization-at-the-handshake",
			"content": "A member check like `isMember` keeps the rule readable: the room segment is resolved from the subscription, the session tells you who is calling, and the policy decides whether they belong. The same policies that guard REST routes shape channel access, so an administrator who can read a room's messages can subscribe to its channel with no separate entitlement. See Policies for the policy model that powers it."
		},
		{
			"heading": "handling-messages",
			"content": "After subscription, inbound messages route through the handlers defined on the channel. A message handler receives the typed payload and a reference to the originating socket:"
		},
		{
			"heading": "handling-messages",
			"content": "The handler shown echoes every message back to the whole room — the canonical chat pattern. Handlers can do more: persist first, then broadcast; filter or transform before fan-out; or route into a domain event for downstream processing. Because messages are validated against the channel's schema before the handler runs, a malformed message is rejected at the channel and never reaches your handler logic or the room."
		},
		{
			"heading": "broadcasting-from-the-server",
			"content": "Anywhere in your application, the `broadcast` function pushes a payload into a channel by name:"
		},
		{
			"heading": "broadcasting-from-the-server",
			"content": "Broadcast calls are ordinary server-side operations — they can run in a controller, a job, a task, or an event listener, which is exactly how model lifecycle hooks can announce changes in realtime. The broadcast address is the concrete channel name; when multiple instances are deployed, the framework fans the message out to every instance that holds subscribers (see Scaling Realtime)."
		},
		{
			"heading": "model-driven-broadcasting",
			"content": "The most common broadcast is \"this record changed\", and Kwiva provides hook sugar for it on models:"
		},
		{
			"heading": "model-driven-broadcasting",
			"content": "On create, everyone subscribed to `posts` is notified. The same pattern composes with the other lifecycle hooks, and because the broadcast is a plain call, handlers can pass additional context:"
		},
		{
			"heading": "tenant-scoping",
			"content": "Channels inherit the application's tenancy rules. When tenancy is configured, subscription resolution and broadcast fan-out operate inside the resolved tenant's scope, the same scope that constrains queries, cache keys, and storage prefixes — so a client in one tenant cannot address or observe another tenant's channel traffic, even with a crafted channel name. Cross-tenant subscription attempts resolve exactly like cross-tenant record access: as if the channel does not exist. See Tenancy."
		},
		{
			"heading": "presence-v1x",
			"content": "Presence tracks who is joined to a channel. On a channel with presence enabled, the framework records join and leave events, and clients can read the member set:"
		},
		{
			"heading": "presence-v1x",
			"content": "Presence powers \"who is online in this room\" UI without custom bookkeeping. The member list and join and leave events are available to subscribers, and presence state is scoped per channel name. Presence is part of the realtime fast-follow and layers cleanly onto the same channel definitions — enabling it is a one-line option, not a parallel system. Across instances, presence state is coordinated through shared state rather than assumed to converge by accident (see Scaling Realtime)."
		},
		{
			"heading": "channel-publishing-from-a-route",
			"content": "Channels also compose with raw socket routes. A `c.ws` endpoint inside a controller subscribes a socket to a channel on open and publishes inbound frames on message:"
		},
		{
			"heading": "channel-publishing-from-a-route",
			"content": "Subscribing a client to a channel and publishing to it are separate operations, so membership is explicit: `open` subscribes, handlers publish, and `close` typically unsubscribes — intermediate code can even move a connection between channels without a reconnect."
		},
		{
			"heading": "transport-matrix",
			"content": "Concern"
		},
		{
			"heading": "transport-matrix",
			"content": "Behavior"
		},
		{
			"heading": "transport-matrix",
			"content": "Subscribe authorization"
		},
		{
			"heading": "transport-matrix",
			"content": "Policy-checked during the WebSocket handshake"
		},
		{
			"heading": "transport-matrix",
			"content": "Inbound message handling"
		},
		{
			"heading": "transport-matrix",
			"content": "Channel handlers, validated before execution"
		},
		{
			"heading": "transport-matrix",
			"content": "Outbound fan-out"
		},
		{
			"heading": "transport-matrix",
			"content": "`broadcast(name, payload)` from any server code"
		},
		{
			"heading": "transport-matrix",
			"content": "Transport"
		},
		{
			"heading": "transport-matrix",
			"content": "Framework-owned channel engine over the server's WebSocket upgrade; stateful primitives on edge presets"
		},
		{
			"heading": "transport-matrix",
			"content": "One-directional fallback"
		},
		{
			"heading": "transport-matrix",
			"content": "SSE over the same channel semantics when WebSockets are blocked"
		},
		{
			"heading": "whats-next",
			"content": "Events & Broadcasting — route domain events into channels"
		},
		{
			"heading": "whats-next",
			"content": "Client-Side Realtime — subscribe with `useChannel` and `usePresence`"
		},
		{
			"heading": "whats-next",
			"content": "Scaling Realtime — how channels behave across instances"
		},
		{
			"heading": "whats-next",
			"content": "WebSockets — raw socket routes for custom protocols"
		},
		{
			"heading": "whats-next",
			"content": "Authorization — the policy model that guards subscriptions"
		}
	],
	"headings": [
		{
			"id": "defining-a-channel",
			"content": "Defining a Channel"
		},
		{
			"id": "dynamic-channel-names",
			"content": "Dynamic Channel Names"
		},
		{
			"id": "subscribing",
			"content": "Subscribing"
		},
		{
			"id": "authorization-at-the-handshake",
			"content": "Authorization at the Handshake"
		},
		{
			"id": "handling-messages",
			"content": "Handling Messages"
		},
		{
			"id": "broadcasting-from-the-server",
			"content": "Broadcasting from the Server"
		},
		{
			"id": "model-driven-broadcasting",
			"content": "Model-Driven Broadcasting"
		},
		{
			"id": "tenant-scoping",
			"content": "Tenant Scoping"
		},
		{
			"id": "presence-v1x",
			"content": "Presence (v1.x)"
		},
		{
			"id": "channel-publishing-from-a-route",
			"content": "Channel Publishing from a Route"
		},
		{
			"id": "transport-matrix",
			"content": "Transport Matrix"
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
		url: "#defining-a-channel",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Defining a Channel" })
	},
	{
		depth: 2,
		url: "#dynamic-channel-names",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Dynamic Channel Names" })
	},
	{
		depth: 2,
		url: "#subscribing",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Subscribing" })
	},
	{
		depth: 2,
		url: "#authorization-at-the-handshake",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Authorization at the Handshake" })
	},
	{
		depth: 2,
		url: "#handling-messages",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Handling Messages" })
	},
	{
		depth: 2,
		url: "#broadcasting-from-the-server",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Broadcasting from the Server" })
	},
	{
		depth: 2,
		url: "#model-driven-broadcasting",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Model-Driven Broadcasting" })
	},
	{
		depth: 2,
		url: "#tenant-scoping",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Tenant Scoping" })
	},
	{
		depth: 2,
		url: "#presence-v1x",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Presence (v1.x)" })
	},
	{
		depth: 2,
		url: "#channel-publishing-from-a-route",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Channel Publishing from a Route" })
	},
	{
		depth: 2,
		url: "#transport-matrix",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Transport Matrix" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Channels are Kwiva's WebSocket broadcast primitive. A channel is a named stream of messages; clients subscribe by name, servers broadcast into them, and access control is part of the channel definition rather than an afterthought. A channel is also a first-class route citizen: it runs through the same request pipeline as a REST handler, which is exactly why session and tenant state are available while it authorizes." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Where raw sockets give you one connection, channels give you a named, policy-checked, fan-out addressable group of connections. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "c.ws" }),
			" route that opens a connection and the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "channel()" }),
			" factory that names and scopes it are complementary — see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/websockets",
				children: "WebSockets"
			}),
			" for the socket-level surface and this page for the broadcast layer."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "defining-a-channel",
			children: "Defining a Channel"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A channel is defined once with the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "channel()" }),
			" factory from ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }),
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
			title: "defining-a-channel.ts",
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
							children: "import"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " { channel } "
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
							children: " '@kwiva/http'"
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
							children: " const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " chat"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " channel"
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
							children: "'chat.{roomId}'"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  ."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "policy"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(({ "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "params"
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
							children: "session"
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
							children: " session.user "
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " isMember"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(session.user, params.roomId))"
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
							children: "  ."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "on"
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
							children: "'message'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", ({ "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "payload"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " broadcast"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(payload))"
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
							children: "  ."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "presence"
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
							children: ")"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "This single definition declares the channel's name pattern, who may join it, and how inbound messages are handled. The definition is also the documentation: an operator reading the file sees the rule that governs every subscription to the channel family." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "dynamic-channel-names",
			children: "Dynamic Channel Names"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Channel names support segments. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "chat" }),
			" channel family takes a dynamic room segment, so each room is one channel rather than a single blanket channel for the whole feature. When a client subscribes to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "chat.42" }),
			", the subscribe handshake resolves the room segment from the requested name, and the resolved value is available to the channel's policy as ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "params.roomId" }),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Dynamic segments give you:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Isolation" }), " — room A never sees room B's traffic."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Authorization" }), " — the policy receives the resolved segment, so membership checks are exact."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Automatic fan-out" }),
				" — a broadcast to ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "chat.42" }),
				" addresses exactly one room without server-side bookkeeping."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The same idea covers user-scoped channels (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "user.{id}" }),
			") and board-scoped channels (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "board.{id}" }),
			"), where the dynamic segment identifies the user or the board. Segments are typed from the pattern, so ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "params.roomId" }),
			" inside the policy is a typed value, not a string you parse."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "subscribing",
			children: "Subscribing"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A client joins a channel by name. Subscribing is where authorization is enforced: the subscribe request is checked against the channel's policy before a connection is established, so a denied client never receives a working socket. The check happens during the WebSocket handshake, using the same policy engine that guards REST routes — the session is resolved, the tenant is resolved, and the channel policy runs against both." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The framework handles the transport details — the WebSocket upgrade, lifecycle, and socket bookkeeping. Your definition supplies only the three things that are actually specific to your product: the name pattern, the access rule, and the message handler. Any guard or middleware mounted on a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "c.ws" }),
			" route runs its checks on the connection before the upgrade completes, so unauthenticated clients are rejected at the handshake rather than when they send their first message."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "authorization-at-the-handshake",
			children: "Authorization at the Handshake"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Channel authorization is policy-based and mirrors REST authorization. The policy receives the resolved ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "params" }),
			" and the caller's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "session" }),
			", and returns a boolean:"
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
			title: "authorization-at-the-handshake.ts",
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
							children: " const"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: " chat"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " channel"
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
							children: "'chat.{roomId}'"
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
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  ."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "policy"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(({ "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "params"
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
							children: "session"
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
							children: " session.user "
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " isMember"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(session.user, params.roomId))"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"A member check like ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "isMember" }),
			" keeps the rule readable: the room segment is resolved from the subscription, the session tells you who is calling, and the policy decides whether they belong. The same policies that guard REST routes shape channel access, so an administrator who can read a room's messages can subscribe to its channel with no separate entitlement. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/policies",
				children: "Policies"
			}),
			" for the policy model that powers it."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "handling-messages",
			children: "Handling Messages"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "After subscription, inbound messages route through the handlers defined on the channel. A message handler receives the typed payload and a reference to the originating socket:" }),
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
			title: "handling-messages.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
				className: "line",
				children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "."
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "on"
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
						children: "'message'"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ", ({ "
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#E36209",
							"--shiki-dark": "#FFAB70"
						},
						children: "payload"
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
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: " broadcast"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "(payload))"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The handler shown echoes every message back to the whole room — the canonical chat pattern. Handlers can do more: persist first, then broadcast; filter or transform before fan-out; or route into a domain event for downstream processing. Because messages are validated against the channel's schema before the handler runs, a malformed message is rejected at the channel and never reaches your handler logic or the room." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "broadcasting-from-the-server",
			children: "Broadcasting from the Server"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Anywhere in your application, the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "broadcast" }),
			" function pushes a payload into a channel by name:"
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
			title: "broadcasting-from-the-server.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// server-side emit from anywhere in your app"
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
							children: " { broadcast } "
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
							children: " '@kwiva/http'"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "broadcast"
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
							children: "'chat.42'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", { type: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'message'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", body: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'Hello'"
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
			"Broadcast calls are ordinary server-side operations — they can run in a controller, a job, a task, or an event listener, which is exactly how model lifecycle hooks can announce changes in realtime. The broadcast address is the concrete channel name; when multiple instances are deployed, the framework fans the message out to every instance that holds subscribers (see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime/scaling",
				children: "Scaling Realtime"
			}),
			")."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "model-driven-broadcasting",
			children: "Model-Driven Broadcasting"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The most common broadcast is \"this record changed\", and Kwiva provides hook sugar for it on models:" }),
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
			title: "model-driven-broadcasting.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
				className: "line",
				children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "Post."
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "onCreated"
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "(() "
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
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: " broadcast"
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
						children: "))"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"On create, everyone subscribed to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts" }),
			" is notified. The same pattern composes with the other lifecycle hooks, and because the broadcast is a plain call, handlers can pass additional context:"
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
			title: "model-driven-broadcasting-2.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
				className: "line",
				children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "Post."
					}),
					(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: "onUpdated"
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
						children: "post"
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
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						},
						children: " broadcast"
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
						children: ", { id: post.id, status: post.status }))"
					})
				]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "tenant-scoping",
			children: "Tenant Scoping"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Channels inherit the application's tenancy rules. When tenancy is configured, subscription resolution and broadcast fan-out operate inside the resolved tenant's scope, the same scope that constrains queries, cache keys, and storage prefixes — so a client in one tenant cannot address or observe another tenant's channel traffic, even with a crafted channel name. Cross-tenant subscription attempts resolve exactly like cross-tenant record access: as if the channel does not exist. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/tenancy",
				children: "Tenancy"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "presence-v1x",
			children: "Presence (v1.x)"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Presence tracks who is joined to a channel. On a channel with presence enabled, the framework records join and leave events, and clients can read the member set:" }),
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
			title: "presence-v1.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// server side"
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
							children: "."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "presence"
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
							children: ")"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// client side"
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
							children: "members"
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
							children: " usePresence"
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
							children: "`chat.${"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "roomId"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "}`"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Presence powers \"who is online in this room\" UI without custom bookkeeping. The member list and join and leave events are available to subscribers, and presence state is scoped per channel name. Presence is part of the realtime fast-follow and layers cleanly onto the same channel definitions — enabling it is a one-line option, not a parallel system. Across instances, presence state is coordinated through shared state rather than assumed to converge by accident (see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime/scaling",
				children: "Scaling Realtime"
			}),
			")."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "channel-publishing-from-a-route",
			children: "Channel Publishing from a Route"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Channels also compose with raw socket routes. A ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "c.ws" }),
			" endpoint inside a controller subscribes a socket to a channel on open and publishes inbound frames on message:"
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
			title: "channel-publishing-from-a-route.ts",
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
							children: "chat"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": c."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "ws"
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
							children: "'/chat'"
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
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "  open"
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
							children: "ws"
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
							children: " chat."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "subscribe"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(ws),"
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
							children: "  message"
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
							children: "ws"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", { "
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
							children: " chat."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "publish"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(data),"
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
							children: "  close"
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
							children: "ws"
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
							children: " chat."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "unsubscribe"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(ws),"
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
			"Subscribing a client to a channel and publishing to it are separate operations, so membership is explicit: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "open" }),
			" subscribes, handlers publish, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "close" }),
			" typically unsubscribes — intermediate code can even move a connection between channels without a reconnect."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "transport-matrix",
			children: "Transport Matrix"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Concern" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Behavior" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Subscribe authorization" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Policy-checked during the WebSocket handshake" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Inbound message handling" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Channel handlers, validated before execution" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Outbound fan-out" }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "broadcast(name, payload)" }), " from any server code"] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Transport" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Framework-owned channel engine over the server's WebSocket upgrade; stateful primitives on edge presets" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "One-directional fallback" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "SSE over the same channel semantics when WebSockets are blocked" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime/events",
				children: "Events & Broadcasting"
			}), " — route domain events into channels"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/realtime/client-usage",
					children: "Client-Side Realtime"
				}),
				" — subscribe with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useChannel" }),
				" and ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "usePresence" })
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime/scaling",
				children: "Scaling Realtime"
			}), " — how channels behave across instances"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/websockets",
				children: "WebSockets"
			}), " — raw socket routes for custom protocols"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/authorization/policies",
				children: "Authorization"
			}), " — the policy model that guards subscriptions"] }),
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
