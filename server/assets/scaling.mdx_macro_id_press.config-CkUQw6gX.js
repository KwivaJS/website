import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/realtime/scaling.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Scaling Realtime",
	"description": "How channels, broadcasts, and presence behave when your application runs on many instances."
};
var lastModified = /* @__PURE__ */ new Date(1788982969e3);
var _markdown = "\n\nA single instance of a Kwiva application is the simplest possible realtime topology: every socket is held in memory by the one process that also runs your handlers, so a broadcast is a local operation and presence is local bookkeeping. The moment you scale out, sockets spread across instances, and the questions change. This page covers what holds up and what needs coordination once there is more than one process.\n\n## One Instance Is Simple [#one-instance-is-simple]\n\nOn a single instance, the channel engine holds every connection in the same process that broadcasts into channels:\n\n* A broadcast to a channel reaches every subscriber with a local loop over connections.\n* Presence join and leave tracking is in-process memory.\n* No shared state is involved anywhere in the path.\n\nThis topology is the default and requires zero configuration. For development, staging, and a large share of production workloads, it is also sufficient — most applications run comfortably on one instance without engineering for fan-out.\n\n## Many Instances Change the Picture [#many-instances-change-the-picture]\n\nWhen the application runs on several instances, each socket connects to exactly one instance. The consequence is direct: an in-memory fan-out reaches only the sockets on the same instance. A client subscribed to `chat.42` on instance B does not exist in the socket table of instance A, so a broadcast executed on instance A needs a way to reach instance B.\n\nThe framework solves this by separating two concerns:\n\n* **Connection ownership** — each socket is owned by the instance that accepted it.\n* **Event distribution** — broadcasts travel through a shared plane that every instance participates in.\n\nAn instance that receives a broadcast from its own handler delivers it to its local sockets and forwards it to every other instance, which deliver to theirs. Connection routing follows the client: a reconnect can land on any healthy instance, and because socket state is not assumed to be process-local, that reconnect is served correctly wherever it lands.\n\n## Channel Affinity [#channel-affinity]\n\nChannel affinity describes which instance owns a given channel's state. It depends on the deployment transport:\n\n| Environment                                           | Transport                                                          |\n| ----------------------------------------------------- | ------------------------------------------------------------------ |\n| Server presets (primary and Node-compatible runtimes) | Framework-owned channel engine over the server's WebSocket upgrade |\n| Edge presets with stateful workers                    | Stateful channel primitives via the preset's WebSocket wiring      |\n| Static output                                         | Realtime disabled; clients degrade gracefully                      |\n\nOn server presets, sockets bind to the accepting instance, and cross-instance delivery uses the shared distribution plane. On edge presets with stateful workers, channels carry state alongside the worker that hosts them, which changes the affinity model: a channel lives with its state rather than with a random accepting process. The choice of preset lines the framework's transport up with how the host platform already models state.\n\n> \\[!NOTE]\n> Because channel and presence state is coordinated through shared state rather than assumed local, you do not need sticky routing to keep a client pinned to one instance. Every instance can serve any reconnect; stickiness is an optimization you may add for your own reasons, never a correctness requirement.\n\n## Shared State for Fan-Out [#shared-state-for-fan-out]\n\nCross-instance broadcasting runs on a shared pub/sub adapter. Configuration lives with the rest of the API surface:\n\n```ts title=\"src/config/api.ts\"\n// src/config/api.ts\n// set the broadcast driver to a shared pub/sub backend\n// instances subscribe and forward to their local sockets\n//   broadcast: { driver: 'redis' }\n```\n\nThe Redis pub/sub adapter is the documented design for broadcast fan-out at scale: instances subscribe to the channels their clients care about, receive broadcasts published by any instance, and forward them to their own local sockets. Instances cooperate through one shared distribution plane, and each instance remains responsible only for the sockets it physically holds.\n\nWithout a shared backend, broadcasts are instance-local — correct on a single instance, incomplete across several. If you scale out and broadcast behavior matters, configure the driver before you add the second instance.\n\n## Presence Needs Coordination [#presence-needs-coordination]\n\nPresence is the feature most sensitive to topology. Single-instance presence is in-process and exact. Across instances, join and leave events originate on whatever instance accepted each socket, so a correct member set requires that presence state be shared. The framework's presence model accounts for this: when presence spans instances, it is coordinated through shared state rather than assumed to converge by accident.\n\nThe practical guidance:\n\n* On one instance, presence is exact with zero configuration.\n* Across instances, plan for presence coordination before you rely on member counts for product behavior.\n* Presence is part of the realtime fast-follow, so the coordination story matures alongside it.\n\n## Reliability Across Scalings [#reliability-across-scalings]\n\nDelivery through the distribution plane is at-least-once by design, and that property does not change with instance count. A broadcast may arrive on a client that reconnects mid-flight more than once, which is why listeners and event-handling jobs carry idempotency keys and why the client's missed-message catch-up (v1.x) reconciles by event id. Scaling adds transport hops, never weaker delivery guarantees — the plane is shared, so a message published once is fanned out once to every instance's subscribers.\n\n## What Does Not Change [#what-does-not-change]\n\nRegardless of instance count, these properties hold constant:\n\n* **Channel definitions** — policies and message handlers are per-definition, not per-instance.\n* **Subscription authorization** — the handshake policy runs wherever the socket lands.\n* **Typed payloads** — event definitions retype every client handler on every instance.\n* **SSE fallback** — one-directional feeds cross instances on the same distribution plane.\n\nScaling realtime means adding a broadcast driver and, when presence matters, coordination — not restructuring the channel code. The same `channel()` definitions, the same event broadcasts, and the same client hooks run unchanged from one instance to fifty.\n\n## A Practical Path [#a-practical-path]\n\n1. Build and ship on one instance with zero realtime configuration.\n2. Add more instances for capacity; if broadcast fan-out is needed, set the broadcast driver to a shared pub/sub backend.\n3. Enable presence-dependent UI only after presence state is coordinated across the instances serving it.\n4. Where edge presets fit your latency goals, lean on stateful channel primitives for affinity with state.\n5. Watch queue and broadcast observability as instances grow — fan-out latency and presence errors both surface in the shared tracing and metrics pipeline.\n\nRealtime in Kwiva is correct by default at small scale and predictable by design at large scale — the configuration grows with your topology instead of being required before you write a channel.\n\n## What's Next [#whats-next]\n\n* [Client-Side Realtime](/docs/realtime/client-usage) — how subscriptions behave under reconnection and fallback\n* [Channels](/docs/realtime/channels) — the definitions that stay identical across instances\n* [Deployment](/docs/deployment) — presets that determine the transport\n* [Deployment](/docs/deployment/adapters) — server and edge presets for realtime workloads\n* [Production Checklist](/docs/deployment/production-checklist) — topology and telemetry before you ship\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "A single instance of a Kwiva application is the simplest possible realtime topology: every socket is held in memory by the one process that also runs your handlers, so a broadcast is a local operation and presence is local bookkeeping. The moment you scale out, sockets spread across instances, and the questions change. This page covers what holds up and what needs coordination once there is more than one process."
		},
		{
			"heading": "one-instance-is-simple",
			"content": "On a single instance, the channel engine holds every connection in the same process that broadcasts into channels:"
		},
		{
			"heading": "one-instance-is-simple",
			"content": "A broadcast to a channel reaches every subscriber with a local loop over connections."
		},
		{
			"heading": "one-instance-is-simple",
			"content": "Presence join and leave tracking is in-process memory."
		},
		{
			"heading": "one-instance-is-simple",
			"content": "No shared state is involved anywhere in the path."
		},
		{
			"heading": "one-instance-is-simple",
			"content": "This topology is the default and requires zero configuration. For development, staging, and a large share of production workloads, it is also sufficient — most applications run comfortably on one instance without engineering for fan-out."
		},
		{
			"heading": "many-instances-change-the-picture",
			"content": "When the application runs on several instances, each socket connects to exactly one instance. The consequence is direct: an in-memory fan-out reaches only the sockets on the same instance. A client subscribed to `chat.42` on instance B does not exist in the socket table of instance A, so a broadcast executed on instance A needs a way to reach instance B."
		},
		{
			"heading": "many-instances-change-the-picture",
			"content": "The framework solves this by separating two concerns:"
		},
		{
			"heading": "many-instances-change-the-picture",
			"content": "**Connection ownership** — each socket is owned by the instance that accepted it."
		},
		{
			"heading": "many-instances-change-the-picture",
			"content": "**Event distribution** — broadcasts travel through a shared plane that every instance participates in."
		},
		{
			"heading": "many-instances-change-the-picture",
			"content": "An instance that receives a broadcast from its own handler delivers it to its local sockets and forwards it to every other instance, which deliver to theirs. Connection routing follows the client: a reconnect can land on any healthy instance, and because socket state is not assumed to be process-local, that reconnect is served correctly wherever it lands."
		},
		{
			"heading": "channel-affinity",
			"content": "Channel affinity describes which instance owns a given channel's state. It depends on the deployment transport:"
		},
		{
			"heading": "channel-affinity",
			"content": "Environment"
		},
		{
			"heading": "channel-affinity",
			"content": "Transport"
		},
		{
			"heading": "channel-affinity",
			"content": "Server presets (primary and Node-compatible runtimes)"
		},
		{
			"heading": "channel-affinity",
			"content": "Framework-owned channel engine over the server's WebSocket upgrade"
		},
		{
			"heading": "channel-affinity",
			"content": "Edge presets with stateful workers"
		},
		{
			"heading": "channel-affinity",
			"content": "Stateful channel primitives via the preset's WebSocket wiring"
		},
		{
			"heading": "channel-affinity",
			"content": "Static output"
		},
		{
			"heading": "channel-affinity",
			"content": "Realtime disabled; clients degrade gracefully"
		},
		{
			"heading": "channel-affinity",
			"content": "On server presets, sockets bind to the accepting instance, and cross-instance delivery uses the shared distribution plane. On edge presets with stateful workers, channels carry state alongside the worker that hosts them, which changes the affinity model: a channel lives with its state rather than with a random accepting process. The choice of preset lines the framework's transport up with how the host platform already models state."
		},
		{
			"heading": "channel-affinity",
			"content": "> \\[!NOTE]\n> Because channel and presence state is coordinated through shared state rather than assumed local, you do not need sticky routing to keep a client pinned to one instance. Every instance can serve any reconnect; stickiness is an optimization you may add for your own reasons, never a correctness requirement."
		},
		{
			"heading": "shared-state-for-fan-out",
			"content": "Cross-instance broadcasting runs on a shared pub/sub adapter. Configuration lives with the rest of the API surface:"
		},
		{
			"heading": "shared-state-for-fan-out",
			"content": "The Redis pub/sub adapter is the documented design for broadcast fan-out at scale: instances subscribe to the channels their clients care about, receive broadcasts published by any instance, and forward them to their own local sockets. Instances cooperate through one shared distribution plane, and each instance remains responsible only for the sockets it physically holds."
		},
		{
			"heading": "shared-state-for-fan-out",
			"content": "Without a shared backend, broadcasts are instance-local — correct on a single instance, incomplete across several. If you scale out and broadcast behavior matters, configure the driver before you add the second instance."
		},
		{
			"heading": "presence-needs-coordination",
			"content": "Presence is the feature most sensitive to topology. Single-instance presence is in-process and exact. Across instances, join and leave events originate on whatever instance accepted each socket, so a correct member set requires that presence state be shared. The framework's presence model accounts for this: when presence spans instances, it is coordinated through shared state rather than assumed to converge by accident."
		},
		{
			"heading": "presence-needs-coordination",
			"content": "The practical guidance:"
		},
		{
			"heading": "presence-needs-coordination",
			"content": "On one instance, presence is exact with zero configuration."
		},
		{
			"heading": "presence-needs-coordination",
			"content": "Across instances, plan for presence coordination before you rely on member counts for product behavior."
		},
		{
			"heading": "presence-needs-coordination",
			"content": "Presence is part of the realtime fast-follow, so the coordination story matures alongside it."
		},
		{
			"heading": "reliability-across-scalings",
			"content": "Delivery through the distribution plane is at-least-once by design, and that property does not change with instance count. A broadcast may arrive on a client that reconnects mid-flight more than once, which is why listeners and event-handling jobs carry idempotency keys and why the client's missed-message catch-up (v1.x) reconciles by event id. Scaling adds transport hops, never weaker delivery guarantees — the plane is shared, so a message published once is fanned out once to every instance's subscribers."
		},
		{
			"heading": "what-does-not-change",
			"content": "Regardless of instance count, these properties hold constant:"
		},
		{
			"heading": "what-does-not-change",
			"content": "**Channel definitions** — policies and message handlers are per-definition, not per-instance."
		},
		{
			"heading": "what-does-not-change",
			"content": "**Subscription authorization** — the handshake policy runs wherever the socket lands."
		},
		{
			"heading": "what-does-not-change",
			"content": "**Typed payloads** — event definitions retype every client handler on every instance."
		},
		{
			"heading": "what-does-not-change",
			"content": "**SSE fallback** — one-directional feeds cross instances on the same distribution plane."
		},
		{
			"heading": "what-does-not-change",
			"content": "Scaling realtime means adding a broadcast driver and, when presence matters, coordination — not restructuring the channel code. The same `channel()` definitions, the same event broadcasts, and the same client hooks run unchanged from one instance to fifty."
		},
		{
			"heading": "a-practical-path",
			"content": "Build and ship on one instance with zero realtime configuration."
		},
		{
			"heading": "a-practical-path",
			"content": "Add more instances for capacity; if broadcast fan-out is needed, set the broadcast driver to a shared pub/sub backend."
		},
		{
			"heading": "a-practical-path",
			"content": "Enable presence-dependent UI only after presence state is coordinated across the instances serving it."
		},
		{
			"heading": "a-practical-path",
			"content": "Where edge presets fit your latency goals, lean on stateful channel primitives for affinity with state."
		},
		{
			"heading": "a-practical-path",
			"content": "Watch queue and broadcast observability as instances grow — fan-out latency and presence errors both surface in the shared tracing and metrics pipeline."
		},
		{
			"heading": "a-practical-path",
			"content": "Realtime in Kwiva is correct by default at small scale and predictable by design at large scale — the configuration grows with your topology instead of being required before you write a channel."
		},
		{
			"heading": "whats-next",
			"content": "Client-Side Realtime — how subscriptions behave under reconnection and fallback"
		},
		{
			"heading": "whats-next",
			"content": "Channels — the definitions that stay identical across instances"
		},
		{
			"heading": "whats-next",
			"content": "Deployment — presets that determine the transport"
		},
		{
			"heading": "whats-next",
			"content": "Deployment — server and edge presets for realtime workloads"
		},
		{
			"heading": "whats-next",
			"content": "Production Checklist — topology and telemetry before you ship"
		}
	],
	"headings": [
		{
			"id": "one-instance-is-simple",
			"content": "One Instance Is Simple"
		},
		{
			"id": "many-instances-change-the-picture",
			"content": "Many Instances Change the Picture"
		},
		{
			"id": "channel-affinity",
			"content": "Channel Affinity"
		},
		{
			"id": "shared-state-for-fan-out",
			"content": "Shared State for Fan-Out"
		},
		{
			"id": "presence-needs-coordination",
			"content": "Presence Needs Coordination"
		},
		{
			"id": "reliability-across-scalings",
			"content": "Reliability Across Scalings"
		},
		{
			"id": "what-does-not-change",
			"content": "What Does Not Change"
		},
		{
			"id": "a-practical-path",
			"content": "A Practical Path"
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
		url: "#one-instance-is-simple",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "One Instance Is Simple" })
	},
	{
		depth: 2,
		url: "#many-instances-change-the-picture",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Many Instances Change the Picture" })
	},
	{
		depth: 2,
		url: "#channel-affinity",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Channel Affinity" })
	},
	{
		depth: 2,
		url: "#shared-state-for-fan-out",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Shared State for Fan-Out" })
	},
	{
		depth: 2,
		url: "#presence-needs-coordination",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Presence Needs Coordination" })
	},
	{
		depth: 2,
		url: "#reliability-across-scalings",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Reliability Across Scalings" })
	},
	{
		depth: 2,
		url: "#what-does-not-change",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What Does Not Change" })
	},
	{
		depth: 2,
		url: "#a-practical-path",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "A Practical Path" })
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
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A single instance of a Kwiva application is the simplest possible realtime topology: every socket is held in memory by the one process that also runs your handlers, so a broadcast is a local operation and presence is local bookkeeping. The moment you scale out, sockets spread across instances, and the questions change. This page covers what holds up and what needs coordination once there is more than one process." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "one-instance-is-simple",
			children: "One Instance Is Simple"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "On a single instance, the channel engine holds every connection in the same process that broadcasts into channels:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "A broadcast to a channel reaches every subscriber with a local loop over connections." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Presence join and leave tracking is in-process memory." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "No shared state is involved anywhere in the path." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "This topology is the default and requires zero configuration. For development, staging, and a large share of production workloads, it is also sufficient — most applications run comfortably on one instance without engineering for fan-out." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "many-instances-change-the-picture",
			children: "Many Instances Change the Picture"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"When the application runs on several instances, each socket connects to exactly one instance. The consequence is direct: an in-memory fan-out reaches only the sockets on the same instance. A client subscribed to ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "chat.42" }),
			" on instance B does not exist in the socket table of instance A, so a broadcast executed on instance A needs a way to reach instance B."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The framework solves this by separating two concerns:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Connection ownership" }), " — each socket is owned by the instance that accepted it."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Event distribution" }), " — broadcasts travel through a shared plane that every instance participates in."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "An instance that receives a broadcast from its own handler delivers it to its local sockets and forwards it to every other instance, which deliver to theirs. Connection routing follows the client: a reconnect can land on any healthy instance, and because socket state is not assumed to be process-local, that reconnect is served correctly wherever it lands." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "channel-affinity",
			children: "Channel Affinity"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Channel affinity describes which instance owns a given channel's state. It depends on the deployment transport:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Environment" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Transport" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Server presets (primary and Node-compatible runtimes)" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Framework-owned channel engine over the server's WebSocket upgrade" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Edge presets with stateful workers" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Stateful channel primitives via the preset's WebSocket wiring" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Static output" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Realtime disabled; clients degrade gracefully" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "On server presets, sockets bind to the accepting instance, and cross-instance delivery uses the shared distribution plane. On edge presets with stateful workers, channels carry state alongside the worker that hosts them, which changes the affinity model: a channel lives with its state rather than with a random accepting process. The choice of preset lines the framework's transport up with how the host platform already models state." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "[!NOTE]\nBecause channel and presence state is coordinated through shared state rather than assumed local, you do not need sticky routing to keep a client pinned to one instance. Every instance can serve any reconnect; stickiness is an optimization you may add for your own reasons, never a correctness requirement." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "shared-state-for-fan-out",
			children: "Shared State for Fan-Out"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Cross-instance broadcasting runs on a shared pub/sub adapter. Configuration lives with the rest of the API surface:" }),
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
			title: "src/config/api.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// src/config/api.ts"
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
						children: "// set the broadcast driver to a shared pub/sub backend"
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
						children: "// instances subscribe and forward to their local sockets"
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
						children: "//   broadcast: { driver: 'redis' }"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The Redis pub/sub adapter is the documented design for broadcast fan-out at scale: instances subscribe to the channels their clients care about, receive broadcasts published by any instance, and forward them to their own local sockets. Instances cooperate through one shared distribution plane, and each instance remains responsible only for the sockets it physically holds." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Without a shared backend, broadcasts are instance-local — correct on a single instance, incomplete across several. If you scale out and broadcast behavior matters, configure the driver before you add the second instance." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "presence-needs-coordination",
			children: "Presence Needs Coordination"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Presence is the feature most sensitive to topology. Single-instance presence is in-process and exact. Across instances, join and leave events originate on whatever instance accepted each socket, so a correct member set requires that presence state be shared. The framework's presence model accounts for this: when presence spans instances, it is coordinated through shared state rather than assumed to converge by accident." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The practical guidance:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "On one instance, presence is exact with zero configuration." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Across instances, plan for presence coordination before you rely on member counts for product behavior." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Presence is part of the realtime fast-follow, so the coordination story matures alongside it." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "reliability-across-scalings",
			children: "Reliability Across Scalings"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Delivery through the distribution plane is at-least-once by design, and that property does not change with instance count. A broadcast may arrive on a client that reconnects mid-flight more than once, which is why listeners and event-handling jobs carry idempotency keys and why the client's missed-message catch-up (v1.x) reconciles by event id. Scaling adds transport hops, never weaker delivery guarantees — the plane is shared, so a message published once is fanned out once to every instance's subscribers." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "what-does-not-change",
			children: "What Does Not Change"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Regardless of instance count, these properties hold constant:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Channel definitions" }), " — policies and message handlers are per-definition, not per-instance."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Subscription authorization" }), " — the handshake policy runs wherever the socket lands."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Typed payloads" }), " — event definitions retype every client handler on every instance."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "SSE fallback" }), " — one-directional feeds cross instances on the same distribution plane."] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Scaling realtime means adding a broadcast driver and, when presence matters, coordination — not restructuring the channel code. The same ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "channel()" }),
			" definitions, the same event broadcasts, and the same client hooks run unchanged from one instance to fifty."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "a-practical-path",
			children: "A Practical Path"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Build and ship on one instance with zero realtime configuration." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Add more instances for capacity; if broadcast fan-out is needed, set the broadcast driver to a shared pub/sub backend." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Enable presence-dependent UI only after presence state is coordinated across the instances serving it." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Where edge presets fit your latency goals, lean on stateful channel primitives for affinity with state." }),
			"\n",
			(0, import_jsx_runtime_react_server.jsx)(_components.li, { children: "Watch queue and broadcast observability as instances grow — fan-out latency and presence errors both surface in the shared tracing and metrics pipeline." }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Realtime in Kwiva is correct by default at small scale and predictable by design at large scale — the configuration grows with your topology instead of being required before you write a channel." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime/client-usage",
				children: "Client-Side Realtime"
			}), " — how subscriptions behave under reconnection and fallback"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/realtime/channels",
				children: "Channels"
			}), " — the definitions that stay identical across instances"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment",
				children: "Deployment"
			}), " — presets that determine the transport"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/adapters",
				children: "Deployment"
			}), " — server and edge presets for realtime workloads"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/deployment/production-checklist",
				children: "Production Checklist"
			}), " — topology and telemetry before you ship"] }),
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
