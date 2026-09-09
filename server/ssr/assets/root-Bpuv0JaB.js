import { i as __toESM } from "./rolldown-runtime-B4iAMlE-.js";
import { t as require_jsx_runtime } from "./jsx-runtime-BqLYtsoi.js";
import { t as require_react } from "./react-SLAb4Nsi.js";
import { r as require_react_dom } from "../index.js";
import { t as DirectionContext } from "./DirectionContext-CCPO2bjM.js";
import { t as FrameworkProvider } from "./framework-BVFfi5Qn.js";
import { t as I18nProvider } from "./i18n-BUDVpFLw.js";
import { n as z, r as SearchProvider, t as J } from "./dist-m51gyz8p.js";
import { n as useRouter, t as Link$1 } from "./link-BAuMaYNz.js";
import { t as Image } from "./image-BeIQyUMe.js";
//#region node_modules/@base-ui/react/direction-provider/DirectionProvider.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime(), 1);
var DirectionProvider = function DirectionProvider(props) {
	const { direction = "ltr" } = props;
	const contextValue = import_react.useMemo(() => ({ direction }), [direction]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(DirectionContext.Provider, {
		value: contextValue,
		children: props.children
	});
};
//#endregion
//#region node_modules/fumadocs-ui/dist/provider/base.js
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom(), 1);
/**
* Whether the event should be ignored because the user is interacting with an editable element,
* or an opened dialog (e.g. the search dialog).
*/
function isTypingTarget(target) {
	if (!(target instanceof HTMLElement)) return false;
	if (target.isContentEditable) return true;
	if ([
		"INPUT",
		"TEXTAREA",
		"SELECT"
	].includes(target.tagName)) return true;
	return target.closest("[role=\"dialog\"]") !== null;
}
/**
* Toggle between light/dark mode with a hotkey, must be placed under `next-themes` provider.
*/
function ThemeHotKey({ hotKey }) {
	const { setTheme, resolvedTheme } = z();
	const onKeyDown = (0, import_react.useEffectEvent)((e) => {
		if (e.defaultPrevented || e.isComposing || e.keyCode === 229) return;
		if (isTypingTarget(e.target)) return;
		if (!(typeof hotKey === "string" ? !e.metaKey && !e.ctrlKey && !e.altKey && e.key.toLowerCase() === hotKey.toLowerCase() : hotKey(e))) return;
		e.preventDefault();
		const next = resolvedTheme === "dark" ? "light" : "dark";
		if (document?.startViewTransition) document.startViewTransition(() => (0, import_react_dom.flushSync)(() => setTheme(next)));
		else setTheme(next);
	});
	(0, import_react.useEffect)(() => {
		window.addEventListener("keydown", onKeyDown);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
		};
	}, []);
	return null;
}
function RootProvider({ children, dir = "ltr", theme = {}, search, i18n }) {
	let body = children;
	if (search?.enabled !== false) body = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchProvider, {
		...search,
		children: body
	});
	if (theme?.enabled !== false) {
		const { enabled: _, hotKey = "d", ...themeProps } = theme;
		body = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(J, {
			attribute: "class",
			defaultTheme: "system",
			enableSystem: true,
			disableTransitionOnChange: true,
			...themeProps,
			children: [hotKey !== false && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeHotKey, { hotKey }), body]
		});
	}
	if (i18n) body = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(I18nProvider, {
		...i18n,
		children: body
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DirectionProvider, {
		direction: dir,
		children: body
	});
}
//#endregion
//#region node_modules/fumapress/dist/components/provider.js
var framework = {
	useParams() {
		console.warn("[Fumadocs] useParams() is not supported on Fumapress");
		return (0, import_react.useMemo)(() => ({}), []);
	},
	usePathname() {
		return useRouter().path;
	},
	useRouter() {
		const router = useRouter();
		return (0, import_react.useMemo)(() => ({
			push: router.push.bind(router),
			refresh: router.reload.bind(router)
		}), [router]);
	},
	Image: ({ priority, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
		fetchPriority: priority ? "high" : void 0,
		loading: priority ? "eager" : void 0,
		...props
	}),
	Link: ({ prefetch = true, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
		unstable_prefetchOnEnter: prefetch,
		...props
	})
};
function PressProvider(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FrameworkProvider, {
		...framework,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RootProvider, { ...props })
	});
}
//#endregion
//#region \0virtual:vite-rsc/client-references/group/facade:node_modules/fumapress/dist/layouts/root.js
var export_79245c25971e = { PressProvider };
//#endregion
export { export_79245c25971e };
