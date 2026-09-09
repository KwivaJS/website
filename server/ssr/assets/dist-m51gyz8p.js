import { i as __toESM } from "./rolldown-runtime-B4iAMlE-.js";
import { t as require_jsx_runtime } from "./jsx-runtime-BqLYtsoi.js";
import { t as require_react } from "./react-SLAb4Nsi.js";
import { A as createChangeEventDetails, I as imperativeAction, X as formatErrorMessage } from "./useTransitionStatus-CgpR1fP4.js";
import { n as createNullDialogStore } from "./DialogStore-S_4PlVMb.js";
//#region node_modules/@base-ui/react/utils/popups/popupHandle.mjs
/**
* Minimal store contract exposed by popup handles to detached triggers.
*
* Detached triggers read `store` during render and subscribe to be notified when the handle switches
* between its fallback store and a root's live store.
*
* @template HandleStore Store shape exposed to detached triggers.
*/
/**
* Store shape holding a trigger registry, required by `BasePopupHandle.openByTrigger` to resolve a
* trigger element by id on both the attached root's store and the fallback store.
*/
/**
* Store shape required by `BasePopupHandle.openByTrigger`/`closePopup` to drive open/close state.
* Only the root-owned `Store` needs this — the `HandleStore` view exposed to detached triggers may
* omit `setOpen` entirely (as Dialog and PreviewCard's do) since it is never called while detached.
*/
/**
* Shared implementation for popup handles that coordinate detached triggers with a mounted root.
*
* Subclasses provide the component-specific imperative methods, while this base class owns the
* fallback store, root store attachment stack, subscriber notifications, and development warning for
* overlapping roots.
*
* @template HandleStore Store shape exposed to detached triggers.
* @template Store Root-owned store attached by the component root.
*/
var BasePopupHandle = class {
	/**
	* Stores of every root currently using this handle, in attach order. A handle is meant to be used
	* by a single mounted root, but roots can transiently overlap (e.g. during an animated route
	* transition), so this stack lets `attachStore`'s cleanup restore the previous root instead of
	* leaving a still-mounted root uncontrollable when a newer overlapping root detaches first.
	*/
	attachedStores = [];
	/**
	* Store of the root that currently controls the handle: the most recently attached one still
	* mounted, or `null` when no root is attached. Imperative methods are no-ops while this is `null`.
	*/
	attachedStoreValue = null;
	/**
	* Listeners notified when `attachedStore` changes, so detached triggers can follow the store pointer.
	*/
	storeListeners = /* @__PURE__ */ new Set();
	/**
	* Creates a handle backed by the store used while no root is attached.
	*
	* @param fallbackStore Inert, closed store handed to detached triggers while no root is attached,
	* so they can render and register without a mounted root. Triggers register into whichever store
	* `store` currently resolves to, so while detached they live in this store's trigger map and
	* migrate themselves to the root's store (and back) as it attaches/detaches.
	* @param componentName Component name used to prefix dev warnings, e.g. `'Menu'` produces
	* `MenuHandle.open()` in warning text.
	* @param throwOnMissingTrigger Whether `open(triggerId)` throws when no trigger with that id is
	* registered. Anchored popups (Menu, Popover, Tooltip, PreviewCard) need a trigger to anchor to,
	* so they throw; Dialog is not anchored and instead opens unassociated with a dev warning.
	*/
	constructor(fallbackStore, componentName, throwOnMissingTrigger = true) {
		this.fallbackStore = fallbackStore;
		this.componentName = componentName;
		this.throwOnMissingTrigger = throwOnMissingTrigger;
	}
	get attachedStore() {
		return this.attachedStoreValue;
	}
	/**
	* Store that detached triggers read from: the attached root's store, or an inert fallback store
	* used while no root is attached.
	* @internal
	*/
	get store() {
		return this.attachedStoreValue ?? this.fallbackStore;
	}
	/**
	* Stable fallback store used for server rendering and hydration. Root stores cannot be recorded on
	* the handle during render because a handle can be shared by concurrent server-rendered requests.
	* @internal
	*/
	get serverStore() {
		return this.fallbackStore;
	}
	/**
	* Subscribes to changes of the attached store pointer so detached triggers re-render and re-bind
	* when a root attaches or detaches. Returns a function that removes the listener.
	* @internal
	*/
	subscribeStore(listener) {
		this.storeListeners.add(listener);
		return () => {
			this.storeListeners.delete(listener);
		};
	}
	/**
	* Points the handle at a root's store and notifies subscribers so detached triggers re-render and
	* re-register into it (their registration effect migrates them when the store pointer changes).
	* Returns a cleanup function that detaches the store again.
	* @internal
	*/
	attachStore(newStore) {
		this.attachedStores.push(newStore);
		this.setActiveStore(newStore);
		return () => {
			const index = this.attachedStores.lastIndexOf(newStore);
			if (index !== -1) this.attachedStores.splice(index, 1);
			this.setActiveStore(this.attachedStores[this.attachedStores.length - 1] ?? null);
		};
	}
	/**
	* Sets the store that currently controls the handle and notifies subscribers when it changes, so
	* detached triggers re-render and migrate their registration to the new store.
	*/
	setActiveStore(store) {
		if (this.attachedStoreValue !== store) {
			this.attachedStoreValue = store;
			this.storeListeners.forEach((listener) => {
				listener();
			});
		}
	}
	/**
	* Opens the attached root's store and associates it with the trigger with the given id, or a
	* no-op (with a dev warning) while no root is attached. Shared by every concrete handle's public
	* `open()` method, which only narrows the parameter type.
	*
	* When a trigger id is given but no matching trigger is registered, anchored popups throw (see
	* `throwOnMissingTrigger`); Dialog opens unassociated with a dev warning instead.
	*
	* This method should only be called in an event handler or an effect (not during rendering).
	*
	* @param triggerId ID of the trigger to associate with the popup, or `null`/`undefined` to open
	* without associating any trigger.
	*/
	openByTrigger(triggerId) {
		const attachedStore = this.attachedStore;
		if (attachedStore === null) return;
		let triggerElement;
		if (triggerId) {
			for (let i = this.attachedStores.length - 1; i >= 0 && !triggerElement; i -= 1) triggerElement = this.attachedStores[i].context.triggerElements.getById(triggerId);
			triggerElement ??= this.fallbackStore.context.triggerElements.getById(triggerId);
		}
		if (triggerId && !triggerElement) {
			if (this.throwOnMissingTrigger) throw new Error(formatErrorMessage(99, this.componentName, triggerId, this.componentName));
		}
		attachedStore.setOpen(true, createChangeEventDetails(imperativeAction, void 0, triggerElement));
	}
	/**
	* Closes the popup by setting the attached root's store to closed, or a no-op (with a dev warning)
	* while no root is attached. Shared by every concrete handle's public `close()` method.
	*
	* This method should only be called in an event handler or an effect (not during rendering).
	*/
	closePopup() {
		const attachedStore = this.attachedStore;
		if (attachedStore === null) return;
		attachedStore.setOpen(false, createChangeEventDetails(imperativeAction));
	}
};
//#endregion
//#region node_modules/@base-ui/react/dialog/store/DialogHandle.mjs
/**
* Controls a Dialog imperatively and associates detached `Dialog.Trigger` components with a
* `Dialog.Root`. Create one with `Dialog.createHandle()` and pass it to the `handle` prop of the
* root and of any triggers rendered outside of it.
*
* The imperative methods take effect only while a root using this handle is mounted; calls made
* before a root attaches (or after it unmounts) are ignored.
*/
var DialogHandle = class extends BasePopupHandle {
	constructor() {
		super(createNullDialogStore(), "Dialog", false);
	}
	/**
	* Opens the dialog, optionally associating it with a trigger.
	*
	* This method should only be called in an event handler or an effect (not during rendering).
	*
	* @param triggerId ID of the trigger to associate with the dialog. The trigger must be a matching
	* `Dialog.Trigger` with this handle passed as a prop. Pass `null` to open without associating any trigger.
	*/
	open(triggerId) {
		this.openByTrigger(triggerId);
	}
	/**
	* Opens the dialog with the given payload, without associating it with any trigger.
	*
	* This method should only be called in an event handler or an effect (not during rendering).
	*
	* @param payload Payload to set when opening the dialog. It is exposed to the root's render-prop children.
	*/
	openWithPayload(payload) {
		const attachedStore = this.attachedStore;
		if (attachedStore === null) return;
		attachedStore.set("payload", payload);
		attachedStore.setOpen(true, createChangeEventDetails(imperativeAction));
	}
	/**
	* Closes the dialog.
	*
	* This method should only be called in an event handler or an effect (not during rendering).
	*/
	close() {
		this.closePopup();
	}
	/**
	* Whether the dialog is currently open. Returns `false` while no root is attached to the handle.
	*/
	get isOpen() {
		return this.attachedStore?.select("open") ?? false;
	}
};
/**
* Creates a new handle to connect a Dialog.Root with detached Dialog.Trigger components.
*/
function createDialogHandle() {
	return new DialogHandle();
}
//#endregion
//#region node_modules/fumadocs-ui/dist/contexts/search.js
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime(), 1);
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/** built-in Base UI Dialog handle */
var dialogHandle = createDialogHandle();
var SearchContext = (0, import_react.createContext)({
	enabled: false,
	open: false,
	hotKey: [],
	setOpenSearch: () => void 0,
	dialogHandle
});
function useSearchContext() {
	return (0, import_react.use)(SearchContext);
}
function MetaOrControl() {
	const [key, setKey] = (0, import_react.useState)("⌘");
	(0, import_react.useEffect)(() => {
		if (/Windows|Linux/i.test(window.navigator.userAgent)) setKey("Ctrl");
	}, []);
	return key;
}
var DEFAULT_HOT_KEYS = [{
	key: (e) => e.metaKey || e.ctrlKey,
	display: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaOrControl, {})
}, {
	key: "k",
	display: "K"
}];
var DefaultSearchDialog = (0, import_react.lazy)(() => import("./search-default-CEXusbPW.js"));
function SearchProvider({ SearchDialog = DefaultSearchDialog, children, options, hotKey = DEFAULT_HOT_KEYS, links }) {
	const [isOpen, setIsOpen] = (0, import_react.useState)(false);
	const onKeyDown = (0, import_react.useEffectEvent)((e) => {
		if (hotKey.every((v) => typeof v.key === "string" ? e.key === v.key : v.key(e))) {
			setIsOpen((open) => !open);
			e.preventDefault();
		}
	});
	(0, import_react.useEffect)(() => {
		window.addEventListener("keydown", onKeyDown);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SearchContext, {
		value: (0, import_react.useMemo)(() => ({
			enabled: true,
			open: isOpen,
			hotKey,
			dialogHandle,
			setOpenSearch: setIsOpen
		}), [isOpen, hotKey]),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: null,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchDialog, {
				open: isOpen,
				onOpenChange: setIsOpen,
				links,
				dialogHandle,
				...options
			})
		}), children]
	});
}
//#endregion
//#region node_modules/next-themes/dist/index.mjs
var M = (e, i, s, u, m, a, l, h) => {
	let d = document.documentElement, w = ["light", "dark"];
	function p(n) {
		(Array.isArray(e) ? e : [e]).forEach((y) => {
			let k = y === "class", S = k && a ? m.map((f) => a[f] || f) : m;
			k ? (d.classList.remove(...S), d.classList.add(a && a[n] ? a[n] : n)) : d.setAttribute(y, n);
		}), R(n);
	}
	function R(n) {
		h && w.includes(n) && (d.style.colorScheme = n);
	}
	function c() {
		return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
	}
	if (u) p(u);
	else try {
		let n = localStorage.getItem(i) || s;
		p(l && n === "system" ? c() : n);
	} catch (n) {}
};
var b = ["light", "dark"];
var I = "(prefers-color-scheme: dark)";
var O = typeof window == "undefined";
var x = import_react.createContext(void 0);
var U = {
	setTheme: (e) => {},
	themes: []
};
var z = () => {
	var e;
	return (e = import_react.useContext(x)) != null ? e : U;
};
var J = (e) => import_react.useContext(x) ? import_react.createElement(import_react.Fragment, null, e.children) : import_react.createElement(V, { ...e });
var N = ["light", "dark"];
var V = ({ forcedTheme: e, disableTransitionOnChange: i = !1, enableSystem: s = !0, enableColorScheme: u = !0, storageKey: m = "theme", themes: a = N, defaultTheme: l = s ? "system" : "light", attribute: h = "data-theme", value: d, children: w, nonce: p, scriptProps: R }) => {
	let [c, n] = import_react.useState(() => H(m, l)), [T, y] = import_react.useState(() => c === "system" ? E() : c), k = d ? Object.values(d) : a, S = import_react.useCallback((o) => {
		let r = o;
		if (!r) return;
		o === "system" && s && (r = E());
		let v = d ? d[r] : r, C = i ? W(p) : null, P = document.documentElement, L = (g) => {
			g === "class" ? (P.classList.remove(...k), v && P.classList.add(v)) : g.startsWith("data-") && (v ? P.setAttribute(g, v) : P.removeAttribute(g));
		};
		if (Array.isArray(h) ? h.forEach(L) : L(h), u) {
			let g = b.includes(l) ? l : null, D = b.includes(r) ? r : g;
			P.style.colorScheme = D;
		}
		C?.();
	}, [p]), f = import_react.useCallback((o) => {
		let r = typeof o == "function" ? o(c) : o;
		n(r);
		try {
			localStorage.setItem(m, r);
		} catch (v) {}
	}, [c]), A = import_react.useCallback((o) => {
		let r = E(o);
		y(r), c === "system" && s && !e && S("system");
	}, [c, e]);
	import_react.useEffect(() => {
		let o = window.matchMedia(I);
		return o.addListener(A), A(o), () => o.removeListener(A);
	}, [A]), import_react.useEffect(() => {
		let o = (r) => {
			r.key === m && (r.newValue ? n(r.newValue) : f(l));
		};
		return window.addEventListener("storage", o), () => window.removeEventListener("storage", o);
	}, [f]), import_react.useEffect(() => {
		S(e != null ? e : c);
	}, [e, c]);
	let Q = import_react.useMemo(() => ({
		theme: c,
		setTheme: f,
		forcedTheme: e,
		resolvedTheme: c === "system" ? T : c,
		themes: s ? [...a, "system"] : a,
		systemTheme: s ? T : void 0
	}), [
		c,
		f,
		e,
		T,
		s,
		a
	]);
	return import_react.createElement(x.Provider, { value: Q }, import_react.createElement(_, {
		forcedTheme: e,
		storageKey: m,
		attribute: h,
		enableSystem: s,
		enableColorScheme: u,
		defaultTheme: l,
		value: d,
		themes: a,
		nonce: p,
		scriptProps: R
	}), w);
};
var _ = import_react.memo(({ forcedTheme: e, storageKey: i, attribute: s, enableSystem: u, enableColorScheme: m, defaultTheme: a, value: l, themes: h, nonce: d, scriptProps: w }) => {
	let p = JSON.stringify([
		s,
		i,
		a,
		e,
		h,
		l,
		u,
		m
	]).slice(1, -1);
	return import_react.createElement("script", {
		...w,
		suppressHydrationWarning: !0,
		nonce: typeof window == "undefined" ? d : "",
		dangerouslySetInnerHTML: { __html: `(${M.toString()})(${p})` }
	});
});
var H = (e, i) => {
	if (O) return;
	let s;
	try {
		s = localStorage.getItem(e) || void 0;
	} catch (u) {}
	return s || i;
};
var W = (e) => {
	let i = document.createElement("style");
	return e && i.setAttribute("nonce", e), i.appendChild(document.createTextNode("*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}")), document.head.appendChild(i), () => {
		window.getComputedStyle(document.body), setTimeout(() => {
			document.head.removeChild(i);
		}, 1);
	};
};
var E = (e) => (e || (e = window.matchMedia(I)), e.matches ? "dark" : "light");
//#endregion
export { DialogHandle as a, useSearchContext as i, z as n, SearchProvider as r, J as t };
