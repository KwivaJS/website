import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/realtime/index.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Realtime",
	"description": "Channels, domain events, broadcasting, and typed client hooks — realtime behavior built into every Kwiva application."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\nKwiva's realtime layer composes four pieces that work together: domain events that travel through your application, broadcast channels that push payloads to connected clients, typed client hooks that subscribe from the frontend, and a scaling story for when the application runs on more than one instance. Because each piece is typed end to end, a `defineEvent` payload and the `onMessage` handler that receives it agree on their shape without any manually maintained contract. Rename a field on an event and every subscriber, every listener, and every broadcast target retypes in the same build — there is no stringly-typed message anywhere in the pipeline.\n\nRealtime is not a separate subsystem bolted onto the framework. Channels and events are defined with the same `defineX` conventions as models and controllers, they are checked by the same policy engine as REST routes, and they run on transports chosen by your deployment preset. Everything below builds on the request pipeline documented in [Controllers](/docs/http/controllers) and [Request Lifecycle](/docs/http/lifecycle).\n\n## The Pieces [#the-pieces]\n\n| Page                                                | What it covers                                                       |\n| --------------------------------------------------- | -------------------------------------------------------------------- |\n| [Channels](/docs/realtime/channels)                 | Named channels, dynamic segments, policy-checked subscribe, presence |\n| [Events & Broadcasting](/docs/realtime/events)      | Typed domain events, queued and sync listeners, broadcasting         |\n| [Client-Side Realtime](/docs/realtime/client-usage) | `useChannel`, `usePresence`, streaming subscriptions, SSE fallback   |\n| [Scaling Realtime](/docs/realtime/scaling)          | Many-instance behavior, fan-out, presence coordination               |\n\n## How the Pieces Fit [#how-the-pieces-fit]\n\nA typical realtime feature flows like this: something happens in your application — a post is created, a message is posted — and that something is captured as a domain event. The event fans out to listeners (queued or synchronous) and, when a channel mapping is declared, broadcasts to a realtime channel. Subscribed clients receive the update the moment it is produced:\n\n```ts title=\"how-the-pieces-fit.ts\"\n// a model hook broadcasts straight to a channel\nPost.onCreated(() => broadcast('posts'))\n\n// a client subscribes to that channel with a typed hook\nconst { messages } = useChannel('posts')\n```\n\nThe model hook is the transport sugar: the create happens, the hook fires, and every subscribed client is notified. The client hook is the receiving end, typed against whatever payload the server emits. Neither side knows the other's implementation details; both are derived from framework definitions.\n\nChannels are the transport. Events are the meaning. If a feature is \"something changed and someone should hear about it\", the event names the change and the channel decides who hears it. The broadcast target is derived from typed, validated event fields, so the mapping from event to channel is always well-formed and always inside the surface your policies control.\n\n## A Real-Time Feature, End to End [#a-real-time-feature-end-to-end]\n\nCombining the pieces gives a complete, production-shaped feature. A chat channel with a membership policy:\n\n```ts title=\"a-real-time-feature-end-to-end.ts\"\nimport { channel } from '@kwiva/http'\n\nexport const chat = channel('chat.{roomId}')\n  .policy(({ params, session }) => session.user && isMember(session.user, params.roomId))\n  .on('message', ({ payload }) => broadcast(payload))\n```\n\nA typed event that both queues work and broadcasts the new message to the room:\n\n```ts title=\"a-real-time-feature-end-to-end-2.ts\"\nimport { defineEvent } from '@kwiva/events'\n\nexport const MessagePosted = defineEvent('message.posted', (f) => ({\n  roomId: f.uuid(),\n  messageId: f.uuid(),\n  tenantId: f.uuid().optional(),\n}), {\n  broadcast: (e) => `chat.${e.roomId}`,\n  listeners: ['send-webhook', 'update-stats'],\n  queued: true,\n})\n```\n\nA client component that subscribes with the same semantics:\n\n```tsx title=\"a-real-time-feature-end-to-end-3.tsx\"\nconst { messages, send } = useChannel(`chat.${roomId}`, {\n  onMessage: (m) => setMessages((prev) => [...prev, m]),\n})\n```\n\nOne emit drives a broadcast to the room, two queued listeners for side effects, and a typed `onMessage` delivery to every subscribed client. Everything downstream of `emit` is derived from the three definitions above.\n\n## The Full Surface [#the-full-surface]\n\nRealtime is one consistent story across the framework:\n\n* **Channels** — defined once with the `channel()` factory from `@kwiva/http`, including authorization as part of the definition through `.policy()`. Dynamic segments (`chat.{roomId}`) make one definition cover many rooms.\n* **Events** — defined with `defineEvent`; payload fields derive from the same field DSL models use, and validation happens at the emit boundary.\n* **Listening** — listeners attach by name and run queued by default (`queued: true`), with synchronous execution as an explicit opt-out. Listener files auto-discover from `src/app/events/listeners/`.\n* **Broadcasting** — declared channel mappings on events, model-hook sugar on lifecycle hooks, and the ad hoc `broadcast(name, payload)` helper for server-side fan-out.\n* **Presence (v1.x)** — join and leave tracking per channel, readable client-side through `usePresence`.\n* **Client hooks** — `useChannel` and the presence hook with typed payloads from the server definitions, plus imperative streaming subscriptions for non-component code.\n* **Fallbacks** — SSE when WebSockets are blocked, graceful degradation on static output.\n* **Scaling** — a shared distribution plane so broadcasts cross instances without restructuring channel code.\n\nNothing is hand-wired. A channel's policy, an event's payload, and a hook's `onMessage` signature are all derived from the definitions, so a change to a definition surfaces types immediately across every consumer.\n\n## Connection Lifecycle and Reliability [#connection-lifecycle-and-reliability]\n\nRealtime connections are not treated as permanent. The framework owns the parts of the lifecycle that are identical for every product:\n\n1. **Subscribe** — the client connects and the channel policy is checked during the WebSocket handshake, before the client receives a working socket. A denied client never subscribes.\n2. **Live** — inbound messages route through channel handlers; broadcasts route out through the channel.\n3. **Drop and reconnect** — on an unexpected disconnect the client reconnects with backoff rather than giving up or hammering the server.\n4. **Catch-up** — missed-message catch-up by event id is part of the realtime fast-follow (v1.x), so a client that blinks out does not permanently lose what it missed.\n5. **Degrade** — on fully static output, where the realtime transport does not exist, hooks keep their interface but stop receiving; components remain safe to render.\n\nDelivery is at-least-once by design. The broadcast plane may deliver a message more than once across reconnects, which is why queued listeners and event-handling jobs support idempotency keys. The transport guarantees arrival; the application dedupes where a duplicate side effect would be harmful.\n\n## Transport and Engine Mapping [#transport-and-engine-mapping]\n\nThe realtime transport follows the deployment preset, so choosing a deployment target chooses the transport:\n\n| Environment                                           | Transport                                                                                              |\n| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |\n| Server presets (primary and Node-compatible runtimes) | Framework-owned channel engine over the server's WebSocket upgrade                                     |\n| Edge presets with stateful workers                    | Stateful channel primitives via the preset's WebSocket wiring, coordinated by the preset's state model |\n| Static output                                         | Realtime disabled; clients degrade gracefully                                                          |\n\nFor one-directional feeds where a bidirectional socket is overkill, the framework's streaming helper serves server-sent events with the same channel policy semantics. The choice between transports is an operational decision, not a code change — the client subscription surface stays identical.\n\n## When Realtime Fits [#when-realtime-fits]\n\nRealtime broadcasting is the right tool for anything where freshness beats refetching:\n\n* **Live chat** — per-room channels with dynamic segments and presence\n* **Activity feeds** — events broadcast to user-scoped channels\n* **Shared lists** — a board of records that multiple users edit simultaneously\n* **Dashboards** — metrics and status pushed instead of polled\n* **Notifications** — server-initiated push to a user's connected devices\n\nWhere a one-directional push is all you need — a feed that only flows server to client — server-sent events via the `stream` helper are a lighter option, and the client can still subscribe through the same channel semantics. Where the data genuinely changes on every poll and latency is not critical, ordinary HTTP requests and data hooks remain the simplest tool; realtime exists to remove polling, not to replace a request you would only make once.\n\n## What's Next [#whats-next]\n\n* [Channels](/docs/realtime/channels) — define a channel and enforce who may subscribe\n* [Events & Broadcasting](/docs/realtime/events) — define typed events and route them to channels\n* [Client-Side Realtime](/docs/realtime/client-usage) — subscribe from React with typed hooks\n* [Scaling Realtime](/docs/realtime/scaling) — how all of this behaves across instances\n* [WebSockets](/docs/http/websockets) — raw socket routes for custom protocols\n* [Background Work](/docs/background-work/jobs) — queued listeners that run event handling off the request path\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva's realtime layer composes four pieces that work together: domain events that travel through your application, broadcast channels that push payloads to connected clients, typed client hooks that subscribe from the frontend, and a scaling story for when the application runs on more than one instance. Because each piece is typed end to end, a `defineEvent` payload and the `onMessage` handler that receives it agree on their shape without any manually maintained contract. Rename a field on an event and every subscriber, every listener, and every broadcast target retypes in the same build — there is no stringly-typed message anywhere in the pipeline."
		},
		{
			"heading": void 0,
			"content": "Realtime is not a separate subsystem bolted onto the framework. Channels and events are defined with the same `defineX` conventions as models and controllers, they are checked by the same policy engine as REST routes, and they run on transports chosen by your deployment preset. Everything below builds on the request pipeline documented in Controllers and Request Lifecycle."
		},
		{
			"heading": "the-pieces",
			"content": "Page"
		},
		{
			"heading": "the-pieces",
			"content": "What it covers"
		},
		{
			"heading": "the-pieces",
			"content": "Channels"
		},
		{
			"heading": "the-pieces",
			"content": "Named channels, dynamic segments, policy-checked subscribe, presence"
		},
		{
			"heading": "the-pieces",
			"content": "Events & Broadcasting"
		},
		{
			"heading": "the-pieces",
			"content": "Typed domain events, queued and sync listeners, broadcasting"
		},
		{
			"heading": "the-pieces",
			"content": "Client-Side Realtime"
		},
		{
			"heading": "the-pieces",
			"content": "`useChannel`, `usePresence`, streaming subscriptions, SSE fallback"
		},
		{
			"heading": "the-pieces",
			"content": "Scaling Realtime"
		},
		{
			"heading": "the-pieces",
			"content": "Many-instance behavior, fan-out, presence coordination"
		},
		{
			"heading": "how-the-pieces-fit",
			"content": "A typical realtime feature flows like this: something happens in your application — a post is created, a message is posted — and that something is captured as a domain event. The event fans out to listeners (queued or synchronous) and, when a channel mapping is declared, broadcasts to a realtime channel. Subscribed clients receive the update the moment it is produced:"
		},
		{
			"heading": "how-the-pieces-fit",
			"content": "The model hook is the transport sugar: the create happens, the hook fires, and every subscribed client is notified. The client hook is the receiving end, typed against whatever payload the server emits. Neither side knows the other's implementation details; both are derived from framework definitions."
		},
		{
			"heading": "how-the-pieces-fit",
			"content": "Channels are the transport. Events are the meaning. If a feature is \"something changed and someone should hear about it\", the event names the change and the channel decides who hears it. The broadcast target is derived from typed, validated event fields, so the mapping from event to channel is always well-formed and always inside the surface your policies control."
		},
		{
			"heading": "a-real-time-feature-end-to-end",
			"content": "Combining the pieces gives a complete, production-shaped feature. A chat channel with a membership policy:"
		},
		{
			"heading": "a-real-time-feature-end-to-end",
			"content": "A typed event that both queues work and broadcasts the new message to the room:"
		},
		{
			"heading": "a-real-time-feature-end-to-end",
			"content": "A client component that subscribes with the same semantics:"
		},
		{
			"heading": "a-real-time-feature-end-to-end",
			"content": "One emit drives a broadcast to the room, two queued listeners for side effects, and a typed `onMessage` delivery to every subscribed client. Everything downstream of `emit` is derived from the three definitions above."
		},
		{
			"heading": "the-full-surface",
			"content": "Realtime is one consistent story across the framework:"
		},
		{
			"heading": "the-full-surface",
			"content": "**Channels** — defined once with the `channel()` factory from `@kwiva/http`, including authorization as part of the definition through `.policy()`. Dynamic segments (`chat.{roomId}`) make one definition cover many rooms."
		},
		{
			"heading": "the-full-surface",
			"content": "**Events** — defined with `defineEvent`; payload fields derive from the same field DSL models use, and validation happens at the emit boundary."
		},
		{
			"heading": "the-full-surface",
			"content": "**Listening** — listeners attach by name and run queued by default (`queued: true`), with synchronous execution as an explicit opt-out. Listener files auto-discover from `src/app/events/listeners/`."
		},
		{
			"heading": "the-full-surface",
			"content": "**Broadcasting** — declared channel mappings on events, model-hook sugar on lifecycle hooks, and the ad hoc `broadcast(name, payload)` helper for server-side fan-out."
		},
		{
			"heading": "the-full-surface",
			"content": "**Presence (v1.x)** — join and leave tracking per channel, readable client-side through `usePresence`."
		},
		{
			"heading": "the-full-surface",
			"content": "**Client hooks** — `useChannel` and the presence hook with typed payloads from the server definitions, plus imperative streaming subscriptions for non-component code."
		},
		{
			"heading": "the-full-surface",
			"content": "**Fallbacks** — SSE when WebSockets are blocked, graceful degradation on static output."
		},
		{
			"heading": "the-full-surface",
			"content": "**Scaling** — a shared distribution plane so broadcasts cross instances without restructuring channel code."
		},
		{
			"heading": "the-full-surface",
			"content": "Nothing is hand-wired. A channel's policy, an event's payload, and a hook's `onMessage` signature are all derived from the definitions, so a change to a definition surfaces types immediately across every consumer."
		},
		{
			"heading": "connection-lifecycle-and-reliability",
			"content": "Realtime connections are not treated as permanent. The framework owns the parts of the lifecycle that are identical for every product:"
		},
		{
			"heading": "connection-lifecycle-and-reliability",
			"content": "**Subscribe** — the client connects and the channel policy is checked during the WebSocket handshake, before the client receives a working socket. A denied client never subscribes."
		},
		{
			"heading": "connection-lifecycle-and-reliability",
			"content": "**Live** — inbound messages route through channel handlers; broadcasts route out through the channel."
		},
		{
			"heading": "connection-lifecycle-and-reliability",
			"content": "**Drop and reconnect** — on an unexpected disconnect the client reconnects with backoff rather than giving up or hammering the server."
		},
		{
			"heading": "connection-lifecycle-and-reliability",
			"content": "**Catch-up** — missed-message catch-up by event id is part of the realtime fast-follow (v1.x), so a client that blinks out does not permanently lose what it missed."
		},
		{
			"heading": "connection-lifecycle-and-reliability",
			"content": "**Degrade** — on fully static output, where the realtime transport does not exist, hooks keep their interface but stop receiving; components remain safe to render."
		},
		{
			"heading": "connection-lifecycle-and-reliability",
			"content": "Delivery is at-least-once by design. The broadcast plane may deliver a message more than once across reconnects, which is why queued listeners and event-handling jobs support idempotency keys. The transport guarantees arrival; the application dedupes where a duplicate side effect would be harmful."
		},
		{
			"heading": "transport-and-engine-mapping",
			"content": "The realtime transport follows the deployment preset, so choosing a deployment target chooses the transport:"
		},
		{
			"heading": "transport-and-engine-mapping",
			"content": "Environment"
		},
		{
			"heading": "transport-and-engine-mapping",
			"content": "Transport"
		},
		{
			"heading": "transport-and-engine-mapping",
			"content": "Server presets (primary and Node-compatible runtimes)"
		},
		{
			"heading": "transport-and-engine-mapping",
			"content": "Framework-owned channel engine over the server's WebSocket upgrade"
		},
		{
			"heading": "transport-and-engine-mapping",
			"content": "Edge presets with stateful workers"
		},
		{
			"heading": "transport-and-engine-mapping",
			"content": "Stateful channel primitives via the preset's WebSocket wiring, coordinated by the preset's state model"
		},
		{
			"heading": "transport-and-engine-mapping",
			"content": "Static output"
		},
		{
			"heading": "transport-and-engine-mapping",
			"content": "Realtime disabled; clients degrade gracefully"
		},
		{
			"heading": "transport-and-engine-mapping",
			"content": "For one-directional feeds where a bidirectional socket is overkill, the framework's streaming helper serves server-sent events with the same channel policy semantics. The choice between transports is an operational decision, not a code change — the client subscription surface stays identical."
		},
		{
			"heading": "when-realtime-fits",
			"content": "Realtime broadcasting is the right tool for anything where freshness beats refetching:"
		},
		{
			"heading": "when-realtime-fits",
			"content": "**Live chat** — per-room channels with dynamic segments and presence"
		},
		{
			"heading": "when-realtime-fits",
			"content": "**Activity feeds** — events broadcast to user-scoped channels"
		},
		{
			"heading": "when-realtime-fits",
			"content": "**Shared lists** — a board of records that multiple users edit simultaneously"
		},
		{
			"heading": "when-realtime-fits",
			"content": "**Dashboards** — metrics and status pushed instead of polled"
		},
		{
			"heading": "when-realtime-fits",
			"content": "**Notifications** — server-initiated push to a user's connected devices"
		},
		{
			"heading": "when-realtime-fits",
			"content": "Where a one-directional push is all you need — a feed that only flows server to client — server-sent events via the `stream` helper are a lighter option, and the client can still subscribe through the same channel semantics. Where the data genuinely changes on every poll and latency is not critical, ordinary HTTP requests and data hooks remain the simplest tool; realtime exists to remove polling, not to replace a request you would only make once."
		},
		{
			"heading": "whats-next",
			"content": "Channels — define a channel and enforce who may subscribe"
		},
		{
			"heading": "whats-next",
			"content": "Events & Broadcasting — define typed events and route them to channels"
		},
		{
			"heading": "whats-next",
			"content": "Client-Side Realtime — subscribe from React with typed hooks"
		},
		{
			"heading": "whats-next",
			"content": "Scaling Realtime — how all of this behaves across instances"
		},
		{
			"heading": "whats-next",
			"content": "WebSockets — raw socket routes for custom protocols"
		},
		{
			"heading": "whats-next",
			"content": "Background Work — queued listeners that run event handling off the request path"
		}
	],
	"headings": [
		{
			"id": "the-pieces",
			"content": "The Pieces"
		},
		{
			"id": "how-the-pieces-fit",
			"content": "How the Pieces Fit"
		},
		{
			"id": "a-real-time-feature-end-to-end",
			"content": "A Real-Time Feature, End to End"
		},
		{
			"id": "the-full-surface",
			"content": "The Full Surface"
		},
		{
			"id": "connection-lifecycle-and-reliability",
			"content": "Connection Lifecycle and Reliability"
		},
		{
			"id": "transport-and-engine-mapping",
			"content": "Transport and Engine Mapping"
		},
		{
			"id": "when-realtime-fits",
			"content": "When Realtime Fits"
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
		url: "#the-pieces",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Pieces" })
	},
	{
		depth: 2,
		url: "#how-the-pieces-fit",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "How the Pieces Fit" })
	},
	{
		depth: 2,
		url: "#a-real-time-feature-end-to-end",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "A Real-Time Feature, End to End" })
	},
	{
		depth: 2,
		url: "#the-full-surface",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Full Surface" })
	},
	{
		depth: 2,
		url: "#connection-lifecycle-and-reliability",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Connection Lifecycle and Reliability" })
	},
	{
		depth: 2,
		url: "#transport-and-engine-mapping",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Transport and Engine Mapping" })
	},
	{
		depth: 2,
		url: "#when-realtime-fits",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "When Realtime Fits" })
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
			"Kwiva's realtime layer composes four pieces that work together: domain events that travel through your application, broadcast channels that push payloads to connected clients, typed client hooks that subscribe from the frontend, and a scaling story for when the application runs on more than one instance. Because each piece is typed end to end, a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineEvent" }),
			" payload and the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onMessage" }),
			" handler that receives it agree on their shape without any manually maintained contract. Rename a field on an event and every subscriber, every listener, and every broadcast target retypes in the same build — there is no stringly-typed message anywhere in the pipeline."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Realtime is not a separate subsystem bolted onto the framework. Channels and events are defined with the same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineX" }),
			" conventions as models and controllers, they are checked by the same policy engine as REST routes, and they run on transports chosen by your deployment preset. Everything below builds on the request pipeline documented in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/controllers",
				children: "Controllers"
			}),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/lifecycle",
				children: "Request Lifecycle"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-pieces",
			children: "The Pieces"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Page" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "What it covers" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime/channels",
				children: "Channels"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Named channels, dynamic segments, policy-checked subscribe, presence" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime/events",
				children: "Events & Broadcasting"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Typed domain events, queued and sync listeners, broadcasting" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime/client-usage",
				children: "Client-Side Realtime"
			}) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useChannel" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "usePresence" }),
				", streaming subscriptions, SSE fallback"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime/scaling",
				children: "Scaling Realtime"
			}) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Many-instance behavior, fan-out, presence coordination" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "how-the-pieces-fit",
			children: "How the Pieces Fit"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A typical realtime feature flows like this: something happens in your application — a post is created, a message is posted — and that something is captured as a domain event. The event fans out to listeners (queued or synchronous) and, when a channel mapping is declared, broadcasts to a realtime channel. Subscribed clients receive the update the moment it is produced:" }),
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
			title: "how-the-pieces-fit.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// a model hook broadcasts straight to a channel"
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
						children: "// a client subscribes to that channel with a typed hook"
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
							children: "messages"
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
							children: " useChannel"
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
							children: ")"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The model hook is the transport sugar: the create happens, the hook fires, and every subscribed client is notified. The client hook is the receiving end, typed against whatever payload the server emits. Neither side knows the other's implementation details; both are derived from framework definitions." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Channels are the transport. Events are the meaning. If a feature is \"something changed and someone should hear about it\", the event names the change and the channel decides who hears it. The broadcast target is derived from typed, validated event fields, so the mapping from event to channel is always well-formed and always inside the surface your policies control." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "a-real-time-feature-end-to-end",
			children: "A Real-Time Feature, End to End"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Combining the pieces gives a complete, production-shaped feature. A chat channel with a membership policy:" }),
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
			title: "a-real-time-feature-end-to-end.ts",
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
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A typed event that both queues work and broadcasts the new message to the room:" }),
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
			title: "a-real-time-feature-end-to-end-2.ts",
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
							children: " { defineEvent } "
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
							children: " '@kwiva/events'"
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
							children: " MessagePosted"
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
							children: " defineEvent"
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
							children: "'message.posted'"
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
							children: "  roomId: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "uuid"
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
							children: "  messageId: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "uuid"
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
							children: "  tenantId: f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "uuid"
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
							children: "optional"
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
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "}), {"
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
							children: "  broadcast"
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
							children: "e"
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
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: " `chat.${"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "e"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "."
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
							children: "  listeners: ["
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'send-webhook'"
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
							children: "'update-stats'"
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
							children: "  queued: "
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
						children: "})"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A client component that subscribes with the same semantics:" }),
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
			title: "a-real-time-feature-end-to-end-3.tsx",
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
							children: "messages"
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
							children: "send"
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
							children: " useChannel"
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
							children: "  onMessage"
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
							children: "m"
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
							children: " setMessages"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "prev"
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
							children: " ["
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
							children: "prev, m]),"
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
			"One emit drives a broadcast to the room, two queued listeners for side effects, and a typed ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onMessage" }),
			" delivery to every subscribed client. Everything downstream of ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "emit" }),
			" is derived from the three definitions above."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-full-surface",
			children: "The Full Surface"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Realtime is one consistent story across the framework:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Channels" }),
				" — defined once with the ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "channel()" }),
				" factory from ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "@kwiva/http" }),
				", including authorization as part of the definition through ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".policy()" }),
				". Dynamic segments (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "chat.{roomId}" }),
				") make one definition cover many rooms."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Events" }),
				" — defined with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineEvent" }),
				"; payload fields derive from the same field DSL models use, and validation happens at the emit boundary."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Listening" }),
				" — listeners attach by name and run queued by default (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "queued: true" }),
				"), with synchronous execution as an explicit opt-out. Listener files auto-discover from ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/app/events/listeners/" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Broadcasting" }),
				" — declared channel mappings on events, model-hook sugar on lifecycle hooks, and the ad hoc ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "broadcast(name, payload)" }),
				" helper for server-side fan-out."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Presence (v1.x)" }),
				" — join and leave tracking per channel, readable client-side through ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "usePresence" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Client hooks" }),
				" — ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "useChannel" }),
				" and the presence hook with typed payloads from the server definitions, plus imperative streaming subscriptions for non-component code."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Fallbacks" }), " — SSE when WebSockets are blocked, graceful degradation on static output."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Scaling" }), " — a shared distribution plane so broadcasts cross instances without restructuring channel code."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Nothing is hand-wired. A channel's policy, an event's payload, and a hook's ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "onMessage" }),
			" signature are all derived from the definitions, so a change to a definition surfaces types immediately across every consumer."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "connection-lifecycle-and-reliability",
			children: "Connection Lifecycle and Reliability"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Realtime connections are not treated as permanent. The framework owns the parts of the lifecycle that are identical for every product:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Subscribe" }), " — the client connects and the channel policy is checked during the WebSocket handshake, before the client receives a working socket. A denied client never subscribes."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Live" }), " — inbound messages route through channel handlers; broadcasts route out through the channel."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Drop and reconnect" }), " — on an unexpected disconnect the client reconnects with backoff rather than giving up or hammering the server."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Catch-up" }), " — missed-message catch-up by event id is part of the realtime fast-follow (v1.x), so a client that blinks out does not permanently lose what it missed."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Degrade" }), " — on fully static output, where the realtime transport does not exist, hooks keep their interface but stop receiving; components remain safe to render."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Delivery is at-least-once by design. The broadcast plane may deliver a message more than once across reconnects, which is why queued listeners and event-handling jobs support idempotency keys. The transport guarantees arrival; the application dedupes where a duplicate side effect would be harmful." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "transport-and-engine-mapping",
			children: "Transport and Engine Mapping"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The realtime transport follows the deployment preset, so choosing a deployment target chooses the transport:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Environment" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Transport" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Server presets (primary and Node-compatible runtimes)" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Framework-owned channel engine over the server's WebSocket upgrade" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Edge presets with stateful workers" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Stateful channel primitives via the preset's WebSocket wiring, coordinated by the preset's state model" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Static output" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Realtime disabled; clients degrade gracefully" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "For one-directional feeds where a bidirectional socket is overkill, the framework's streaming helper serves server-sent events with the same channel policy semantics. The choice between transports is an operational decision, not a code change — the client subscription surface stays identical." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "when-realtime-fits",
			children: "When Realtime Fits"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Realtime broadcasting is the right tool for anything where freshness beats refetching:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Live chat" }), " — per-room channels with dynamic segments and presence"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Activity feeds" }), " — events broadcast to user-scoped channels"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Shared lists" }), " — a board of records that multiple users edit simultaneously"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Dashboards" }), " — metrics and status pushed instead of polled"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Notifications" }), " — server-initiated push to a user's connected devices"] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Where a one-directional push is all you need — a feed that only flows server to client — server-sent events via the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "stream" }),
			" helper are a lighter option, and the client can still subscribe through the same channel semantics. Where the data genuinely changes on every poll and latency is not critical, ordinary HTTP requests and data hooks remain the simplest tool; realtime exists to remove polling, not to replace a request you would only make once."
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
				href: "/docs/realtime/channels",
				children: "Channels"
			}), " — define a channel and enforce who may subscribe"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime/events",
				children: "Events & Broadcasting"
			}), " — define typed events and route them to channels"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime/client-usage",
				children: "Client-Side Realtime"
			}), " — subscribe from React with typed hooks"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime/scaling",
				children: "Scaling Realtime"
			}), " — how all of this behaves across instances"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/websockets",
				children: "WebSockets"
			}), " — raw socket routes for custom protocols"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/background-work/jobs",
				children: "Background Work"
			}), " — queued listeners that run event handling off the request path"] }),
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
