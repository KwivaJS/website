import { i as __toESM } from "./rolldown-runtime-B4iAMlE-.js";
import { t as require_jsx_runtime } from "./jsx-runtime-BqLYtsoi.js";
import { t as require_react } from "./react-SLAb4Nsi.js";
import { n as Slot_UNSTABLE, r as require_react_dom } from "../index.js";
//#region node_modules/waku/dist/lib/utils/path.js
function removeBase(url, base) {
	if (base !== "/") {
		if (!url.startsWith(base)) throw new Error("pathname must start with basePath: " + url);
		return url.slice(base.length - 1);
	}
	return url;
}
function addBase(url, base) {
	if (base !== "/" && url.startsWith("/")) return base.slice(0, -1) + url;
	return url;
}
//#endregion
//#region node_modules/waku/dist/router/isomorphic-utils/route-path.js
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime(), 1);
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom(), 1);
function pathnameToRoutePath(pathname) {
	if (!pathname.startsWith("/")) throw new Error("Pathname must start with `/`: " + pathname);
	if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);
	if (pathname.endsWith("/index.html")) pathname = pathname.slice(0, -11) || "/";
	if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);
	return pathname || "/";
}
var ROUTE_SLOT_ID_PREFIX = "route:";
var getRouteSlotId = (path) => ROUTE_SLOT_ID_PREFIX + path;
//#endregion
//#region node_modules/waku/dist/router/client-utils/route-url.js
var pathnameToCurrentRoutePath = (pathname) => pathnameToRoutePath(removeBase(pathname, "/"));
var parseRoute = (url) => {
	const { pathname, searchParams, hash } = url;
	return {
		path: pathnameToCurrentRoutePath(pathname),
		query: searchParams.toString(),
		hash
	};
};
var isSameRscRoute = (next, prev) => next.path === prev.path && next.query === prev.query;
//#endregion
//#region node_modules/waku/dist/router/client-utils/scroll.js
var decodeHash = (raw) => raw.replace(/(?:%[0-9A-Fa-f]{2})+/g, (escapes) => {
	try {
		return decodeURIComponent(escapes);
	} catch {
		return escapes;
	}
});
var getHashElement = (hash) => {
	const raw = hash.slice(1);
	const decoded = decodeHash(raw);
	for (const name of /* @__PURE__ */ new Set([raw, decoded])) {
		const byId = document.getElementById(name);
		if (byId) return byId;
		for (const named of document.getElementsByName(name)) if (named.localName === "a") return named;
	}
	return decoded.toLowerCase() === "top" ? document.documentElement : null;
};
var scrollToHash = (hash, behavior, scrollTopForMissingHash) => {
	if (hash) {
		const element = getHashElement(hash);
		if (!element) {
			if (!scrollTopForMissingHash) return;
			window.scrollTo({
				left: 0,
				top: 0,
				behavior
			});
			return;
		}
		const scrollMarginTop = Number.parseFloat(window.getComputedStyle(element).scrollMarginTop) || 0;
		window.scrollTo({
			left: 0,
			top: element.getBoundingClientRect().top + window.scrollY - scrollMarginTop,
			behavior
		});
		return;
	}
	window.scrollTo({
		left: 0,
		top: 0,
		behavior
	});
};
var shouldScrollByDefault = (url) => pathnameToCurrentRoutePath(url.pathname) !== pathnameToCurrentRoutePath(window.location.pathname) || url.hash !== window.location.hash;
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
//#region node_modules/waku/dist/router/isomorphic-utils/search-codec-registry.js
/**
* Resolve a route path to its search codec id, using the `route -> codec id`
* map that define-router ships as `globalThis.__WAKU_ROUTER_SEARCH_CODECS__`.
* Lets `push`/`Link` serialize `search` for any route, not just the current one.
*/ var getRouteSearchCodecId = (routePath) => {
	return globalThis.__WAKU_ROUTER_SEARCH_CODECS__?.[routePath];
};
//#endregion
//#region node_modules/waku/dist/router/client.js
var isAltClick = (event) => event.button !== 0 || !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
var RouterContext = /*#__PURE__*/ (0, import_react.createContext)(null);
var SearchCodecsContext = /*#__PURE__*/ (0, import_react.createContext)(/* @__PURE__ */ new Map());
var useResolveSearchCodec = () => {
	const codecs = (0, import_react.useContext)(SearchCodecsContext);
	return (0, import_react.useCallback)((routePath) => {
		const id = getRouteSearchCodecId(routePath);
		return id !== void 0 ? codecs.get(id) : void 0;
	}, [codecs]);
};
var dispatchChangeRoute = (changeRoute, route, options, startTransitionFn = import_react.startTransition) => {
	if (options.instant && !options.startTransition) return changeRoute(route, {
		...options,
		pendingTransition: startTransitionFn
	});
	if (options.startTransition) return changeRoute(route, options);
	return new Promise((resolve, reject) => {
		startTransitionFn(async () => {
			try {
				await changeRoute(route, options);
				resolve();
			} catch (e) {
				reject(e);
			}
		});
	});
};
var useRouterOrThrow = () => {
	const router = (0, import_react.useContext)(RouterContext);
	if (!router) throw new Error("Missing Router");
	return router;
};
var resolveRouteHref = (to, resolveCodec) => addBase(typeof to === "string" ? to : buildRouteHref(to, resolveCodec), "/");
/**
* Current route fields plus navigation helpers (`push`, `replace`, `reload`,
* `back`, `forward`, `prefetch`).
*
* `push` / `replace` settle as described on their return type: handled
* navigation, not paint-finished. `reload` refetches the current location.
* `prefetch` warms a route for a later navigation or reload; `<Link>`
* prefetching is automatic and skips the route already on screen.
*/ function useRouter() {
	const { route, changeRoute, prefetchRoute } = useRouterOrThrow();
	const resolveCodec = useResolveSearchCodec();
	const navigate = (0, import_react.useCallback)((history, to, options) => {
		const url = new URL(resolveRouteHref(to, resolveCodec), window.location.href);
		return dispatchChangeRoute(changeRoute, parseRoute(url), {
			shouldScroll: options?.scroll ?? shouldScrollByDefault(url),
			history,
			url,
			instant: options?.unstable_instant
		});
	}, [changeRoute, resolveCodec]);
	const push = (0, import_react.useCallback)((to, options) => navigate("push", to, options), [navigate]);
	const replace = (0, import_react.useCallback)((to, options) => navigate("replace", to, options), [navigate]);
	const reload = (0, import_react.useCallback)(async () => {
		const url = new URL(window.location.href);
		await dispatchChangeRoute(changeRoute, parseRoute(url), {
			shouldScroll: true,
			refetch: true,
			history: "replace",
			url
		});
	}, [changeRoute]);
	const back = (0, import_react.useCallback)(() => {
		window.history.back();
	}, []);
	const forward = (0, import_react.useCallback)(() => {
		window.history.forward();
	}, []);
	const prefetch = (0, import_react.useCallback)((to, options) => {
		const url = new URL(resolveRouteHref(to, resolveCodec), window.location.href);
		prefetchRoute(parseRoute(url), options);
	}, [prefetchRoute, resolveCodec]);
	return {
		...route,
		push,
		replace,
		reload,
		back,
		forward,
		prefetch
	};
}
var assignRef = (ref, node) => {
	ref.current = node;
};
function useSharedRef(ref) {
	const managedRef = (0, import_react.useRef)(null);
	return [managedRef, (0, import_react.useCallback)((node) => {
		assignRef(managedRef, node);
		if (typeof ref === "function") {
			const cleanup = ref(node);
			return () => {
				assignRef(managedRef, null);
				if (cleanup) cleanup();
				else ref(null);
			};
		}
		if (ref) assignRef(ref, node);
		return () => {
			assignRef(managedRef, null);
			if (ref) assignRef(ref, null);
		};
	}, [ref])];
}
var prefetchIfNotCurrent = (router, resolvedTo, options) => {
	if (!router) return;
	const route = parseRoute(new URL(resolvedTo, window.location.href));
	if (!isSameRscRoute(route, router.route)) router.prefetchRoute(route, options);
};
var usePrefetchOnView = (ref, router, resolvedTo, options) => {
	const enabled = !!options;
	const mode = options?.mode;
	const ttl = options?.ttl;
	(0, import_react.useEffect)(() => {
		if (!enabled || !ref.current) return;
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) prefetchIfNotCurrent(router, resolvedTo, {
					...mode ? { mode } : {},
					...ttl !== void 0 ? { ttl } : {}
				});
			});
		}, { threshold: .1 });
		observer.observe(ref.current);
		return () => {
			observer.disconnect();
		};
	}, [
		enabled,
		mode,
		ttl,
		router,
		resolvedTo,
		ref
	]);
};
var NavigationStatusContext = /*#__PURE__*/ (0, import_react.createContext)({});
/**
* Client-side navigation link. Renders an `<a>`; click handling pushes through
* the router unless the click is modified or prevented. A non-`_self` `target`
* is discouraged and still routes in place (use `<a>` instead). Failures
* surface through the router error boundary rather than a returned promise.
*/ function Link({ to, children, scroll, unstable_instant, unstable_prefetchOnEnter, unstable_prefetchOnView, unstable_startTransition, ref: refProp, ...props }) {
	const resolvedTo = resolveRouteHref(to, useResolveSearchCodec());
	const router = (0, import_react.useContext)(RouterContext);
	const changeRoute = router ? router.changeRoute : () => {
		throw new Error("Missing Router");
	};
	const [isPending, startTransition] = (0, import_react.useTransition)();
	const [ref, setRef] = useSharedRef(refProp);
	usePrefetchOnView(ref, router, resolvedTo, unstable_prefetchOnView);
	const internalOnClick = () => {
		const url = new URL(resolvedTo, window.location.href);
		if (url.href !== window.location.href) {
			const route = parseRoute(url);
			preloadRouteModules(route.path);
			dispatchChangeRoute(changeRoute, route, {
				shouldScroll: scroll ?? shouldScrollByDefault(url),
				history: "push",
				url,
				instant: unstable_instant,
				startTransition: unstable_startTransition
			}, startTransition).catch(() => {});
		} else if (url.hash && scroll !== false) scrollToHash(url.hash, "auto", false);
	};
	const onClick = (event) => {
		props.onClick?.(event);
		if (event.defaultPrevented || isAltClick(event)) return;
		if (props.target && props.target.toLowerCase() !== "_self") console.warn("[Link] `target` is discouraged. Use `<a>` for this case.");
		if (props.download !== void 0 && props.download !== null && props.download !== false) console.warn("[Link] `download` is discouraged. Use `<a>` for this case.");
		event.preventDefault();
		internalOnClick();
	};
	const onMouseEnter = unstable_prefetchOnEnter ? (event) => {
		prefetchIfNotCurrent(router, resolvedTo, unstable_prefetchOnEnter);
		props.onMouseEnter?.(event);
	} : props.onMouseEnter;
	const navigationStatus = (0, import_react.useMemo)(() => ({ pending: isPending }), [isPending]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(NavigationStatusContext, {
		value: navigationStatus,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)("a", {
			...props,
			href: resolvedTo,
			onClick,
			onMouseEnter,
			ref: setRef,
			children
		})
	});
}
var notAvailableInServer = (name) => () => {
	throw new Error(`${name} is not in the server`);
};
function renderError(message) {
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)("html", { children: [/*#__PURE__*/ (0, import_jsx_runtime.jsx)("head", { children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)("title", { children: "Unhandled Error" }) }), /*#__PURE__*/ (0, import_jsx_runtime.jsxs)("body", {
		style: {
			height: "100vh",
			display: "flex",
			flexDirection: "column",
			placeContent: "center",
			placeItems: "center",
			fontSize: "16px",
			margin: 0
		},
		children: [/*#__PURE__*/ (0, import_jsx_runtime.jsx)("h1", { children: "Caught an unexpected error" }), /*#__PURE__*/ (0, import_jsx_runtime.jsxs)("p", { children: ["Error: ", message] })]
	})] });
}
/**
* Catches errors from its children and shows a fallback page. Used by the
* default root layout; apps can wrap their own root with it too.
*/ var ErrorBoundary = class extends import_react.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	static getDerivedStateFromError(error) {
		return { error };
	}
	render() {
		if ("error" in this.state) {
			if (this.state.error instanceof Error) return renderError(this.state.error.message);
			return renderError(String(this.state.error));
		}
		return this.props.children;
	}
};
var preloadRouteModules = (path) => {
	globalThis.__WAKU_ROUTER_PREFETCH__?.(path, (id) => {
		(0, import_react_dom.preloadModule)(id, { as: "script" });
	});
};
function INTERNAL_ServerRouter({ route }) {
	const routeElement = /*#__PURE__*/ (0, import_jsx_runtime.jsx)(Slot_UNSTABLE, { id: getRouteSlotId(route.path) });
	const rootElement = /*#__PURE__*/ (0, import_jsx_runtime.jsx)(Slot_UNSTABLE, {
		id: "root",
		children: routeElement
	});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(RouterContext, {
		value: {
			route,
			changeRoute: notAvailableInServer("changeRoute"),
			prefetchRoute: notAvailableInServer("prefetchRoute"),
			fetchingSlices: /* @__PURE__ */ new Map(),
			lazySliceIds: /* @__PURE__ */ new Set()
		},
		children: rootElement
	}) });
}
//#endregion
export { useRouter as i, INTERNAL_ServerRouter as n, Link as r, ErrorBoundary as t };
