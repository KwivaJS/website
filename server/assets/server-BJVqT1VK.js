import { t as require_react_react_server } from "./react.react-server-BSR27ksj.js";
import { a as registerClientReference, o as renderToReadableStream$1 } from "./server-Ccqw4whX.js";
import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
import { AsyncLocalStorage } from "node:async_hooks";
//#region node_modules/waku/dist/lib/utils/custom-errors.js
var isErrorInfo = (x) => {
	if (typeof x !== "object" || x === null) return false;
	if ("status" in x && typeof x.status !== "number") return false;
	if ("location" in x && typeof x.location !== "string") return false;
	if ("unstable_leave" in x && typeof x.unstable_leave !== "boolean") return false;
	if ("unstable_networkError" in x && typeof x.unstable_networkError !== "boolean") return false;
	return true;
};
var prefix = "__WAKU_CUSTOM_ERROR__;";
var createCustomError = (message, errorInfo) => {
	const err = new Error(message);
	err.digest = prefix + JSON.stringify(errorInfo);
	return err;
};
var getErrorInfo = (err) => {
	const digest = err?.digest;
	if (typeof digest !== "string" || !digest.startsWith(prefix)) return null;
	try {
		const info = JSON.parse(digest.slice(22));
		if (isErrorInfo(info)) return info;
	} catch {}
	return null;
};
//#endregion
//#region node_modules/waku/dist/lib/utils/base64-web.js
var bytesToBase64 = (bytes) => {
	let binary = "";
	for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
	return btoa(binary);
};
var base64ToBytes = (base64) => Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
//#endregion
//#region node_modules/waku/dist/lib/utils/etags.js
var ETAG_ID_PREFIX = "_etag:";
var ETAGS_HEADER = "X-Waku-Etags";
var isValidEtag = (value) => value === 1 || typeof value === "string" && value !== "" && /^[\x20-\x7e\xa0-\xff]+$/.test(value);
var parseClientEtags = (serialized) => {
	if (!serialized) return {};
	let parsed;
	try {
		parsed = JSON.parse(serialized);
	} catch {
		return {};
	}
	if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
	const etags = {};
	for (const [key, value] of Object.entries(parsed)) if (isValidEtag(value)) etags[key] = value;
	return etags;
};
//#endregion
//#region node_modules/waku/dist/lib/utils/stream.js
var encoder = new TextEncoder();
new TextDecoder();
var stringToStream = (str) => {
	return new ReadableStream({ start(controller) {
		controller.enqueue(encoder.encode(str));
		controller.close();
	} });
};
var streamToBytes = async (stream) => {
	const reader = stream.getReader();
	const chunks = [];
	while (true) {
		const { value, done } = await reader.read();
		if (done) break;
		if (!(value instanceof Uint8Array)) throw new Error("Unexpected buffer type");
		chunks.push(value);
	}
	return concatUint8Array(chunks);
};
var bytesToStream = (bytes) => new ReadableStream({ start(controller) {
	controller.enqueue(bytes);
	controller.close();
} });
function concatUint8Array(chunks) {
	if (chunks.length === 1) return chunks[0];
	const total = chunks.reduce((n, chunk) => n + chunk.byteLength, 0);
	const out = new Uint8Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		out.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return out;
}
//#endregion
//#region node_modules/waku/dist/lib/utils/create-pages.js
/** Remove (group)s from path. Like /(group)/foo => /foo */ var getGrouplessPath = (path) => {
	if (path.includes("(")) {
		const withoutGroups = path.split("/").filter((part) => !part.startsWith("("));
		path = withoutGroups.length > 1 ? withoutGroups.join("/") : "/";
	}
	return path;
};
//#endregion
//#region node_modules/waku/dist/minimal/server.js
function unstable_defineHandlers(handlers) {
	return handlers;
}
var unstable_buildElements = async (clientEtags, elementSources) => {
	const elements = {};
	const etags = {};
	await Promise.all(Object.entries(elementSources).map(async ([slotId, elementSource]) => {
		const rawEtag = elementSource.immutable ? 1 : await elementSource.getEtag?.();
		const etag = isValidEtag(rawEtag) ? rawEtag : void 0;
		if (etag !== void 0 && etag === clientEtags[slotId]) return;
		elements[slotId] = await elementSource.render();
		if (etag !== void 0) etags[slotId] = etag;
		else if (clientEtags[slotId] !== void 0) etags[slotId] = "";
	}));
	return {
		elements,
		etags
	};
};
//#endregion
//#region node_modules/waku/dist/router/client.js
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var ErrorBoundary = /* #__PURE__ */ registerClientReference((() => {
	throw new Error("It is not possible to invoke a client function from the server: \"ErrorBoundary\"");
}), "6d786e16fc6b", "ErrorBoundary");
var INTERNAL_ServerRouter = /* #__PURE__ */ registerClientReference((() => {
	throw new Error("It is not possible to invoke a client function from the server: \"INTERNAL_ServerRouter\"");
}), "6d786e16fc6b", "INTERNAL_ServerRouter");
//#endregion
//#region node_modules/waku/dist/router/isomorphic-utils/path-spec.js
var SLUG_PATTERN = /^(.*?)\[([^\]]+)\](.*)$/;
var parsePathWithSlug = (path) => path.split("/").filter(Boolean).map((name) => {
	const match = SLUG_PATTERN.exec(name);
	if (!match) return {
		type: "literal",
		name
	};
	const [, prefix, inner, suffix] = match;
	if (inner.startsWith("...")) return {
		type: "wildcard",
		name: inner.slice(3)
	};
	return {
		type: "group",
		name: inner,
		...prefix ? { prefix } : {},
		...suffix ? { suffix } : {}
	};
});
var pathSpecAsString = (path) => {
	return "/" + path.map((item) => {
		if (item.type === "literal") return item.name;
		else if (item.type === "group") {
			const prefix = item.prefix ?? "";
			const suffix = item.suffix ?? "";
			return `${prefix}[${item.name}]${suffix}`;
		} else return `[...${item.name}]`;
	}).join("/");
};
var matchSpecSegment = (spec, segment, mapping) => {
	if (spec.type === "literal") return spec.name === segment;
	if (segment === void 0) return false;
	const prefix = spec.prefix ?? "";
	const suffix = spec.suffix ?? "";
	if (prefix || suffix) {
		if (!segment.startsWith(prefix) || !segment.endsWith(suffix)) return false;
		const value = segment.slice(prefix.length, suffix ? -suffix.length : void 0);
		if (!value) return false;
		if (spec.name) mapping[spec.name] = value;
	} else if (spec.name) mapping[spec.name] = segment;
	return true;
};
var getPathMapping = (pathSpec, pathname) => {
	const actual = pathname.split("/").filter(Boolean);
	if (pathSpec.length > actual.length) {
		const wildcardIndex = pathSpec.findIndex((spec) => spec.type === "wildcard");
		if (wildcardIndex === -1) return null;
		if (wildcardIndex === pathSpec.length - 1) {
			if (actual.length > 0) return null;
		} else if (actual.length < pathSpec.length - 1) return null;
	}
	const mapping = {};
	let wildcardStartIndex = -1;
	for (let i = 0; i < pathSpec.length; i++) {
		const spec = pathSpec[i];
		if (spec.type === "wildcard") {
			wildcardStartIndex = i;
			break;
		}
		if (!matchSpecSegment(spec, actual[i], mapping)) return null;
	}
	if (wildcardStartIndex === -1) {
		if (pathSpec.length !== actual.length) return null;
		return mapping;
	}
	if (wildcardStartIndex === 0 && actual.length === 0) {
		const wildcardName = pathSpec[wildcardStartIndex].name;
		if (wildcardName) mapping[wildcardName] = [];
		return mapping;
	}
	let wildcardEndIndex = -1;
	for (let i = 0; i < pathSpec.length; i++) {
		const spec = pathSpec[pathSpec.length - i - 1];
		if (spec.type === "wildcard") {
			wildcardEndIndex = actual.length - i - 1;
			break;
		}
		if (!matchSpecSegment(spec, actual[actual.length - i - 1], mapping)) return null;
	}
	const wildcardName = pathSpec[wildcardStartIndex].name;
	if (wildcardName) mapping[wildcardName] = actual.slice(wildcardStartIndex, wildcardEndIndex + 1);
	return mapping;
};
var escapeRegExp = (s) => s.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
var path2regexp = (path) => {
	return `^/${path.map((item) => {
		if (item.type === "literal") return escapeRegExp(item.name);
		else if (item.type === "group") return `${escapeRegExp(item.prefix ?? "")}([^/]+)${escapeRegExp(item.suffix ?? "")}`;
		else return `(.*)`;
	}).join("/")}$`;
};
//#endregion
//#region node_modules/waku/dist/router/isomorphic-utils/route-path.js
function pathnameToRoutePath(pathname) {
	if (!pathname.startsWith("/")) throw new Error("Pathname must start with `/`: " + pathname);
	if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);
	if (pathname.endsWith("/index.html")) pathname = pathname.slice(0, -11) || "/";
	if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);
	return pathname || "/";
}
var ROUTE_SLOT_ID_PREFIX = "route:";
var SLICE_SLOT_ID_PREFIX = "slice:";
var getRouteSlotId = (path) => ROUTE_SLOT_ID_PREFIX + path;
var getSliceSlotId = (id) => SLICE_SLOT_ID_PREFIX + id;
var isRouteSlotId = (slotId) => slotId.startsWith(ROUTE_SLOT_ID_PREFIX);
var isSliceSlotId = (slotId) => slotId.startsWith(SLICE_SLOT_ID_PREFIX);
var ROUTE_PREFIX = "R";
var SLICE_PREFIX = "S/";
function encodeRoutePath(routePath) {
	if (!routePath.startsWith("/")) throw new Error("Route path must start with `/`: " + routePath);
	if (routePath.length > 1 && routePath.endsWith("/")) throw new Error("Route path must not end with `/`: " + routePath);
	if (routePath.endsWith("/index.html")) throw new Error("Route path must not end with `/index.html`: " + routePath);
	if (routePath === "/") return "R/_root";
	if (routePath.startsWith("/_")) return "R/__" + routePath.slice(2);
	return ROUTE_PREFIX + routePath;
}
function decodeRoutePath(rscPath) {
	if (!rscPath.startsWith(ROUTE_PREFIX)) throw new Error("rscPath should start with: R");
	if (rscPath === "R/_root") return "/";
	if (rscPath.startsWith("R/__")) return "/_" + rscPath.slice(4);
	return rscPath.slice(1);
}
function encodeSliceId(sliceId) {
	if (sliceId.startsWith("/")) throw new Error("Slice id must not start with `/`: " + sliceId);
	return SLICE_PREFIX + sliceId;
}
function decodeSliceId(rscPath) {
	if (!rscPath.startsWith(SLICE_PREFIX)) return null;
	return rscPath.slice(2);
}
var ROUTE_ID = "ROUTE";
var IS_STATIC_ID = "IS_STATIC";
var HAS404_ID = "HAS404";
//#endregion
//#region node_modules/waku/dist/router/define-router-utils/client-code.js
var getRouterPrefetchCode = (path2moduleIds) => {
	const moduleIdSet = /* @__PURE__ */ new Set();
	Object.values(path2moduleIds).forEach((ids) => ids.forEach((id) => moduleIdSet.add(id)));
	const ids = Array.from(moduleIdSet);
	const path2idxs = {};
	Object.entries(path2moduleIds).forEach(([path, pathIds]) => {
		path2idxs[path] = pathIds.map((id) => ids.indexOf(id));
	});
	return `
globalThis.__WAKU_ROUTER_PREFETCH__ = (path, callback) => {
  const ids = ${JSON.stringify(ids)};
  const path2idxs = ${JSON.stringify(path2idxs)};
  const key = Object.keys(path2idxs).find((key) => new RegExp(key).test(path));
  for (const idx of path2idxs[key] || []) {
    callback(ids[idx]);
  }
};
`;
};
var buildRoutePath2searchCodecId = (configs) => {
	const routePath2searchCodecId = {};
	for (const item of configs) if (item.type === "route" && item.searchCodec !== void 0) routePath2searchCodecId[pathSpecAsString(item.pathPattern ?? item.path)] = item.searchCodec.id;
	return routePath2searchCodecId;
};
var setupRouterSearchCodecs = (configs) => {
	const routePath2searchCodecId = buildRoutePath2searchCodecId(configs);
	if (Object.keys(routePath2searchCodecId).length === 0) return "";
	globalThis.__WAKU_ROUTER_SEARCH_CODECS__ = routePath2searchCodecId;
	return `
globalThis.__WAKU_ROUTER_SEARCH_CODECS__ = ${JSON.stringify(routePath2searchCodecId).replace(/</g, "\\u003c")};
`;
};
//#endregion
//#region node_modules/waku/dist/router/define-router-utils/config.js
var DEFINE_ROUTER_METADATA = {
	serializableConfigs: "defineRouter:serializableConfigs",
	cachedElements: "defineRouter:cachedElements",
	path2moduleIds: "defineRouter:path2moduleIds"
};
var pathSpecKey = (p) => JSON.stringify(p);
var toSerializable = (c) => {
	if (c.type === "route") {
		const { rootElement, routeElement, elements, searchCodec: _searchCodec, ...rest } = c;
		const { renderer: _rootRenderer, getEtagFromOption: _rootGetEtag, ...rootElementRest } = rootElement;
		const { renderer: _routeRenderer, getEtagFromOption: _routeGetEtag, ...routeElementRest } = routeElement;
		return {
			...rest,
			rootElement: rootElementRest,
			routeElement: routeElementRest,
			elements: Object.fromEntries(Object.entries(elements).map(([id, { renderer: _r, getEtagFromOption: _g, ...elRest }]) => [id, elRest]))
		};
	}
	if (c.type === "api") {
		const { handler: _handler, ...rest } = c;
		return rest;
	}
	const { renderer: _r, getEtagFromParams: _g, ...rest } = c;
	return rest;
};
var noRuntimeFn = (what) => {
	throw new Error(`defineRouter: no runtime function found for ${what}; rebuild required`);
};
var mergeWithRuntimeConfigs = (serializableConfigs, runtimeConfigs) => {
	const runtimeRouteByPath = /* @__PURE__ */ new Map();
	const runtimeApiByPath = /* @__PURE__ */ new Map();
	const runtimeSliceById = /* @__PURE__ */ new Map();
	for (const c of runtimeConfigs) if (c.type === "route") runtimeRouteByPath.set(pathSpecKey(c.path), c);
	else if (c.type === "api") runtimeApiByPath.set(pathSpecKey(c.path), c);
	else runtimeSliceById.set(c.id, c);
	const sharedRootRenderer = runtimeConfigs.find((c) => c.type === "route")?.rootElement.renderer;
	const sharedElementRenderers = /* @__PURE__ */ new Map();
	for (const c of runtimeConfigs) {
		if (c.type !== "route") continue;
		for (const [id, el] of Object.entries(c.elements)) if (!sharedElementRenderers.has(id)) sharedElementRenderers.set(id, el.renderer);
	}
	return serializableConfigs.map((c) => {
		if (c.type === "route") {
			const runtimeItem = runtimeRouteByPath.get(pathSpecKey(c.path));
			const label = `route ${pathSpecAsString(c.path)}`;
			const elements = {};
			for (const [id, val] of Object.entries(c.elements)) {
				const elementSpec = runtimeItem?.elements[id];
				elements[id] = {
					isStatic: val.isStatic,
					renderer: elementSpec?.renderer ?? sharedElementRenderers.get(id) ?? (() => noRuntimeFn(`element "${id}" of ${label}`)),
					...elementSpec?.getEtagFromOption ? { getEtagFromOption: elementSpec.getEtagFromOption } : {},
					...val.sourceFile ? { sourceFile: val.sourceFile } : {}
				};
			}
			return {
				type: "route",
				path: c.path,
				isStatic: c.isStatic,
				...c.pathPattern !== void 0 ? { pathPattern: c.pathPattern } : {},
				rootElement: {
					isStatic: c.rootElement.isStatic,
					renderer: runtimeItem?.rootElement.renderer ?? sharedRootRenderer ?? (() => noRuntimeFn(`rootElement of ${label}`)),
					...runtimeItem?.rootElement.getEtagFromOption ? { getEtagFromOption: runtimeItem.rootElement.getEtagFromOption } : {},
					...c.rootElement.sourceFile ? { sourceFile: c.rootElement.sourceFile } : {}
				},
				routeElement: {
					isStatic: c.routeElement.isStatic,
					renderer: runtimeItem?.routeElement.renderer ?? (() => noRuntimeFn(`routeElement of ${label}`)),
					...runtimeItem?.routeElement.getEtagFromOption ? { getEtagFromOption: runtimeItem.routeElement.getEtagFromOption } : {}
				},
				elements,
				...c.noSsr !== void 0 ? { noSsr: c.noSsr } : {},
				...c.slices !== void 0 ? { slices: c.slices } : {},
				...runtimeItem?.searchCodec !== void 0 ? { searchCodec: runtimeItem.searchCodec } : {}
			};
		}
		if (c.type === "api") {
			const runtimeItem = runtimeApiByPath.get(pathSpecKey(c.path));
			return {
				type: "api",
				path: c.path,
				isStatic: c.isStatic,
				handler: runtimeItem?.handler ?? (async () => noRuntimeFn(`api ${pathSpecAsString(c.path)}`)),
				...c.sourceFile ? { sourceFile: c.sourceFile } : {}
			};
		}
		const runtimeItem = runtimeSliceById.get(c.id);
		return {
			type: "slice",
			id: c.id,
			...c.pathSpec !== void 0 ? { pathSpec: c.pathSpec } : {},
			isStatic: c.isStatic,
			renderer: runtimeItem?.renderer ?? (async () => noRuntimeFn(`slice ${c.id}`)),
			...runtimeItem?.getEtagFromParams ? { getEtagFromParams: runtimeItem.getEtagFromParams } : {},
			...c.sourceFile ? { sourceFile: c.sourceFile } : {}
		};
	});
};
//#endregion
//#region \0react-server-dom-webpack/server.edge
function renderToReadableStream(model, _webpackMap, options) {
	return renderToReadableStream$1(model, options);
}
//#endregion
//#region node_modules/waku/dist/server.js
async function serializeRsc(element) {
	return streamToBytes(renderToReadableStream(element, {}));
}
async function deserializeRsc(bytes) {
	const { createFromReadableStream } = await import("./client-C7nqKxKf.js");
	return createFromReadableStream(bytesToStream(bytes));
}
//#endregion
//#region node_modules/waku/dist/router/define-router-utils/element-cache.js
var ROOT_SLOT_ID = "root";
var createElementCache = (onSerialize) => {
	const cache = /* @__PURE__ */ new Map();
	return {
		preload: (cacheId, bytes) => {
			cache.set(cacheId, Promise.resolve(bytes));
		},
		get: (cacheId) => {
			const cachedBytes = cache.get(cacheId);
			if (!cachedBytes) return;
			return cachedBytes.then((bytes) => deserializeRsc(bytes));
		},
		set: (cacheId, element) => {
			if (cache.has(cacheId)) return;
			const bytesPromise = serializeRsc(element);
			cache.set(cacheId, bytesPromise);
			if (onSerialize) return bytesPromise.then((bytes) => {
				onSerialize(cacheId, bytesToBase64(bytes));
			});
		}
	};
};
var getSlotCacheId = (slotId) => `slot/${slotId}`;
var getPathSpecCacheId = (pathSpec) => `pathSpec/${pathSpecKey(pathSpec)}`;
var assertNonReservedSlotId = (slotId) => {
	if (slotId === "root" || isRouteSlotId(slotId) || isSliceSlotId(slotId) || /^[A-Z]/.test(slotId)) throw new Error("Element ID cannot be \"root\", \"route:*\", \"slice:*\", or start with a capital letter");
};
//#endregion
//#region node_modules/waku/dist/router/define-router-utils/build-handler.js
var createTaskRunner = (limit) => {
	let running = 0;
	const waiting = [];
	const scheduleTask = async (task) => {
		while (running >= limit) await new Promise((resolve) => waiting.push(resolve));
		running++;
		try {
			await task();
		} finally {
			running--;
			waiting.shift()?.();
		}
	};
	const tasks = [];
	const runTask = (task) => {
		tasks.push(scheduleTask(task));
	};
	const waitForTasks = async () => {
		await Promise.all(tasks);
	};
	return {
		runTask,
		waitForTasks
	};
};
var pathSpecToRoutePath = (pathSpec) => {
	if (pathSpec.some(({ type }) => type !== "literal")) return;
	return "/" + pathSpec.map(({ name }) => name).join("/");
};
var routePathToHtmlFilePath = (routePath) => routePath === "/404" ? "404.html" : routePath + "/index.html";
var createBuildHandler = ({ configRegistry, routeEntries, runHandled, skipBuild }) => {
	return async ({ renderRsc, renderHtml, rscPath2pathname, saveBuildMetadata, generateFile, generateDefaultHtml, unstable_registerPrunableFile }) => {
		await configRegistry.initialize();
		const configs = configRegistry.getAll();
		const serializedCachedElements = /* @__PURE__ */ new Map();
		const buildElementCache = createElementCache((cacheId, serialized) => {
			serializedCachedElements.set(cacheId, serialized);
		});
		const { runTask, waitForTasks } = createTaskRunner(500);
		const path2moduleIds = {};
		const htmlRenderTasks = /* @__PURE__ */ new Set();
		const registerPrunableSourceFiles = () => {
			const allSourceFiles = /* @__PURE__ */ new Set();
			const dynamicSourceFiles = /* @__PURE__ */ new Set();
			const recordSourceFile = (isStatic, sourceFile) => {
				if (!sourceFile) return;
				allSourceFiles.add(sourceFile);
				if (!isStatic) dynamicSourceFiles.add(sourceFile);
			};
			for (const c of configs) if (c.type === "route") {
				recordSourceFile(c.rootElement.isStatic, c.rootElement.sourceFile);
				for (const el of Object.values(c.elements)) recordSourceFile(el.isStatic, el.sourceFile);
			} else recordSourceFile(c.isStatic, c.sourceFile);
			for (const srcPath of allSourceFiles) if (!dynamicSourceFiles.has(srcPath)) unstable_registerPrunableFile(srcPath);
		};
		const generateStaticApiResponses = () => {
			for (const item of configs) {
				if (item.type !== "api") continue;
				if (!item.isStatic) continue;
				const routePath = pathSpecToRoutePath(item.path);
				if (!routePath) continue;
				if (skipBuild?.(routePath)) continue;
				const req = new Request(new URL(routePath, "http://localhost:3000"));
				runTask(async () => {
					await runHandled(req, async () => {
						const res = await item.handler(req, { params: {} });
						await generateFile(routePath, res.body || "").catch((e) => {
							if (e instanceof Error && "code" in e && e.code === "EEXIST") throw new Error(`the API route ${pathSpecAsString(item.path)} faced file-system conflicts when writing static responses, this often happens because of empty segments in "staticPaths".`, { cause: e });
							throw e;
						});
					});
				});
			}
		};
		const cacheStaticElementsOfRoute = async (item, routePath) => {
			const option = {
				routePath: routePath ?? pathSpecAsString(item.path),
				query: void 0
			};
			const tasks = [];
			const cache = (cacheId, el) => {
				if (!el.isStatic || buildElementCache.get(cacheId)) return;
				const result = buildElementCache.set(cacheId, el.renderer(option));
				if (result instanceof Promise) tasks.push(result);
			};
			cache(getSlotCacheId(ROOT_SLOT_ID), item.rootElement);
			cache(getPathSpecCacheId(item.path), item.routeElement);
			for (const [id, el] of Object.entries(item.elements)) cache(getSlotCacheId(id), el);
			await Promise.all(tasks);
		};
		const buildRoutes = () => {
			for (const item of configs) {
				if (item.type !== "route") continue;
				const routePath = pathSpecToRoutePath(item.path);
				if (routePath && skipBuild?.(routePath)) continue;
				if (!routePath || !item.isStatic) {
					const req = new Request(new URL(routePath ?? pathSpecAsString(item.path), "http://localhost:3000"));
					runTask(() => runHandled(req, () => cacheStaticElementsOfRoute(item, routePath)));
					continue;
				}
				const rscPath = encodeRoutePath(routePath);
				const req = new Request(new URL(routePath, "http://localhost:3000"));
				runTask(async () => {
					await runHandled(req, async () => {
						const entries = await routeEntries.getEntriesForRoute(rscPath, void 0, {}, buildElementCache);
						if (!entries) return;
						for (const id of Object.keys(entries.elements)) {
							const cached = buildElementCache.get(id);
							entries.elements[id] = cached ? await cached : entries.elements[id];
						}
						const moduleIds = /* @__PURE__ */ new Set();
						const [stream1, stream2] = (await renderRsc(entries.elements, {
							etags: entries.etags,
							unstable_clientModuleCallback: (ids) => ids.forEach((id) => moduleIds.add(id))
						})).tee();
						await generateFile(rscPath2pathname(rscPath), stream1);
						path2moduleIds[path2regexp(item.pathPattern || item.path)] = Array.from(moduleIds);
						htmlRenderTasks.add(() => runHandled(req, async () => {
							const res = await renderHtml(stream2, /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(INTERNAL_ServerRouter, { route: {
								path: routePath,
								query: "",
								hash: ""
							} }), {
								rscPath,
								unstable_extraScriptContent: getRouterPrefetchCode(path2moduleIds) + setupRouterSearchCodecs(configs)
							});
							await generateFile(routePathToHtmlFilePath(routePath), res.body || "");
						}));
					});
				});
			}
		};
		const generateNoSsrDefaultHtml = () => {
			for (const item of configs) {
				if (item.type !== "route") continue;
				if (item.noSsr) {
					const routePath = pathSpecToRoutePath(item.path);
					if (!routePath) throw new Error("Pathname is required for noSsr routes on build");
					if (skipBuild?.(routePath)) continue;
					runTask(async () => {
						await generateDefaultHtml(routePathToHtmlFilePath(routePath));
					});
				}
			}
		};
		const buildStaticSlices = () => {
			for (const item of configs) {
				if (item.type !== "slice") continue;
				if (!item.isStatic) continue;
				if (item.pathSpec) continue;
				const rscPath = encodeSliceId(item.id);
				const req = new Request(new URL("http://localhost:3000"));
				runTask(async () => {
					await runHandled(req, async () => {
						const entries = await routeEntries.getEntriesForSlice(item.id, buildElementCache, { sliceConfig: item });
						if (!entries) return;
						const body = await renderRsc(entries.elements, { etags: entries.etags });
						await generateFile(rscPath2pathname(rscPath), body);
					});
				});
			}
		};
		const persistBuildMetadata = async () => {
			await saveBuildMetadata(DEFINE_ROUTER_METADATA.cachedElements, JSON.stringify(Object.fromEntries(serializedCachedElements)));
			await saveBuildMetadata(DEFINE_ROUTER_METADATA.path2moduleIds, JSON.stringify(path2moduleIds));
			await saveBuildMetadata(DEFINE_ROUTER_METADATA.serializableConfigs, JSON.stringify(configs.map(toSerializable)));
		};
		registerPrunableSourceFiles();
		generateStaticApiResponses();
		buildRoutes();
		await waitForTasks();
		htmlRenderTasks.forEach(runTask);
		generateNoSsrDefaultHtml();
		buildStaticSlices();
		await waitForTasks();
		await persistBuildMetadata();
	};
};
//#endregion
//#region node_modules/waku/dist/router/define-router-utils/config-registry.js
var is404 = (pathSpec) => pathSpec.length === 1 && pathSpec[0].type === "literal" && pathSpec[0].name === "404";
var createConfigRegistry = (getConfigs) => {
	let cachedConfigs;
	let cachedHas404 = false;
	let cachedRoutePath2searchCodec;
	let initPromise;
	const load = async (loadBuildMetadata) => {
		const runtimeConfigs = Array.from(await getConfigs());
		let configs = runtimeConfigs;
		if (loadBuildMetadata) {
			const raw = await loadBuildMetadata(DEFINE_ROUTER_METADATA.serializableConfigs);
			if (raw) configs = mergeWithRuntimeConfigs(JSON.parse(raw), runtimeConfigs);
		}
		configs.forEach((item) => {
			if (item.type === "route") Object.keys(item.elements).forEach(assertNonReservedSlotId);
			else if (item.type === "slice") {
				if (item.isStatic && item.pathSpec) throw new Error(`defineRouter: static slice "${item.id}" cannot have a pathSpec`);
			}
		});
		cachedConfigs = configs;
		cachedHas404 = configs.some((item) => item.type === "route" && is404(item.path));
	};
	const initialize = (loadBuildMetadata) => initPromise ??= load(loadBuildMetadata).catch((e) => {
		initPromise = void 0;
		throw e;
	});
	const getAll = () => {
		if (!cachedConfigs) throw new Error("defineRouter: configs not initialized");
		return cachedConfigs;
	};
	const has404 = () => {
		if (!cachedConfigs) throw new Error("defineRouter: configs not initialized");
		return cachedHas404;
	};
	const resolveSearchCodec = (routePath) => {
		if (!cachedRoutePath2searchCodec) {
			cachedRoutePath2searchCodec = /* @__PURE__ */ new Map();
			for (const item of getAll()) if (item.type === "route" && item.searchCodec) cachedRoutePath2searchCodec.set(pathSpecAsString(item.pathPattern ?? item.path), item.searchCodec);
		}
		return cachedRoutePath2searchCodec.get(routePath);
	};
	const findPathConfig = (pathname) => {
		const routePath = pathnameToRoutePath(pathname);
		return getAll().find((item) => (item.type === "route" || item.type === "api") && !!getPathMapping(item.path, routePath));
	};
	const findSliceConfig = (sliceId) => {
		const slicePath = "/" + sliceId;
		for (const item of getAll()) {
			if (item.type !== "slice") continue;
			if (item.id === sliceId) return { sliceConfig: item };
			if (item.pathSpec) {
				const params = getPathMapping(item.pathSpec, slicePath);
				if (params) return {
					sliceConfig: item,
					params
				};
			}
		}
	};
	return {
		initialize,
		getAll,
		has404,
		resolveSearchCodec,
		findPathConfig,
		findSliceConfig
	};
};
//#endregion
//#region node_modules/waku/dist/router/define-router-utils/request-store.js
var routerStorage = new AsyncLocalStorage();
var runWithRouterStore = (store, fn) => routerStorage.run(store, fn);
var setRscPath = (rscPath) => {
	const store = routerStorage.getStore();
	if (store) store.rscPath = rscPath;
};
var setRscParams = (rscParams) => {
	const store = routerStorage.getStore();
	if (store) store.rscParams = rscParams;
};
var setRerender = (rerender) => {
	const store = routerStorage.getStore();
	if (store) store.rerender = rerender;
};
var getNonce = () => routerStorage.getStore()?.nonce;
var getResolveSearchCodec = () => routerStorage.getStore()?.resolveSearchCodec;
//#endregion
//#region node_modules/waku/dist/router/define-router-utils/request-handler.js
var resolveInternalRoute = (location, base) => {
	if (!location.startsWith("/") || location.includes("#")) return;
	const url = new URL(location, base);
	if (url.origin !== new URL(base).origin) return;
	return {
		path: pathnameToRoutePath(url.pathname),
		query: url.searchParams.toString()
	};
};
var createRequestHandler = ({ configRegistry, routeEntries, runHandled }) => {
	const requestElementCache = createElementCache();
	let requestElementCacheInit;
	let cachedPath2moduleIds;
	return async (input, { renderRsc, renderHtml, loadBuildMetadata }) => {
		await configRegistry.initialize(loadBuildMetadata);
		return runHandled(input.req, async () => {
			requestElementCacheInit ??= (async () => {
				const cachedElementsMetadata = await loadBuildMetadata(DEFINE_ROUTER_METADATA.cachedElements);
				if (cachedElementsMetadata) Object.entries(JSON.parse(cachedElementsMetadata)).forEach(([cacheId, str]) => {
					requestElementCache.preload(cacheId, base64ToBytes(str));
				});
			})();
			await requestElementCacheInit;
			const getPath2moduleIds = async () => {
				if (!cachedPath2moduleIds) cachedPath2moduleIds = JSON.parse(await loadBuildMetadata(DEFINE_ROUTER_METADATA.path2moduleIds) || "{}");
				return cachedPath2moduleIds;
			};
			const clientEtags = input.type !== "http" && input.etags || {};
			const withRerender = async (fn) => {
				let entriesPromise = Promise.resolve({
					elements: {},
					etags: {}
				});
				let rendered = false;
				const rerender = (rscPath, rscParams) => {
					if (rendered) throw new Error("already rendered");
					entriesPromise = Promise.all([entriesPromise, routeEntries.getEntriesForRoute(rscPath, rscParams, clientEtags, requestElementCache)]).then(([oldEntries, newEntries]) => {
						if (newEntries === null) {
							console.warn("getEntries returned null");
							return oldEntries;
						}
						return {
							elements: {
								...oldEntries.elements,
								...newEntries.elements
							},
							etags: {
								...oldEntries.etags,
								...newEntries.etags
							}
						};
					});
				};
				setRerender(rerender);
				try {
					return {
						value: await fn(),
						entries: await entriesPromise
					};
				} finally {
					rendered = true;
				}
			};
			const getEntriesForRedirect = async (location) => {
				const redirectRoute = resolveInternalRoute(location, input.req.url);
				if (!redirectRoute) return null;
				const url = new URL(input.req.url);
				const base = url.pathname.slice(0, url.pathname.length - input.pathname.length);
				const headers = new Headers(input.req.headers);
				for (const name of ["content-type", "content-length"]) headers.delete(name);
				return runHandled(new Request(new URL(base + location, url), { headers }), () => routeEntries.getEntriesForRoute(encodeRoutePath(redirectRoute.path), new URLSearchParams({ query: redirectRoute.query }), clientEtags, requestElementCache)).catch(() => null);
			};
			const handleRscRequest = async ({ rscPath, rscParams }) => {
				const sliceId = decodeSliceId(rscPath);
				if (sliceId !== null) {
					const entries = await routeEntries.getEntriesForSlice(sliceId, requestElementCache);
					if (!entries) return null;
					return renderRsc(entries.elements, { etags: entries.etags });
				}
				let entries = null;
				try {
					entries = await routeEntries.getEntriesForRoute(rscPath, rscParams, clientEtags, requestElementCache);
				} catch (e) {
					const info = getErrorInfo(e);
					if (info?.location && info.status !== 404) {
						const redirected = await getEntriesForRedirect(info.location);
						if (!redirected) throw e;
						return renderRsc(redirected.elements, { etags: redirected.etags });
					}
					if (info?.status !== 404) throw e;
				}
				if (!entries && configRegistry.has404()) entries = await routeEntries.getEntriesForRoute(encodeRoutePath("/404"), rscParams, clientEtags, requestElementCache).catch((e) => {
					if (getErrorInfo(e)?.status !== 404) throw e;
					return null;
				});
				if (!entries) return null;
				return renderRsc(entries.elements, { etags: entries.etags });
			};
			const handleCallRequest = async ({ fn, args }) => {
				try {
					const { value, entries } = await withRerender(() => fn(...args));
					return renderRsc(entries.elements, {
						value,
						etags: entries.etags
					});
				} catch (e) {
					const location = getErrorInfo(e)?.location;
					if (!location) throw e;
					const entries = await getEntriesForRedirect(location);
					if (!entries) throw e;
					return renderRsc(entries.elements, { etags: entries.etags });
				}
			};
			const handleHttpRequest = async ({ pathname, req, tryAction }) => {
				const pathConfigItem = configRegistry.findPathConfig(pathname);
				if (pathConfigItem?.type === "api") {
					const url = new URL(req.url);
					url.pathname = pathname;
					const apiReq = new Request(url, req);
					const params = getPathMapping(pathConfigItem.path, pathname) ?? {};
					return pathConfigItem.handler(apiReq, { params });
				}
				const renderPage = async (pathname, query, status = 200) => {
					const routePath = pathnameToRoutePath(pathname);
					const rscPath = encodeRoutePath(routePath);
					const rscParams = new URLSearchParams({ query });
					let entries = await routeEntries.getEntriesForRoute(rscPath, rscParams, clientEtags, requestElementCache);
					if (!entries) return null;
					const path2moduleIds = await getPath2moduleIds();
					const route = {
						path: routePath,
						query,
						hash: ""
					};
					const nonce = getNonce();
					const html = /*#__PURE__*/ (0, import_jsx_runtime_react_server.jsx)(INTERNAL_ServerRouter, { route });
					let formState;
					if (tryAction) {
						const { value, entries: rerendered } = await withRerender(tryAction);
						formState = value.action ? value.formState : void 0;
						entries = {
							elements: {
								...entries.elements,
								...rerendered.elements
							},
							etags: {
								...entries.etags,
								...rerendered.etags
							}
						};
					}
					return renderHtml(await renderRsc(entries.elements, { etags: entries.etags }), html, {
						rscPath,
						formState,
						status,
						...nonce ? { nonce } : {},
						unstable_extraScriptContent: getRouterPrefetchCode(path2moduleIds) + setupRouterSearchCodecs(configRegistry.getAll())
					});
				};
				const query = new URL(req.url).searchParams.toString();
				if (pathConfigItem?.noSsr) return "fallback";
				try {
					if (pathConfigItem) return await renderPage(pathname, query);
				} catch (e) {
					if (getErrorInfo(e)?.status !== 404) throw e;
				}
				if (configRegistry.has404()) return renderPage("/404", query, 404);
				else return null;
			};
			if (input.type === "rsc") return handleRscRequest(input);
			if (input.type === "call") return handleCallRequest(input);
			if (input.type === "http") return handleHttpRequest(input);
		});
	};
};
//#endregion
//#region node_modules/waku/dist/router/define-router-utils/route-entries.js
var parseRscParams = (rscParams) => {
	if (rscParams instanceof URLSearchParams) return { query: rscParams.get("query") || "" };
	if (typeof rscParams?.query === "string") return { query: rscParams.query };
	return { query: "" };
};
var bindEtag = (getEtag, arg) => getEtag && (() => getEtag(arg));
var createRouteEntries = (configRegistry) => {
	const getSliceElement = async (sliceConfig, elementCache, concreteId, params) => {
		const cacheId = getSlotCacheId(getSliceSlotId(concreteId ?? sliceConfig.id));
		const cached = elementCache.get(cacheId);
		if (cached) return cached;
		const element = await sliceConfig.renderer(params);
		if (sliceConfig.isStatic) {
			await elementCache.set(cacheId, element);
			return elementCache.get(cacheId);
		}
		return element;
	};
	const getEntriesForRoute = async (rscPath, rscParams, clientEtags, elementCache) => {
		setRscPath(rscPath);
		setRscParams(rscParams);
		const routePath = decodeRoutePath(rscPath);
		const pathConfigItem = configRegistry.findPathConfig(routePath);
		if (pathConfigItem?.type !== "route") return null;
		const { query } = parseRscParams(rscParams);
		const routeId = getRouteSlotId(routePath);
		const routeTemplateCacheId = getPathSpecCacheId(pathConfigItem.path);
		const option = {
			routePath,
			query: pathConfigItem.isStatic ? void 0 : query
		};
		const slices = pathConfigItem.slices || [];
		const sliceConfigMap = /* @__PURE__ */ new Map();
		slices.forEach((sliceId) => {
			const found = configRegistry.findSliceConfig(sliceId);
			if (found) sliceConfigMap.set(sliceId, {
				...found.sliceConfig,
				...found.params ? { params: found.params } : {}
			});
		});
		const makeElementSource = (isStatic, cacheId, render, getEtag) => isStatic ? {
			immutable: true,
			render: async () => {
				if (!elementCache.get(cacheId)) await elementCache.set(cacheId, await render());
				return elementCache.get(cacheId);
			}
		} : {
			getEtag,
			render
		};
		const elementSources = {
			[ROOT_SLOT_ID]: makeElementSource(pathConfigItem.rootElement.isStatic, getSlotCacheId(ROOT_SLOT_ID), () => pathConfigItem.rootElement.renderer(option), bindEtag(pathConfigItem.rootElement.getEtagFromOption, option)),
			[routeId]: makeElementSource(pathConfigItem.routeElement.isStatic, routeTemplateCacheId, () => pathConfigItem.routeElement.renderer(option), bindEtag(pathConfigItem.routeElement.getEtagFromOption, option))
		};
		for (const [id, el] of Object.entries(pathConfigItem.elements)) elementSources[id] = makeElementSource(el.isStatic, getSlotCacheId(id), () => el.renderer(option), bindEtag(el.getEtagFromOption, option));
		for (const sliceId of slices) {
			const sliceConfig = sliceConfigMap.get(sliceId);
			if (!sliceConfig) throw new Error(`Slice not found: ${sliceId}`);
			elementSources[getSliceSlotId(sliceId)] = makeElementSource(sliceConfig.isStatic, getSlotCacheId(getSliceSlotId(sliceId)), () => sliceConfig.renderer(sliceConfig.params), bindEtag(sliceConfig.getEtagFromParams, sliceConfig.params));
		}
		const { elements, etags } = await unstable_buildElements(clientEtags, elementSources);
		elements[ROUTE_ID] = [routePath, query];
		elements[IS_STATIC_ID] = pathConfigItem.isStatic;
		if (configRegistry.has404()) elements[HAS404_ID] = true;
		return {
			elements,
			etags
		};
	};
	const getEntriesForSlice = async (sliceId, elementCache, preResolved) => {
		const found = preResolved ?? configRegistry.findSliceConfig(sliceId);
		if (!found) return null;
		const { sliceConfig, params: sliceParams } = found;
		return unstable_buildElements({}, { [getSliceSlotId(sliceId)]: {
			immutable: sliceConfig.isStatic,
			getEtag: bindEtag(sliceConfig.getEtagFromParams, sliceParams),
			render: () => getSliceElement(sliceConfig, elementCache, sliceId, sliceParams)
		} });
	};
	return {
		getEntriesForRoute,
		getEntriesForSlice
	};
};
//#endregion
//#region node_modules/waku/dist/router/isomorphic-utils/build-route-href.js
/**
* Build an href string from a route path, params, search, and hash.
*
* Route groups in the path are removed, path params are URL-encoded, and the
* result is validated against the route matcher; building a pathname that the
* path would not match (e.g. an empty array for a prefixed catch-all) throws.
*/ var buildRouteHref = (target, resolveCodec) => {
	const { to, search, hash, params } = target;
	const pathSpec = parsePathWithSlug(getGrouplessPath(to));
	const segments = [];
	for (const item of pathSpec) if (item.type === "literal") segments.push(item.name);
	else if (item.type === "wildcard") {
		const value = item.name ? params?.[item.name] : void 0;
		if (!Array.isArray(value)) throw new Error(`Missing catch-all param "${item.name}" for "${to}"`);
		for (const part of value) segments.push(encodeURIComponent(part));
	} else {
		const value = item.name ? params?.[item.name] : void 0;
		if (typeof value !== "string") throw new Error(`Missing param "${item.name}" for "${to}"`);
		const prefix = item.prefix ?? "";
		const suffix = item.suffix ?? "";
		segments.push(prefix + encodeURIComponent(value) + suffix);
	}
	const pathname = "/" + segments.join("/");
	if (!getPathMapping(pathSpec, pathname)) throw new Error(`Cannot build "${to}" with the given params`);
	let query = "";
	if (search !== void 0) {
		const codec = resolveCodec?.(to);
		if (!codec) throw new Error(`Cannot serialize "search" for "${to}": no search codec resolved. Provide it via <Unstable_SearchCodecsProvider> in a module rendered on every page (e.g. your root layout) so navigation can serialize it.`);
		query = codec.serialize(search);
	}
	return pathname + (query ? "?" + query : "") + (hash ? "#" + (hash.startsWith("#") ? hash.slice(1) : hash) : "");
};
//#endregion
//#region node_modules/waku/dist/router/define-router.js
function unstable_notFound() {
	throw createCustomError("Not Found", { status: 404 });
}
/**
* Redirect within the app, or away from it with an absolute http or https url.
* A `URL` is the way to pass one that is not a literal. Where it points is not
* validated, so check a target built from user input against your own
* allowlist.
*
* An absolute url navigates the document even when it names this origin, so
* pass a path to stay within the app. A form submission without JavaScript is
* followed by the browser, which resends the body on 307 and 308, so those
* answer 303 instead.
*/ function unstable_redirect(to, status = 307) {
	let location = typeof to === "string" ? to : to instanceof URL ? to.href : buildRouteHref(to, getResolveSearchCodec());
	const leavesTheApp = location.startsWith("http://") || location.startsWith("https://");
	if (leavesTheApp ? !URL.canParse(location) : !location.startsWith("/") || location.startsWith("//")) throw new Error(`Invalid redirect location: ${JSON.stringify(location)}`);
	if (leavesTheApp) {
		const url = new URL(location);
		url.username = "";
		url.password = "";
		location = url.href;
	}
	for (let i = 0; i < location.length; ++i) {
		const charCode = location.charCodeAt(i);
		if (charCode < 32 || charCode === 127 || charCode === 92 && !leavesTheApp) throw new Error(`Invalid redirect location: ${JSON.stringify(location)}`);
	}
	throw createCustomError("Redirect", {
		status,
		location
	});
}
function unstable_defineRouter(fns) {
	const configRegistry = createConfigRegistry(fns.getConfigs);
	const routeEntries = createRouteEntries(configRegistry);
	const runHandled = (req, fn) => runWithRouterStore({
		req,
		resolveSearchCodec: configRegistry.resolveSearchCodec
	}, (fns.unstable_interceptors ?? []).reduceRight((next, interceptor) => () => interceptor(next), fn));
	const handleRequest = createRequestHandler({
		configRegistry,
		routeEntries,
		runHandled
	});
	const handleBuild = createBuildHandler({
		configRegistry,
		routeEntries,
		runHandled,
		skipBuild: fns.unstable_skipBuild
	});
	return Object.assign(unstable_defineHandlers({
		handleRequest,
		handleBuild
	}), { unstable_getRouterConfigs: async () => configRegistry.getAll() });
}
//#endregion
//#region node_modules/waku/dist/minimal/client.js
var import_react_react_server = require_react_react_server();
var Children_UNSTABLE = /* #__PURE__ */ registerClientReference((() => {
	throw new Error("It is not possible to invoke a client function from the server: \"Children_UNSTABLE\"");
}), "847a2b1045ef", "Children_UNSTABLE");
var Slot_UNSTABLE = /* #__PURE__ */ registerClientReference((() => {
	throw new Error("It is not possible to invoke a client function from the server: \"Slot_UNSTABLE\"");
}), "847a2b1045ef", "Slot_UNSTABLE");
//#endregion
//#region node_modules/waku/dist/router/create-pages-utils/path-spec.js
var parseExactPath = (path) => path.split("/").filter(Boolean).map((name) => ({
	type: "literal",
	name
}));
function countSlugsAndWildcards(pathSpec) {
	let numSlugs = 0;
	let numWildcards = 0;
	for (const slug of pathSpec) {
		if (slug.type !== "literal") numSlugs++;
		if (slug.type === "wildcard") numWildcards++;
	}
	return {
		numSlugs,
		numWildcards
	};
}
//#endregion
//#region node_modules/waku/dist/router/create-pages.js
var pathMappingWithoutGroups = (pathSpec, pathname) => {
	return getPathMapping(pathSpec.filter((spec) => !(spec.type === "literal" && spec.name.startsWith("("))), pathname);
};
var sanitizeSlug = (slug) => slug.replace(/ /g, "-");
var normalizeStaticPaths = (staticPaths) => staticPaths.map((item) => (Array.isArray(item) ? item : [item]).map(sanitizeSlug));
var assertStaticPathArity = (staticSegments, slugCount, wildcardCount) => {
	if (staticSegments.length !== slugCount && wildcardCount === 0) throw new Error("staticPaths does not match with slug pattern");
};
var getPageSlotId = (routePath) => `page:${routePath}`;
var getLayoutSlotId = (layoutIdPath) => `layout:${layoutIdPath}`;
var parseSearchOrThrow = (codec, query) => {
	try {
		return codec.parse(query);
	} catch (cause) {
		const err = createCustomError("Bad Request", { status: 400 });
		err.cause = cause;
		throw err;
	}
};
var forEachConcreteStaticPath = (routePathSpec, staticPathsInput, fn) => {
	const { numSlugs, numWildcards } = countSlugsAndWildcards(routePathSpec);
	for (const staticSegments of normalizeStaticPaths(staticPathsInput)) {
		assertStaticPathArity(staticSegments, numSlugs, numWildcards);
		fn(expandStaticRoutePath(routePathSpec, staticSegments));
	}
};
var DefaultRoot = ({ children }) => /*#__PURE__*/ (0, import_jsx_runtime_react_server.jsx)(ErrorBoundary, { children: /*#__PURE__*/ (0, import_jsx_runtime_react_server.jsxs)("html", { children: [/*#__PURE__*/ (0, import_jsx_runtime_react_server.jsx)("head", {}), /*#__PURE__*/ (0, import_jsx_runtime_react_server.jsx)("body", { children })] }) });
var createNestedElements = (elements, children) => elements.reduceRight((result, element) => /*#__PURE__*/ (0, import_react_react_server.createElement)(element.component, element.props, result), children);
var routePriorityComparator = (a, b) => {
	const aPath = a.path;
	const bPath = b.path;
	const aPathLength = aPath.length;
	const bPathLength = bPath.length;
	const aHasWildcard = aPath.at(-1)?.type === "wildcard";
	const bHasWildcard = bPath.at(-1)?.type === "wildcard";
	if (aPathLength === 0 && bHasWildcard) return -1;
	if (bPathLength === 0 && aHasWildcard) return 1;
	if (aPathLength !== bPathLength) return aPathLength > bPathLength ? -1 : 1;
	const minLength = Math.min(aPathLength, bPathLength);
	for (let i = 0; i < minLength; i++) {
		const aIsLiteral = aPath[i]?.type === "literal";
		if (aIsLiteral !== (bPath[i]?.type === "literal")) return aIsLiteral ? -1 : 1;
	}
	if (aHasWildcard !== bHasWildcard) return aHasWildcard ? 1 : -1;
	return 0;
};
var createPages = (fn, options) => {
	let configured = false;
	const groupedRoutePathByRoutePath = /* @__PURE__ */ new Map();
	const staticPageEntryByRoutePath = /* @__PURE__ */ new Map();
	const dynamicPageEntryByRoutePath = /* @__PURE__ */ new Map();
	const wildcardPageEntryByRoutePath = /* @__PURE__ */ new Map();
	const dynamicLayoutEntryByRoutePath = /* @__PURE__ */ new Map();
	const apiEntryByRoutePath = /* @__PURE__ */ new Map();
	const staticComponentById = /* @__PURE__ */ new Map();
	const getStaticComponentId = (routePath, kind) => (routePath + "/" + kind).slice(1);
	const getStaticLayout = (id) => staticComponentById.get(getStaticComponentId(id, "layout"))?.component;
	const sliceIdsByRoutePath = /* @__PURE__ */ new Map();
	const sliceEntryById = /* @__PURE__ */ new Map();
	let rootItem = void 0;
	const pagePathExists = (path) => apiEntryByRoutePath.has(path) || staticPageEntryByRoutePath.has(path) || dynamicPageEntryByRoutePath.has(path) || wildcardPageEntryByRoutePath.has(path);
	const createPathPropsMapper = (path) => {
		const routePathSpec = parsePathWithSlug(groupedRoutePathByRoutePath.get(path) ?? path);
		return (pathname) => pathMappingWithoutGroups(routePathSpec, pathname);
	};
	const createLayoutPropsMapper = (layoutPath) => {
		const routePathSpec = parsePathWithSlug(layoutPath);
		const numSegments = routePathSpec.filter((segment) => !(segment.type === "literal" && segment.name.startsWith("("))).length;
		return (routePath) => {
			const layoutRoutePath = "/" + routePath.split("/").filter(Boolean).slice(0, numSegments).join("/");
			return pathMappingWithoutGroups(routePathSpec, layoutRoutePath) ?? {};
		};
	};
	const getLayoutIdPath = (layoutPath, routePath) => {
		const numSegments = parsePathWithSlug(layoutPath).length;
		return "/" + routePath.split("/").filter(Boolean).slice(0, numSegments).join("/");
	};
	const buildRouteElement = (layouts, path) => {
		const layoutElements = layouts.map(({ layoutIdPath }) => ({
			component: Slot_UNSTABLE,
			props: { id: getLayoutSlotId(layoutIdPath) }
		}));
		return () => createNestedElements(layoutElements, /*#__PURE__*/ (0, import_jsx_runtime_react_server.jsx)(Slot_UNSTABLE, { id: getPageSlotId(path) }));
	};
	const renderRoot = () => /*#__PURE__*/ (0, import_react_react_server.createElement)(rootItem ? rootItem.component : DefaultRoot, null, /*#__PURE__*/ (0, import_jsx_runtime_react_server.jsx)(Children_UNSTABLE, {}));
	const registerStaticComponent = (id, component, sourceFile) => {
		const existing = staticComponentById.get(id);
		if (existing && existing.component !== component) throw new Error(`Duplicated component for: ${id}`);
		staticComponentById.set(id, {
			component,
			sourceFile
		});
	};
	const isAllElementsStatic = (elements) => Object.values(elements).every((element) => element.isStatic);
	const isAllSlicesStatic = (path) => sliceIdsByRoutePath.get(path).every((sliceId) => sliceEntryById.get(sliceId)?.isStatic);
	const createPage = (page) => {
		if (configured) throw new Error("createPage no longer available");
		if (!page.component) return page;
		const pageRoutePath = pathnameToRoutePath(page.path);
		if (pagePathExists(pageRoutePath)) throw new Error(`Duplicated path: ${page.path}`);
		const routePathSpec = parsePathWithSlug(pageRoutePath);
		const { numSlugs, numWildcards } = countSlugsAndWildcards(routePathSpec);
		const noSsr = page.unstable_disableSSR ?? false;
		const slices = page.slices || [];
		const sourceFile = page.unstable_sourceFile;
		const getEtag = page.unstable_getEtag;
		const searchCodec = page.unstable_searchCodec;
		if (searchCodec && page.render === "static") throw new Error(`unstable_searchCodec is not supported on a static route (${page.path}); search params need a per-request query, so use render: 'dynamic'.`);
		const registerPageWithExactPath = () => {
			const routePath = pageRoutePath;
			const spec = parseExactPath(routePath);
			if (page.render === "static") {
				staticPageEntryByRoutePath.set(routePath, {
					concretePathSpec: spec,
					noSsr,
					sourceFile
				});
				const id = getStaticComponentId(routePath, "page");
				registerStaticComponent(id, page.component, sourceFile);
			} else dynamicPageEntryByRoutePath.set(routePath, {
				routePathSpec: spec,
				component: page.component,
				noSsr,
				sourceFile,
				getEtag,
				searchCodec
			});
			sliceIdsByRoutePath.set(routePath, slices);
		};
		const registerStaticPageWithoutSlugs = () => {
			const routePath = pathnameToRoutePath(getGrouplessPath(page.path));
			staticPageEntryByRoutePath.set(routePath, {
				concretePathSpec: routePathSpec,
				noSsr,
				sourceFile
			});
			const id = getStaticComponentId(routePath, "page");
			if (routePath !== pageRoutePath) groupedRoutePathByRoutePath.set(routePath, pageRoutePath);
			registerStaticComponent(id, page.component, sourceFile);
			sliceIdsByRoutePath.set(routePath, slices);
		};
		const registerStaticPageWithSlugs = (staticPathsInput) => {
			forEachConcreteStaticPath(routePathSpec, staticPathsInput, ({ concretePath, pathItems, mapping }) => {
				const routePath = pathnameToRoutePath(getGrouplessPath(concretePath));
				const concretePathSpec = pathItems.map((name) => ({
					type: "literal",
					name
				}));
				staticPageEntryByRoutePath.set(routePath, {
					concretePathSpec,
					pathPatternSpec: routePathSpec,
					noSsr,
					sourceFile
				});
				const concreteRoutePath = pathnameToRoutePath(concretePath);
				if (routePath !== concreteRoutePath) groupedRoutePathByRoutePath.set(routePath, concreteRoutePath);
				const id = getStaticComponentId(routePath, "page");
				const WrappedComponent = (props) => /*#__PURE__*/ (0, import_react_react_server.createElement)(page.component, {
					...props,
					...mapping
				});
				registerStaticComponent(id, WrappedComponent, sourceFile);
				sliceIdsByRoutePath.set(routePath, slices);
			});
		};
		const registerDynamicPageWithoutWildcard = () => {
			const routePath = pathnameToRoutePath(getGrouplessPath(page.path));
			if (routePath !== pageRoutePath) groupedRoutePathByRoutePath.set(routePath, pageRoutePath);
			dynamicPageEntryByRoutePath.set(routePath, {
				routePathSpec,
				component: page.component,
				noSsr,
				sourceFile,
				getEtag,
				searchCodec
			});
			sliceIdsByRoutePath.set(routePath, slices);
		};
		const registerDynamicPageWithWildcard = () => {
			const routePath = pathnameToRoutePath(getGrouplessPath(page.path));
			if (routePath !== pageRoutePath) groupedRoutePathByRoutePath.set(routePath, pageRoutePath);
			wildcardPageEntryByRoutePath.set(routePath, {
				routePathSpec,
				component: page.component,
				noSsr,
				sourceFile,
				getEtag,
				searchCodec
			});
			sliceIdsByRoutePath.set(routePath, slices);
		};
		if (page.exactPath) registerPageWithExactPath();
		else if (page.render === "static" && numSlugs === 0) registerStaticPageWithoutSlugs();
		else if (page.render === "static" && numSlugs > 0 && "staticPaths" in page) registerStaticPageWithSlugs(page.staticPaths);
		else if (page.render === "dynamic" && numWildcards === 0) registerDynamicPageWithoutWildcard();
		else if (page.render === "dynamic" && numWildcards === 1) registerDynamicPageWithWildcard();
		else throw new Error("Invalid page configuration " + JSON.stringify(page));
		return page;
	};
	const createLayout = (layout) => {
		if (configured) throw new Error("createLayout no longer available");
		if (!layout.component) return;
		const routePath = pathnameToRoutePath(layout.path);
		const sourceFile = layout.unstable_sourceFile;
		const getEtag = layout.unstable_getEtag;
		if (layout.render === "static") {
			const id = getStaticComponentId(routePath, "layout");
			registerStaticComponent(id, layout.component, sourceFile);
		} else if (layout.render === "dynamic") {
			if (dynamicLayoutEntryByRoutePath.has(routePath)) throw new Error(`Duplicated dynamic path: ${layout.path}`);
			const routePathSpec = parsePathWithSlug(routePath);
			dynamicLayoutEntryByRoutePath.set(routePath, {
				routePathSpec,
				component: layout.component,
				sourceFile,
				getEtag
			});
		} else throw new Error("Invalid layout configuration");
	};
	const createApi = (options) => {
		if (configured) throw new Error("createApi no longer available");
		if (options.render === "static") {
			if (!options.handler) return;
		} else if (!options.handlers || !Object.values(options.handlers).some(Boolean)) return;
		const routePath = pathnameToRoutePath(options.path);
		const sourceFile = options.unstable_sourceFile;
		if (pagePathExists(routePath)) throw new Error(`Duplicated api path: ${options.path}`);
		const routePathSpec = parsePathWithSlug(routePath);
		if (options.render === "static") {
			const { numSlugs } = countSlugsAndWildcards(routePathSpec);
			if (numSlugs > 0 && options.staticPaths) forEachConcreteStaticPath(routePathSpec, options.staticPaths, ({ concretePath, pathItems, mapping }) => {
				const concreteRoutePath = pathnameToRoutePath(concretePath);
				if (pagePathExists(concreteRoutePath)) throw new Error(`Duplicated api path: ${concretePath}`);
				apiEntryByRoutePath.set(concreteRoutePath, {
					render: "static",
					routePathSpec: pathItems.map((name) => ({
						type: "literal",
						name
					})),
					handlers: { GET: options.handler },
					staticParams: mapping,
					sourceFile
				});
			});
			else apiEntryByRoutePath.set(routePath, {
				render: "static",
				routePathSpec,
				handlers: { GET: options.handler },
				sourceFile
			});
		} else apiEntryByRoutePath.set(routePath, {
			render: "dynamic",
			routePathSpec,
			handlers: options.handlers,
			sourceFile
		});
	};
	const createRoot = (root) => {
		if (configured) throw new Error("createRoot no longer available");
		if (!root.component) return;
		if (rootItem) throw new Error(`Duplicated root component`);
		if (root.render === "static" || root.render === "dynamic") rootItem = root;
		else throw new Error("Invalid root configuration");
	};
	const createSlice = (slice) => {
		if (configured) throw new Error("createSlice no longer available");
		if (!slice.component) return;
		const slicePathSpec = parsePathWithSlug(slice.id);
		const { numSlugs } = countSlugsAndWildcards(slicePathSpec);
		const sourceFile = slice.unstable_sourceFile;
		const getEtag = slice.unstable_getEtag;
		if (slice.render === "static" && numSlugs > 0) {
			if (!("staticPaths" in slice) || !slice.staticPaths) throw new Error(`Static slice with slug requires staticPaths: ${slice.id}`);
			forEachConcreteStaticPath(slicePathSpec, slice.staticPaths, ({ concretePath, mapping }) => {
				const concreteId = concretePath.replace(/^\//, "");
				if (sliceEntryById.has(concreteId)) throw new Error(`Duplicated slice id: ${concreteId}`);
				const WrappedComponent = (props) => /*#__PURE__*/ (0, import_react_react_server.createElement)(slice.component, {
					...props,
					...mapping
				});
				sliceEntryById.set(concreteId, {
					component: WrappedComponent,
					isStatic: true,
					sourceFile
				});
			});
			return;
		}
		if (sliceEntryById.has(slice.id)) throw new Error(`Duplicated slice id: ${slice.id}`);
		sliceEntryById.set(slice.id, {
			component: slice.component,
			isStatic: slice.render === "static",
			sourceFile,
			getEtag
		});
	};
	const interceptors = [];
	const createInterceptor = (interceptor) => {
		if (configured) throw new Error("createInterceptor no longer available");
		interceptors.push(interceptor);
	};
	let ready;
	const configure = async () => {
		if (!configured && !ready) {
			ready = fn({
				createPage,
				createLayout,
				createRoot,
				createApi,
				createSlice,
				createInterceptor
			});
			await ready;
			configured = true;
		}
		await ready;
	};
	const getLayouts = (routePathSpec) => {
		return routePathSpec.reduce((acc, _segment, index) => {
			acc.push(pathSpecAsString(routePathSpec.slice(0, index + 1)));
			return acc;
		}, ["/"]).filter((segment) => dynamicLayoutEntryByRoutePath.has(segment) || getStaticLayout(segment));
	};
	return unstable_defineRouter({
		getConfigs: async () => {
			await configure();
			const collectLayoutMatches = (spec, routePath) => getLayouts(spec).map((layoutPath) => ({
				layoutPath,
				layoutIdPath: routePath ? getLayoutIdPath(layoutPath, routePath) : layoutPath
			}));
			const buildElementSpec = (component, buildProps, isStatic, sourceFile, getEtag) => {
				const propsCache = /* @__PURE__ */ new WeakMap();
				const toProps = (option) => {
					if (!propsCache.has(option)) propsCache.set(option, buildProps(option));
					return propsCache.get(option);
				};
				return {
					isStatic,
					renderer: (option) => /*#__PURE__*/ (0, import_react_react_server.createElement)(component, toProps(option), /*#__PURE__*/ (0, import_jsx_runtime_react_server.jsx)(Children_UNSTABLE, {})),
					...sourceFile ? { sourceFile } : {},
					...getEtag ? { getEtagFromOption: (option) => getEtag(toProps(option)) } : {}
				};
			};
			const buildLayoutElement = (layoutPath) => {
				const dynamicEntry = dynamicLayoutEntryByRoutePath.get(layoutPath);
				const staticEntry = dynamicEntry ? void 0 : staticComponentById.get(getStaticComponentId(layoutPath, "layout"));
				const layout = dynamicEntry?.component ?? staticEntry?.component;
				if (!layout) throw new Error("Invalid layout " + layoutPath);
				const sourceFile = dynamicEntry?.sourceFile ?? staticEntry?.sourceFile;
				const getLayoutPropsMapping = createLayoutPropsMapper(layoutPath);
				return buildElementSpec(layout, (option) => getLayoutPropsMapping(option.routePath), !dynamicEntry, sourceFile, dynamicEntry?.getEtag);
			};
			const buildLayoutElements = (matches) => Object.fromEntries(matches.map(({ layoutPath, layoutIdPath }) => [getLayoutSlotId(layoutIdPath), buildLayoutElement(layoutPath)]));
			const buildPageElement = (component, getPropsMapping, isStatic, sourceFile, getEtag, searchCodec) => buildElementSpec(component, (option) => ({
				...getPropsMapping(option.routePath),
				...option.query ? { query: option.query } : {},
				...searchCodec ? { search: parseSearchOrThrow(searchCodec, option.query ?? "") } : {},
				path: option.routePath
			}), isStatic, sourceFile, getEtag);
			const rootIsStatic = !rootItem || rootItem.render === "static";
			const rootSourceFile = rootItem?.unstable_sourceFile;
			const rootGetEtag = rootItem?.unstable_getEtag;
			const buildRootElement = () => ({
				isStatic: rootIsStatic,
				renderer: renderRoot,
				...rootSourceFile ? { sourceFile: rootSourceFile } : {},
				...rootGetEtag ? { getEtagFromOption: () => rootGetEtag() } : {}
			});
			const buildRouteConfigBase = (routePath, pathSpec, layouts, elements, noSsr) => ({
				type: "route",
				path: pathSpec.filter((part) => !part.name?.startsWith("(")),
				isStatic: rootIsStatic && isAllElementsStatic(elements) && isAllSlicesStatic(routePath),
				rootElement: buildRootElement(),
				routeElement: {
					isStatic: true,
					renderer: buildRouteElement(layouts, routePath)
				},
				elements,
				noSsr,
				slices: sliceIdsByRoutePath.get(routePath)
			});
			const buildStaticRouteConfigs = () => Array.from(staticPageEntryByRoutePath, ([routePath, { concretePathSpec, pathPatternSpec, noSsr }]) => {
				const groupedRoutePath = groupedRoutePathByRoutePath.get(routePath) ?? routePath;
				const layouts = collectLayoutMatches(pathPatternSpec ?? concretePathSpec, groupedRoutePath);
				const pageEntry = staticComponentById.get(getStaticComponentId(routePath, "page"));
				const getPropsMapping = createPathPropsMapper(routePath);
				const elements = buildLayoutElements(layouts);
				elements[getPageSlotId(routePath)] = buildPageElement(pageEntry.component, getPropsMapping, true, pageEntry.sourceFile);
				return {
					...buildRouteConfigBase(routePath, concretePathSpec, layouts, elements, noSsr),
					...pathPatternSpec && { pathPattern: pathPatternSpec }
				};
			});
			const buildDynamicLikeRouteConfig = (routePath, { routePathSpec, component, noSsr, sourceFile, getEtag, searchCodec }) => {
				const layouts = collectLayoutMatches(routePathSpec);
				const getPropsMapping = createPathPropsMapper(routePath);
				const elements = buildLayoutElements(layouts);
				elements[getPageSlotId(routePath)] = buildPageElement(component, getPropsMapping, false, sourceFile, getEtag, searchCodec);
				return {
					...buildRouteConfigBase(routePath, routePathSpec, layouts, elements, noSsr),
					...searchCodec ? { searchCodec } : {}
				};
			};
			const buildDynamicRouteConfigs = () => Array.from(dynamicPageEntryByRoutePath, ([routePath, entry]) => buildDynamicLikeRouteConfig(routePath, entry));
			const buildWildcardRouteConfigs = () => Array.from(wildcardPageEntryByRoutePath, ([routePath, entry]) => buildDynamicLikeRouteConfig(routePath, entry));
			const buildApiConfigs = () => Array.from(apiEntryByRoutePath.values(), ({ routePathSpec, render, handlers, staticParams, sourceFile }) => ({
				type: "api",
				path: routePathSpec,
				isStatic: render === "static",
				handler: async (req, apiContext) => {
					const path = new URL(req.url).pathname;
					const method = req.method;
					const handler = handlers[method] ?? handlers.all;
					if (!handler) throw new Error("API method not found: " + method + "for path: " + path);
					return handler(req, staticParams ? { params: staticParams } : apiContext);
				},
				...sourceFile ? { sourceFile } : {}
			}));
			const buildSliceConfigs = () => Array.from(sliceEntryById, ([id, { isStatic, sourceFile, getEtag }]) => {
				const slicePathSpec = parsePathWithSlug(id);
				return {
					type: "slice",
					id,
					...slicePathSpec.some((s) => s.type !== "literal") ? { pathSpec: slicePathSpec } : {},
					isStatic,
					renderer: async (params) => {
						const slice = sliceEntryById.get(id);
						if (!slice) throw new Error("Slice not found: " + id);
						return /*#__PURE__*/ (0, import_react_react_server.createElement)(slice.component, params, /*#__PURE__*/ (0, import_jsx_runtime_react_server.jsx)(Children_UNSTABLE, {}));
					},
					...sourceFile ? { sourceFile } : {},
					...getEtag ? { getEtagFromParams: getEtag } : {}
				};
			});
			return [...[...[
				...buildStaticRouteConfigs(),
				...buildDynamicRouteConfigs(),
				...buildWildcardRouteConfigs()
			], ...buildApiConfigs()].sort((configA, configB) => routePriorityComparator(configA, configB)), ...buildSliceConfigs()];
		},
		...options?.unstable_skipBuild && { unstable_skipBuild: options.unstable_skipBuild },
		unstable_interceptors: interceptors
	});
};
function expandStaticRoutePath(routePathSpec, staticSegments) {
	const mapping = {};
	let slugIndex = 0;
	const pathItems = [];
	routePathSpec.forEach((spec) => {
		switch (spec.type) {
			case "literal":
				pathItems.push(spec.name);
				break;
			case "wildcard":
				mapping[spec.name] = staticSegments.slice(slugIndex);
				staticSegments.slice(slugIndex++).forEach((slug) => {
					pathItems.push(slug);
				});
				break;
			case "group": {
				const slug = staticSegments[slugIndex++];
				const prefix = spec.prefix ?? "";
				const suffix = spec.suffix ?? "";
				pathItems.push(`${prefix}${slug}${suffix}`);
				mapping[spec.name] = slug;
				break;
			}
		}
	});
	return {
		concretePath: "/" + pathItems.join("/"),
		pathItems,
		mapping
	};
}
//#endregion
export { ETAGS_HEADER as a, createCustomError as c, stringToStream as i, getErrorInfo as l, unstable_notFound as n, ETAG_ID_PREFIX as o, unstable_redirect as r, parseClientEtags as s, createPages as t };
