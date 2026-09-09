import { i as __toESM } from "./rolldown-runtime-B4iAMlE-.js";
import { t as require_jsx_runtime } from "./jsx-runtime-BqLYtsoi.js";
import { t as require_react } from "./react-SLAb4Nsi.js";
import { r as require_react_dom } from "../index.js";
import { n as cva, r as cn, t as buttonVariants } from "./button-Cpca6tPg.js";
import { t as useControlled } from "./useControlled-B0XDiIsy.js";
import { $ as useIsoLayoutEffect, A as createChangeEventDetails, C as isLastTraversableNode, M as closeWatcher, S as isHTMLElement, U as swipe, X as formatErrorMessage, Z as useStableCallback, c as endingStyle$2, d as getComputedStyle$1, j as closePress, n as useOpenChangeComplete, o as useAnimationFrame, q as EMPTY_OBJECT, v as getParentNode, x as isElement, y as getWindow } from "./useTransitionStatus-CgpR1fP4.js";
import { a as mergeProps, r as useRenderElement } from "./stateAttributesMapping-B8mynGFP.js";
import { c as X, l as MessageCircle } from "./heading-DwO5t_zs.js";
import { b as getTarget, o as COMPOSITE_KEYS, v as activeElement, x as ownerDocument, y as contains } from "./search-moGbV3Yd.js";
import { t as useButton } from "./useButton-CmgotloM.js";
import { P as android, o as FOCUSABLE_POPUP_PROPS } from "./DialogStore-S_4PlVMb.js";
import { A as popupTransitionStateMapping, c as BASE_UI_SWIPE_IGNORE_SELECTOR, n as useDialogRootContext, o as FloatingFocusManager } from "./DialogRootContext-DTwNcHms.js";
import { a as useTabsGroups, d as ChevronsUpDown, f as ChevronDown, i as TreeContextProvider, l as PanelLeft, n as ScrollViewport, o as useTreeContext, r as clamp, s as useTreePath, t as ScrollArea, u as Languages } from "./scroll-area-DW5uZXgq.js";
import { a as isLinkItemActive, d as PopoverContent, f as PopoverTrigger, i as isLayoutTabActive, l as DialogTrigger, n as baseSlots, o as useLinkItems, r as getLayoutTabs, u as Popover } from "./client-BU1Fmnr9.js";
import { c as useTranslations, i as usePathname } from "./framework-BVFfi5Qn.js";
import { t as Link } from "./link-BUqPnhxi.js";
import { t as useOnChange } from "./use-on-change-CnLJrKl4.js";
import { n as addEventListener } from "./useValueAsRef-BtxEwGNw.js";
import { a as DialogHandle } from "./dist-m51gyz8p.js";
import { a as useDialogPortalContext, i as dialogStateAttributesMapping, n as useRenderDialogRoot, r as DialogPortal, t as DialogTitle } from "./DialogTitle-CoXyJ62v.js";
import { n as CollapsibleContent, r as CollapsibleTrigger, t as Collapsible } from "./collapsible-BTQIwl1c.js";
//#region node_modules/@base-ui/react/utils/getElementTransform.mjs
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime(), 1);
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom(), 1);
/**
* Extracts the 2D translation and scale from the element's computed `transform` matrix.
* Note that the `translate`, `rotate`, and `scale` longhands are separate properties and
* are not reflected in the computed `transform` value.
*
* Pass `computedStyle` when the caller has already resolved it to avoid a second lookup.
*/
function getElementTransform(element, computedStyle) {
	const transform = (computedStyle ?? getWindow(element).getComputedStyle(element)).transform;
	let translateX = 0;
	let translateY = 0;
	let scale = 1;
	if (transform && transform !== "none") {
		const matrix = transform.match(/matrix(?:3d)?\(([^)]+)\)/);
		if (matrix) {
			const values = matrix[1].split(", ").map(parseFloat);
			if (values.length === 6) {
				translateX = values[4];
				translateY = values[5];
				scale = Math.sqrt(values[0] * values[0] + values[1] * values[1]);
			} else if (values.length === 16) {
				translateX = values[12];
				translateY = values[13];
				scale = values[0];
			}
		}
	}
	return {
		x: translateX,
		y: translateY,
		scale
	};
}
//#endregion
//#region node_modules/@base-ui/react/dialog/close/DialogClose.mjs
/**
* A button that closes the dialog.
* Renders a `<button>` element.
*
* Documentation: [Base UI Dialog](https://base-ui.com/react/components/dialog)
*/
var DialogClose = /*#__PURE__*/ import_react.forwardRef(function DialogClose(componentProps, forwardedRef) {
	const { render, className, style, disabled = false, nativeButton = true, ...elementProps } = componentProps;
	const store = useDialogRootContext();
	const open = store.useState("open");
	const { getButtonProps, buttonRef } = useButton({
		disabled,
		native: nativeButton
	});
	const state = { disabled };
	function handleClick(event) {
		if (open) store.setOpen(false, createChangeEventDetails(closePress, event.nativeEvent));
	}
	return useRenderElement("button", componentProps, {
		state,
		ref: [forwardedRef, buttonRef],
		props: [
			{ onClick: handleClick },
			elementProps,
			getButtonProps
		]
	});
});
//#endregion
//#region node_modules/@base-ui/react/dialog/viewport/DialogViewport.mjs
/**
* A positioning container for the dialog popup that can be made scrollable.
* Renders a `<div>` element.
*
* Documentation: [Base UI Dialog](https://base-ui.com/react/components/dialog)
*/
var DialogViewport = /*#__PURE__*/ import_react.forwardRef(function DialogViewport(componentProps, forwardedRef) {
	const { render, className, style, children, ...elementProps } = componentProps;
	const keepMounted = useDialogPortalContext();
	const store = useDialogRootContext();
	const open = store.useState("open");
	const nested = store.useState("nested");
	const transitionStatus = store.useState("transitionStatus");
	const nestedOpenDialogCount = store.useState("nestedOpenDialogCount");
	const mounted = store.useState("mounted");
	const setViewportElement = store.useStateSetter("viewportElement");
	return useRenderElement("div", componentProps, {
		enabled: keepMounted || mounted,
		state: {
			open,
			nested,
			transitionStatus,
			nestedDialogOpen: nestedOpenDialogCount > 0
		},
		ref: [forwardedRef, setViewportElement],
		stateAttributesMapping: dialogStateAttributesMapping,
		props: [{
			role: "presentation",
			hidden: !mounted,
			style: { pointerEvents: !open ? "none" : void 0 },
			children
		}, elementProps]
	});
});
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/glass/layout-tabs.js
function LayoutTabsDropdown({ tabs: allTabs, className, size = "default", ...props }) {
	const path = useTreePath();
	const pathname = usePathname();
	const t = useTranslations();
	const tabs = useTabsGroups(allTabs).findLast((group) => typeof group.active?.root !== "string")?.options ?? [];
	const selected = tabs.findLast((t) => isLayoutTabActive(t, path, pathname));
	const [open, setOpen] = (0, import_react.useState)(false);
	if (tabs.length === 0) return;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverTrigger, {
			className: cn("inline-flex items-center gap-2 text-sm font-medium rounded-full transition-colors hover:bg-fd-accent data-popup-open:bg-fd-accent", size === "lg" && "text-[0.9375rem]", className),
			...props,
			children: [selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [selected.icon, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate",
				children: selected.title
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-fd-muted-foreground truncate",
				children: t("Layout Tab", { note: "layout tab trigger" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsUpDown, { className: cn("ms-auto shrink-0 text-fd-muted-foreground", size === "default" && "size-3.5!", size === "lg" && "size-4!") })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
			className: "flex flex-col p-1 rounded-xl",
			align: "start",
			children: tabs.map((t, i) => {
				if (t.unlisted && t !== selected) return;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					href: t.url,
					className: cn("text-sm px-2 py-1.5 rounded-lg", selected === t ? "bg-fd-primary/10 text-fd-primary" : "hover:bg-fd-accent hover:text-fd-accent-foreground"),
					onClick: () => setOpen(false),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "font-medium inline-flex items-center gap-2 [&_svg]:size-4",
						children: [t.icon, t.title]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("mt-1 text-xs text-fd-muted-foreground empty:hidden", selected === t && "text-fd-primary/80"),
						children: t.description
					})]
				}, i);
			})
		})]
	});
}
//#endregion
//#region node_modules/@base-ui/react/drawer/popup/DrawerPopupCssVars.mjs
/**
* The number of nested drawers that are currently open.
* @type {number}
*/
var nestedDrawers = "--nested-drawers";
/**
* The height of the drawer popup.
* @type {CSS length}
*/
var height = "--drawer-height";
/**
* The height of the frontmost open drawer in the current nested drawer stack.
* @type {CSS length}
*/
var frontmostHeight = "--drawer-frontmost-height";
/**
* The swipe movement on the X axis.
* @type {CSS length}
*/
var swipeMovementX = "--drawer-swipe-movement-x";
/**
* The swipe movement on the Y axis.
* @type {CSS length}
*/
var swipeMovementY = "--drawer-swipe-movement-y";
/**
* The snap point offset used for translating the drawer.
* @type {CSS length}
*/
var snapPointOffset = "--drawer-snap-point-offset";
/**
* A scalar (0.1-1) used to scale the swipe release transition duration in CSS.
* @type {number}
*/
var swipeStrength = "--drawer-swipe-strength";
//#endregion
//#region node_modules/@base-ui/react/drawer/backdrop/DrawerBackdropCssVars.mjs
/**
* The swipe progress of the drawer gesture.
* @type {number}
*/
var swipeProgress = "--drawer-swipe-progress";
//#endregion
//#region node_modules/@base-ui/react/drawer/backdrop/DrawerBackdrop.mjs
/**
* An overlay displayed beneath the popup.
* Renders a `<div>` element.
*
* Documentation: [Base UI Drawer](https://base-ui.com/react/components/drawer)
*/
var DrawerBackdrop = /*#__PURE__*/ import_react.forwardRef(function DrawerBackdrop(componentProps, forwardedRef) {
	const { render, className, style, forceRender = false, ...elementProps } = componentProps;
	const store = useDialogRootContext();
	const open = store.useState("open");
	const nested = store.useState("nested");
	const mounted = store.useState("mounted");
	const state = {
		open,
		transitionStatus: store.useState("transitionStatus")
	};
	return useRenderElement("div", componentProps, {
		state,
		ref: [store.context.backdropRef, forwardedRef],
		stateAttributesMapping: popupTransitionStateMapping,
		props: [{
			role: "presentation",
			hidden: !mounted,
			style: {
				pointerEvents: !open ? "none" : void 0,
				userSelect: "none",
				WebkitUserSelect: "none",
				[swipeProgress]: "0",
				[swipeStrength]: "1"
			}
		}, elementProps],
		enabled: forceRender || !nested
	});
});
//#endregion
//#region node_modules/@base-ui/react/drawer/close/DrawerClose.mjs
/**
* A button that closes the drawer.
* Renders a `<button>` element.
*
* Documentation: [Base UI Drawer](https://base-ui.com/react/components/drawer)
*/
var DrawerClose = DialogClose;
//#endregion
//#region node_modules/@base-ui/react/drawer/content/drawerContentAttribute.mjs
var DRAWER_CONTENT_ATTRIBUTE = "data-drawer-content";
//#endregion
//#region node_modules/@base-ui/react/drawer/content/DrawerContent.mjs
/**
* A container for the drawer contents.
* Renders a `<div>` element.
*
* Documentation: [Base UI Drawer](https://base-ui.com/react/components/drawer)
*/
var DrawerContent = /*#__PURE__*/ import_react.forwardRef(function DrawerContent(componentProps, forwardedRef) {
	const { render, className, style, ...elementProps } = componentProps;
	useDialogRootContext();
	return useRenderElement("div", componentProps, {
		ref: forwardedRef,
		props: [{ [DRAWER_CONTENT_ATTRIBUTE]: "" }, elementProps]
	});
});
//#endregion
//#region node_modules/@base-ui/react/drawer/provider/DrawerProviderContext.mjs
var DrawerProviderContext = /*#__PURE__*/ import_react.createContext(void 0);
function useDrawerProviderContext() {
	return import_react.useContext(DrawerProviderContext);
}
/**
* Present when the drawer is at the expanded (full-height) snap point.
*/
var expanded = "data-expanded";
/**
* Present when a nested drawer is open.
*/
var nestedDrawerOpen = "data-nested-drawer-open";
/**
* Present when a nested drawer is being swiped.
*/
var nestedDrawerSwiping = "data-nested-drawer-swiping";
/**
* Present when the drawer is dismissed by swiping.
*/
var swipeDismiss = "data-swipe-dismiss";
/**
* Indicates the swipe direction.
* @type {'up' | 'down' | 'left' | 'right'}
*/
var swipeDirection = "data-swipe-direction";
/**
* Present when the drawer is being swiped.
*/
var swiping = "data-swiping";
//#endregion
//#region node_modules/@base-ui/react/drawer/root/DrawerRootContext.mjs
var DrawerRootContext = /*#__PURE__*/ import_react.createContext(void 0);
function useDrawerRootContext(optional) {
	const drawerRootContext = import_react.useContext(DrawerRootContext);
	if (optional !== true && drawerRootContext === void 0) throw new Error(formatErrorMessage(90));
	return drawerRootContext;
}
//#endregion
//#region node_modules/@base-ui/react/drawer/root/useDrawerSnapPoints.mjs
/**
* Resolves the vertical swipe movement for a snap point, applying square-root damping once the drag
* overshoots the fully-open edge (`nextOffset < 0`) so the popup resists travelling past it.
*/
function getSnapPointSwipeMovement(baseOffset, movementValue) {
	const nextOffset = baseOffset + movementValue;
	if (nextOffset >= 0) return movementValue;
	return -Math.sqrt(-nextOffset) - baseOffset;
}
function resolveSnapPointValue(snapPoint, viewportHeight, rootFontSize) {
	if (!Number.isFinite(viewportHeight) || viewportHeight <= 0) return null;
	if (typeof snapPoint === "number") {
		if (!Number.isFinite(snapPoint)) return null;
		if (snapPoint <= 1) return clamp(snapPoint, 0, 1) * viewportHeight;
		return snapPoint;
	}
	const trimmed = snapPoint.trim();
	if (trimmed.endsWith("px")) {
		const value = Number.parseFloat(trimmed);
		return Number.isFinite(value) ? value : null;
	}
	if (trimmed.endsWith("rem")) {
		const value = Number.parseFloat(trimmed);
		return Number.isFinite(value) ? value * rootFontSize : null;
	}
	return null;
}
/**
* Returns the index of the value closest to `target`, or `-1` if `values` is empty.
*/
function closestSnapPointIndex(values, target) {
	let closestIndex = -1;
	let closestDistance = Infinity;
	for (let index = 0; index < values.length; index += 1) {
		const distance = Math.abs(values[index] - target);
		if (distance < closestDistance) {
			closestDistance = distance;
			closestIndex = index;
		}
	}
	return closestIndex;
}
function useDrawerSnapPoints() {
	const store = useDialogRootContext();
	const { snapPoints, activeSnapPoint, setActiveSnapPoint, popupHeight } = useDrawerRootContext();
	const viewportElement = store.useState("viewportElement");
	const [viewportHeight, setViewportHeight] = import_react.useState(0);
	const [rootFontSize, setRootFontSize] = import_react.useState(16);
	const measureViewportHeight = useStableCallback(() => {
		const html = ownerDocument(viewportElement).documentElement;
		setViewportHeight(viewportElement ? viewportElement.offsetHeight : html.clientHeight);
		const fontSize = parseFloat(getComputedStyle(html).fontSize);
		if (Number.isFinite(fontSize)) setRootFontSize(fontSize);
	});
	useIsoLayoutEffect(() => {
		measureViewportHeight();
		if (!viewportElement || typeof ResizeObserver !== "function") return;
		const resizeObserver = new ResizeObserver(measureViewportHeight);
		resizeObserver.observe(viewportElement);
		return () => {
			resizeObserver.disconnect();
		};
	}, [measureViewportHeight, viewportElement]);
	const resolvedSnapPoints = import_react.useMemo(() => {
		if (!snapPoints || snapPoints.length === 0 || viewportHeight <= 0 || popupHeight <= 0) return [];
		const maxHeight = Math.min(popupHeight, viewportHeight);
		const resolved = snapPoints.map((value) => {
			const resolvedHeight = resolveSnapPointValue(value, viewportHeight, rootFontSize);
			if (resolvedHeight === null) return null;
			const clampedHeight = clamp(resolvedHeight, 0, maxHeight);
			return {
				value,
				height: clampedHeight,
				offset: Math.max(0, popupHeight - clampedHeight)
			};
		}).filter((point) => Boolean(point));
		if (resolved.length <= 1) return resolved;
		const deduped = [];
		const seenHeights = [];
		for (let index = resolved.length - 1; index >= 0; index -= 1) {
			const point = resolved[index];
			if (seenHeights.some((height) => Math.abs(height - point.height) <= 1)) continue;
			seenHeights.push(point.height);
			deduped.push(point);
		}
		deduped.reverse();
		return deduped;
	}, [
		popupHeight,
		rootFontSize,
		snapPoints,
		viewportHeight
	]);
	return {
		snapPoints,
		activeSnapPoint,
		setActiveSnapPoint,
		popupHeight,
		viewportHeight,
		resolvedSnapPoints,
		activeSnapPointOffset: import_react.useMemo(() => {
			if (activeSnapPoint === null) return;
			const exactMatch = resolvedSnapPoints.find((point) => Object.is(point.value, activeSnapPoint));
			if (exactMatch) return exactMatch;
			const maxHeight = Math.min(popupHeight, viewportHeight);
			const resolvedHeight = resolveSnapPointValue(activeSnapPoint, viewportHeight, rootFontSize);
			if (resolvedHeight === null) return;
			const clampedHeight = clamp(resolvedHeight, 0, maxHeight);
			return resolvedSnapPoints[closestSnapPointIndex(resolvedSnapPoints.map((point) => point.height), clampedHeight)];
		}, [
			activeSnapPoint,
			popupHeight,
			resolvedSnapPoints,
			rootFontSize,
			viewportHeight
		])?.offset ?? null
	};
}
//#endregion
//#region node_modules/@base-ui/react/drawer/viewport/DrawerViewportContext.mjs
var DrawerViewportContext = /*#__PURE__*/ import_react.createContext(null);
function useDrawerViewportContext() {
	return import_react.useContext(DrawerViewportContext);
}
//#endregion
//#region node_modules/@base-ui/react/drawer/popup/DrawerPopup.mjs
var drawerSwipeVarsRegistered = false;
/**
* Removes inheritance of high-frequency drawer swipe CSS variables, which
* reduces style recalculation cost in complex drawers with deep subtrees.
* See https://motion.dev/blog/web-animation-performance-tier-list
* under the "Improving CSS variable performance" section.
*/
function removeCSSVariableInheritance() {
	if (drawerSwipeVarsRegistered) return;
	if (typeof CSS !== "undefined" && "registerProperty" in CSS) {
		[
			swipeMovementX,
			swipeMovementY,
			snapPointOffset
		].forEach((name) => {
			try {
				CSS.registerProperty({
					name,
					syntax: "<length>",
					inherits: false,
					initialValue: "0px"
				});
			} catch {}
		});
		[{
			name: swipeProgress,
			initialValue: "0"
		}, {
			name: swipeStrength,
			initialValue: "1"
		}].forEach(({ name, initialValue }) => {
			try {
				CSS.registerProperty({
					name,
					syntax: "<number>",
					inherits: false,
					initialValue
				});
			} catch {}
		});
	}
	drawerSwipeVarsRegistered = true;
}
var stateAttributesMapping = {
	...popupTransitionStateMapping,
	expanded(value) {
		return value ? { [expanded]: "" } : null;
	},
	nestedDrawerOpen(value) {
		return value ? { [nestedDrawerOpen]: "" } : null;
	},
	nestedDrawerSwiping(value) {
		return value ? { [nestedDrawerSwiping]: "" } : null;
	},
	swipeDirection(value) {
		return { [swipeDirection]: value };
	},
	swiping(value) {
		return value ? { [swiping]: "" } : null;
	}
};
/**
* A container for the drawer contents.
* Renders a `<div>` element.
*
* Documentation: [Base UI Drawer](https://base-ui.com/react/components/drawer)
*/
var DrawerPopup = /*#__PURE__*/ import_react.forwardRef(function DrawerPopup(componentProps, forwardedRef) {
	const { render, className, style, finalFocus, initialFocus, ...elementProps } = componentProps;
	const store = useDialogRootContext();
	const popupRef = store.context.popupRef;
	const { swipeDirection, frontmostHeight: frontmostHeight$1, hasNestedDrawer, nestedSwiping, nestedSwipeProgressStore, onPopupHeightChange, notifyParentFrontmostHeight, notifyParentHasNestedDrawer } = useDrawerRootContext();
	const descriptionElementId = store.useState("descriptionElementId");
	const disablePointerDismissal = store.useState("disablePointerDismissal");
	const floatingRootContext = store.useState("floatingRootContext");
	const rootPopupProps = store.useState("popupProps");
	const modal = store.useState("modal");
	const mounted = store.useState("mounted");
	const nested = store.useState("nested");
	const nestedOpenDrawerCount = store.useState("nestedOpenDrawerCount");
	const transitionStatus = store.useState("transitionStatus");
	const open = store.useState("open");
	const openMethod = store.useState("openMethod");
	const titleElementId = store.useState("titleElementId");
	const role = store.useState("role");
	const floatingId = floatingRootContext.useState("floatingId");
	const popupId = elementProps.id ?? floatingId;
	const swipe = useDrawerViewportContext();
	useDialogPortalContext();
	const { snapPoints, activeSnapPoint, activeSnapPointOffset } = useDrawerSnapPoints();
	const nestedDrawerOpen = nestedOpenDrawerCount > 0;
	const swiping = swipe?.swiping ?? false;
	const swipeStrength$1 = swipe?.swipeStrength ?? null;
	const [popupHeight, setPopupHeight] = import_react.useState(0);
	const popupHeightRef = import_react.useRef(0);
	const measureHeight = useStableCallback(() => {
		const popupElement = popupRef.current;
		if (!popupElement) return;
		const offsetHeight = popupElement.offsetHeight;
		if (popupHeightRef.current > 0 && frontmostHeight$1 > popupHeightRef.current && offsetHeight > popupHeightRef.current) return;
		if (popupHeightRef.current > 0 && hasNestedDrawer) {
			const oldHeight = popupHeightRef.current;
			setPopupHeight(oldHeight);
			onPopupHeightChange(oldHeight);
			return;
		}
		const nextHeight = offsetHeight;
		if (nextHeight === popupHeightRef.current) return;
		popupHeightRef.current = nextHeight;
		setPopupHeight(nextHeight);
		onPopupHeightChange(nextHeight);
	});
	useIsoLayoutEffect(() => {
		if (!mounted) {
			popupHeightRef.current = 0;
			setPopupHeight(0);
			onPopupHeightChange(0);
			return;
		}
		const popupElement = popupRef.current;
		if (!popupElement) return;
		removeCSSVariableInheritance();
		measureHeight();
		if (typeof ResizeObserver !== "function") return;
		const resizeObserver = new ResizeObserver(measureHeight);
		resizeObserver.observe(popupElement);
		return () => {
			resizeObserver.disconnect();
		};
	}, [
		measureHeight,
		mounted,
		nestedDrawerOpen,
		onPopupHeightChange,
		popupRef
	]);
	useIsoLayoutEffect(() => {
		const syncNestedSwipeProgress = () => {
			const popupElement = popupRef.current;
			if (!popupElement) return;
			const progress = nestedSwipeProgressStore.getSnapshot();
			if (progress > 0) popupElement.style.setProperty(swipeProgress, `${progress}`);
			else popupElement.style.setProperty(swipeProgress, "0");
		};
		syncNestedSwipeProgress();
		const unsubscribe = nestedSwipeProgressStore.subscribe(syncNestedSwipeProgress);
		const popupElement = popupRef.current;
		return () => {
			unsubscribe();
			if (popupElement) popupElement.style.setProperty(swipeProgress, "0");
		};
	}, [nestedSwipeProgressStore, popupRef]);
	useIsoLayoutEffect(() => {
		if (!open) return;
		notifyParentFrontmostHeight?.(frontmostHeight$1);
		return () => {
			notifyParentFrontmostHeight?.(0);
		};
	}, [
		frontmostHeight$1,
		open,
		notifyParentFrontmostHeight
	]);
	useIsoLayoutEffect(() => {
		if (!notifyParentHasNestedDrawer) return;
		notifyParentHasNestedDrawer(open || transitionStatus === "ending");
		return () => {
			notifyParentHasNestedDrawer(false);
		};
	}, [
		notifyParentHasNestedDrawer,
		open,
		transitionStatus
	]);
	useOpenChangeComplete({
		open,
		ref: popupRef,
		onComplete() {
			if (open) store.context.onOpenChangeComplete?.(true);
		}
	});
	const resolvedInitialFocus = initialFocus === void 0 ? popupRef : initialFocus;
	const setPopupElement = store.useStateSetter("popupElement");
	const state = {
		open,
		nested,
		transitionStatus,
		expanded: activeSnapPoint === 1,
		nestedDrawerOpen,
		nestedDrawerSwiping: nestedSwiping,
		swipeDirection,
		swiping
	};
	let popupHeightCssVarValue;
	if (popupHeight && !(!hasNestedDrawer && transitionStatus !== "ending")) popupHeightCssVarValue = `${popupHeight}px`;
	const shouldApplySnapPoints = snapPoints && snapPoints.length > 0 && (swipeDirection === "down" || swipeDirection === "up");
	let snapPointOffsetValue = null;
	if (shouldApplySnapPoints && activeSnapPointOffset !== null) snapPointOffsetValue = swipeDirection === "up" ? -activeSnapPointOffset : activeSnapPointOffset;
	let dragStyles = swipe ? swipe.getDragStyles() : EMPTY_OBJECT;
	if (shouldApplySnapPoints && swipeDirection === "down") {
		const baseOffset = activeSnapPointOffset ?? 0;
		const movementValue = Number.parseFloat(String(dragStyles[swipeMovementY]));
		if (swiping && Number.isFinite(movementValue)) dragStyles = {
			...dragStyles,
			transform: void 0,
			[swipeMovementY]: `${getSnapPointSwipeMovement(baseOffset, movementValue)}px`
		};
		else dragStyles = {
			...dragStyles,
			transform: void 0
		};
	}
	const element = useRenderElement("div", componentProps, {
		state,
		props: [
			rootPopupProps,
			{
				id: popupId,
				"aria-labelledby": titleElementId,
				"aria-describedby": descriptionElementId,
				role,
				...FOCUSABLE_POPUP_PROPS,
				hidden: !mounted,
				onKeyDown(event) {
					if (COMPOSITE_KEYS.has(event.key)) event.stopPropagation();
				},
				style: {
					...dragStyles,
					[swipeProgress]: "0",
					[nestedDrawers]: nestedOpenDrawerCount,
					[height]: popupHeightCssVarValue,
					[snapPointOffset]: typeof snapPointOffsetValue === "number" ? `${snapPointOffsetValue}px` : "0px",
					[frontmostHeight]: frontmostHeight$1 ? `${frontmostHeight$1}px` : void 0,
					[swipeStrength]: typeof swipeStrength$1 === "number" && Number.isFinite(swipeStrength$1) && swipeStrength$1 > 0 ? `${swipeStrength$1}` : "1"
				}
			},
			elementProps
		],
		ref: [
			forwardedRef,
			popupRef,
			setPopupElement
		],
		stateAttributesMapping
	});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FloatingFocusManager, {
		context: floatingRootContext,
		openInteractionType: openMethod,
		disabled: !mounted,
		closeOnFocusOut: !disablePointerDismissal,
		initialFocus: resolvedInitialFocus,
		returnFocus: finalFocus,
		modal: modal !== false,
		restoreFocus: "popup",
		children: element
	});
});
//#endregion
//#region node_modules/@base-ui/react/drawer/portal/DrawerPortal.mjs
/**
* A portal element that moves the popup to a different part of the DOM.
* By default, the portal element is appended to `<body>`.
* Renders a `<div>` element.
*
* Documentation: [Base UI Drawer](https://base-ui.com/react/components/drawer)
*/
var DrawerPortal = DialogPortal;
//#endregion
//#region node_modules/@base-ui/react/drawer/root/DrawerRoot.mjs
var _DrawerProviderReport;
var _DrawerProviderReport2;
/**
* Groups all parts of the drawer.
* Doesn't render its own HTML element.
*
* Documentation: [Base UI Drawer](https://base-ui.com/react/components/drawer)
*/
function DrawerRoot(props) {
	const { children, open: openProp, defaultOpen = false, onOpenChange, onOpenChangeComplete, disablePointerDismissal = false, modal = true, actionsRef, handle, triggerId: triggerIdProp, defaultTriggerId: defaultTriggerIdProp = null, swipeDirection = "down", snapToSequentialPoints = false, snapPoints, snapPoint: snapPointProp, defaultSnapPoint, onSnapPointChange } = props;
	const parentDrawerRootContext = useDrawerRootContext(true);
	const notifyParentSwipeProgressChange = parentDrawerRootContext?.onNestedSwipeProgressChange;
	const notifyParentFrontmostHeight = parentDrawerRootContext?.onNestedFrontmostHeightChange;
	const notifyParentSwipingChange = parentDrawerRootContext?.onNestedSwipingChange;
	const notifyParentHasNestedDrawer = parentDrawerRootContext?.onNestedDrawerPresenceChange;
	const [popupHeight, setPopupHeight] = import_react.useState(0);
	const [frontmostHeight, setFrontmostHeight] = import_react.useState(0);
	const [hasNestedDrawer, setHasNestedDrawer] = import_react.useState(false);
	const [nestedSwiping, setNestedSwiping] = import_react.useState(false);
	const [nestedSwipeProgressStore] = import_react.useState(createNestedSwipeProgressStore);
	const resolvedDefaultSnapPoint = defaultSnapPoint !== void 0 ? defaultSnapPoint : snapPoints?.[0] ?? null;
	const isSnapPointControlled = snapPointProp !== void 0;
	const [activeSnapPoint, setActiveSnapPointUnwrapped] = useControlled({
		controlled: snapPointProp,
		default: resolvedDefaultSnapPoint,
		name: "Drawer",
		state: "snapPoint"
	});
	const isNestedDrawerOpenRef = import_react.useRef(false);
	const swipeAreaActiveRef = import_react.useRef(false);
	const setActiveSnapPoint = useStableCallback((nextSnapPoint, eventDetails) => {
		const resolvedEventDetails = eventDetails ?? createChangeEventDetails("none");
		onSnapPointChange?.(nextSnapPoint, resolvedEventDetails);
		if (resolvedEventDetails.isCanceled) return;
		setActiveSnapPointUnwrapped(nextSnapPoint);
	});
	const resolvedActiveSnapPoint = import_react.useMemo(() => {
		if (isSnapPointControlled) return activeSnapPoint;
		if (!snapPoints || snapPoints.length === 0) return activeSnapPoint;
		if (activeSnapPoint === null || !snapPoints.some((snapPoint) => Object.is(snapPoint, activeSnapPoint))) return resolvedDefaultSnapPoint;
		return activeSnapPoint;
	}, [
		activeSnapPoint,
		isSnapPointControlled,
		resolvedDefaultSnapPoint,
		snapPoints
	]);
	const onPopupHeightChange = useStableCallback((height) => {
		setPopupHeight(height);
		if (!isNestedDrawerOpenRef.current && height > 0) setFrontmostHeight(height);
	});
	const onNestedFrontmostHeightChange = useStableCallback((height) => {
		if (height > 0) {
			isNestedDrawerOpenRef.current = true;
			setFrontmostHeight(height);
			return;
		}
		isNestedDrawerOpenRef.current = false;
		if (popupHeight > 0) setFrontmostHeight(popupHeight);
	});
	const onNestedDrawerPresenceChange = useStableCallback((present) => {
		setHasNestedDrawer(present);
	});
	const onNestedSwipeProgressChange = useStableCallback((progress) => {
		nestedSwipeProgressStore.set(progress);
		notifyParentSwipeProgressChange?.(progress);
	});
	const onNestedSwipingChange = useStableCallback((swiping) => {
		setNestedSwiping(swiping);
		notifyParentSwipingChange?.(swiping);
	});
	const handleOpenChange = useStableCallback((nextOpen, eventDetails) => {
		onOpenChange?.(nextOpen, eventDetails);
		if (eventDetails.isCanceled) return;
		if (!nextOpen && snapPoints && snapPoints.length > 0) setActiveSnapPoint(resolvedDefaultSnapPoint, createChangeEventDetails(eventDetails.reason, eventDetails.event, eventDetails.trigger));
	});
	const contextValue = import_react.useMemo(() => ({
		swipeDirection,
		swipeAreaActiveRef,
		snapToSequentialPoints,
		snapPoints,
		activeSnapPoint: resolvedActiveSnapPoint,
		setActiveSnapPoint,
		frontmostHeight,
		popupHeight,
		hasNestedDrawer,
		nestedSwiping,
		nestedSwipeProgressStore,
		onNestedDrawerPresenceChange,
		onPopupHeightChange,
		onNestedFrontmostHeightChange,
		onNestedSwipingChange,
		onNestedSwipeProgressChange,
		notifyParentFrontmostHeight,
		notifyParentSwipingChange,
		notifyParentSwipeProgressChange,
		notifyParentHasNestedDrawer
	}), [
		resolvedActiveSnapPoint,
		frontmostHeight,
		hasNestedDrawer,
		nestedSwiping,
		nestedSwipeProgressStore,
		notifyParentHasNestedDrawer,
		notifyParentSwipeProgressChange,
		notifyParentSwipingChange,
		notifyParentFrontmostHeight,
		onNestedDrawerPresenceChange,
		onNestedFrontmostHeightChange,
		onNestedSwipeProgressChange,
		onNestedSwipingChange,
		onPopupHeightChange,
		popupHeight,
		setActiveSnapPoint,
		snapPoints,
		snapToSequentialPoints,
		swipeAreaActiveRef,
		swipeDirection
	]);
	const resolvedChildren = typeof children === "function" ? (payload) => /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [_DrawerProviderReport || (_DrawerProviderReport = /*#__PURE__*/ (0, import_jsx_runtime.jsx)(DrawerProviderReporter, {})), children(payload)] }) : /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [_DrawerProviderReport2 || (_DrawerProviderReport2 = /*#__PURE__*/ (0, import_jsx_runtime.jsx)(DrawerProviderReporter, {})), children] });
	const dialog = useRenderDialogRoot("drawer", {
		open: openProp,
		defaultOpen,
		onOpenChange: handleOpenChange,
		onOpenChangeComplete,
		disablePointerDismissal,
		modal,
		actionsRef,
		handle,
		triggerId: triggerIdProp,
		defaultTriggerId: defaultTriggerIdProp,
		children: resolvedChildren
	});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(DrawerRootContext.Provider, {
		value: contextValue,
		children: dialog
	});
}
function createNestedSwipeProgressStore() {
	let progress = 0;
	const listeners = /* @__PURE__ */ new Set();
	return {
		getSnapshot: () => progress,
		set(nextProgress) {
			const resolved = Number.isFinite(nextProgress) ? nextProgress : 0;
			if (resolved === progress) return;
			progress = resolved;
			listeners.forEach((listener) => {
				listener();
			});
		},
		subscribe(listener) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		}
	};
}
function DrawerProviderReporter() {
	const providerContext = useDrawerProviderContext();
	const store = useDialogRootContext(false);
	const setDrawerOpen = providerContext?.setDrawerOpen;
	const removeDrawer = providerContext?.removeDrawer;
	const open = store.useState("open");
	const nestedOpenDialogCount = store.useState("nestedOpenDialogCount");
	const popupElement = store.useState("popupElement");
	const isTopmost = nestedOpenDialogCount === 0;
	useIsoLayoutEffect(() => {
		if (!removeDrawer) return;
		return () => {
			removeDrawer(store);
		};
	}, [removeDrawer, store]);
	useIsoLayoutEffect(() => {
		setDrawerOpen?.(store, open);
	}, [
		open,
		setDrawerOpen,
		store
	]);
	import_react.useEffect(() => {
		if (!open || !isTopmost || !android) return;
		const CloseWatcherCtor = getWindow(popupElement).CloseWatcher;
		if (!CloseWatcherCtor) return;
		function handleCloseWatcher(event) {
			if (!store.select("open")) return;
			store.setOpen(false, createChangeEventDetails(closeWatcher, event));
		}
		const closeWatcher$1 = new CloseWatcherCtor();
		const unsubscribe = addEventListener(closeWatcher$1, "close", handleCloseWatcher);
		return () => {
			unsubscribe();
			closeWatcher$1.destroy();
		};
	}, [
		store,
		isTopmost,
		open,
		popupElement
	]);
	return null;
}
//#endregion
//#region node_modules/@base-ui/react/utils/scrollable.mjs
function isScrollableY(element, allowOverflowIntent = false) {
	const { overflowY } = getComputedStyle$1(element);
	if (overflowY !== "auto" && overflowY !== "scroll") return false;
	return allowOverflowIntent ? element.clientHeight > 0 : element.scrollHeight > element.clientHeight;
}
function isScrollableX(element, allowOverflowIntent = false) {
	const { overflowX } = getComputedStyle$1(element);
	if (overflowX !== "auto" && overflowX !== "scroll") return false;
	return allowOverflowIntent ? element.clientWidth > 0 : element.scrollWidth > element.clientWidth;
}
function isScrollable(element, axis, allowOverflowIntent = false) {
	return axis === "vertical" ? isScrollableY(element, allowOverflowIntent) : isScrollableX(element, allowOverflowIntent);
}
function hasScrollableAncestor(target, root, axes) {
	let node = target;
	while (isHTMLElement(node) && node !== root && !isLastTraversableNode(node)) {
		for (const axis of axes) if (isScrollable(node, axis)) return true;
		node = getParentNode(node);
	}
	return false;
}
function findScrollableTouchTarget(target, root, axis = "vertical", allowOverflowIntent = false) {
	let node = isHTMLElement(target) ? target : null;
	while (isHTMLElement(node) && node !== root && !isLastTraversableNode(node)) {
		if (isScrollable(node, axis, allowOverflowIntent)) return node;
		node = getParentNode(node);
	}
	return isScrollable(root, axis, allowOverflowIntent) ? root : null;
}
//#endregion
//#region node_modules/@base-ui/react/utils/getElementAtPoint.mjs
function getElementAtPoint(root, x, y) {
	return typeof root?.elementFromPoint === "function" ? root.elementFromPoint(x, y) : null;
}
//#endregion
//#region node_modules/@base-ui/react/utils/useSwipeDismiss.mjs
var DEFAULT_SWIPE_THRESHOLD = 40;
var REVERSE_CANCEL_THRESHOLD = 10;
var MIN_DRAG_THRESHOLD = 1;
var MIN_VELOCITY_DURATION_MS = 50;
var MIN_RELEASE_VELOCITY_DURATION_MS = 16;
var MAX_RELEASE_VELOCITY_AGE_MS = 80;
var DEFAULT_IGNORE_SELECTOR = "button,a,input,select,textarea,label,[role=\"button\"]";
function getDisplacement(direction, deltaX, deltaY) {
	switch (direction) {
		case "up": return -deltaY;
		case "down": return deltaY;
		case "left": return -deltaX;
		case "right": return deltaX;
		default: return 0;
	}
}
function getValidTimeStamp(timeStamp) {
	return Number.isFinite(timeStamp) && timeStamp > 0 ? timeStamp : null;
}
function getDragTransform(dragOffset, scale) {
	return `translate3d(${dragOffset.x}px,${dragOffset.y}px,0) scale(${scale})`;
}
function hasPrimaryMouseButton(buttons) {
	return buttons % 2 === 1;
}
function safelyChangePointerCapture(element, pointerId, method) {
	const pointerCaptureMethod = element[method];
	if (typeof pointerCaptureMethod !== "function") return;
	try {
		pointerCaptureMethod.call(element, pointerId);
	} catch (error) {
		if (error && typeof error === "object" && "name" in error && error.name === "NotFoundError") return;
		throw error;
	}
}
function useSwipeDismiss(options) {
	const { enabled, directions, elementRef, movementCssVars, canStart, ignoreSelectorWhenTouch = true, ignoreScrollableAncestors = false, swipeThreshold: swipeThresholdProp, onDismiss, onProgress, onCancel, onSwipeStart, onRelease, onSwipingChange, trackDrag = true } = options;
	const ignoreSelector = DEFAULT_IGNORE_SELECTOR;
	const primaryDirection = directions.length === 1 ? directions[0] : void 0;
	const swipeThresholdDefault = Math.max(0, typeof swipeThresholdProp === "number" ? swipeThresholdProp : DEFAULT_SWIPE_THRESHOLD);
	const allowLeft = directions.includes("left");
	const allowRight = directions.includes("right");
	const allowUp = directions.includes("up");
	const allowDown = directions.includes("down");
	const hasHorizontal = allowLeft || allowRight;
	const hasVertical = allowUp || allowDown;
	const scrollAxes = import_react.useMemo(() => {
		const axes = [];
		if (hasVertical) axes.push("vertical");
		if (hasHorizontal) axes.push("horizontal");
		return axes;
	}, [hasHorizontal, hasVertical]);
	const [currentSwipeDirection, setCurrentSwipeDirection] = import_react.useState(void 0);
	const [isSwiping, setIsSwiping] = import_react.useState(false);
	const [dragDismissed, setDragDismissed] = import_react.useState(false);
	const dragStartPosRef = import_react.useRef({
		x: 0,
		y: 0
	});
	const dragOffsetRef = import_react.useRef({
		x: 0,
		y: 0
	});
	const lastMovePosRef = import_react.useRef(null);
	const initialTransformRef = import_react.useRef({
		x: 0,
		y: 0,
		scale: 1
	});
	const intendedSwipeDirectionRef = import_react.useRef(void 0);
	const maxSwipeDisplacementRef = import_react.useRef(0);
	const cancelledSwipeRef = import_react.useRef(false);
	const swipeCancelBaselineRef = import_react.useRef({
		x: 0,
		y: 0
	});
	const lockedDirectionRef = import_react.useRef(null);
	const isFirstPointerMoveRef = import_react.useRef(false);
	const pendingSwipeRef = import_react.useRef(false);
	const pendingSwipeStartPosRef = import_react.useRef(null);
	const swipeFromScrollableRef = import_react.useRef(false);
	const sawPrimaryButtonsOnMoveRef = import_react.useRef(false);
	const elementSizeRef = import_react.useRef({
		width: 0,
		height: 0
	});
	const swipeProgressRef = import_react.useRef(0);
	const swipeThresholdRef = import_react.useRef(swipeThresholdDefault);
	const swipeThresholdFunctionRef = import_react.useRef(null);
	const swipeStartTimeRef = import_react.useRef(null);
	const lastDragSampleRef = import_react.useRef(null);
	const lastDragVelocityRef = import_react.useRef({
		x: 0,
		y: 0
	});
	const lastProgressDetailsRef = import_react.useRef(null);
	const isSwipingRef = import_react.useRef(false);
	const dragStyleSnapshotRef = import_react.useRef(null);
	const setSwiping = useStableCallback((nextSwiping) => {
		if (isSwipingRef.current === nextSwiping) return;
		isSwipingRef.current = nextSwiping;
		setIsSwiping(nextSwiping);
		onSwipingChange?.(nextSwiping);
	});
	function resolveSwipeThreshold(direction) {
		if (!direction) return;
		const element = elementRef.current;
		const thresholdFunction = swipeThresholdFunctionRef.current;
		if (!element || !thresholdFunction) return;
		const value = thresholdFunction({
			element,
			direction
		});
		swipeThresholdRef.current = Math.max(0, value);
	}
	const updateSwipeProgress = useStableCallback((progress, details) => {
		const nextProgress = Number.isFinite(progress) ? clamp(progress, 0, 1) : 0;
		const progressChanged = nextProgress !== swipeProgressRef.current;
		let detailsChanged = false;
		if (details) {
			const lastDetails = lastProgressDetailsRef.current;
			detailsChanged = !lastDetails || lastDetails.deltaX !== details.deltaX || lastDetails.deltaY !== details.deltaY || lastDetails.direction !== details.direction;
		}
		if (!progressChanged && !detailsChanged) return;
		swipeProgressRef.current = nextProgress;
		if (details) lastProgressDetailsRef.current = details;
		else if (progressChanged) lastProgressDetailsRef.current = null;
		onProgress?.(nextProgress, details);
	});
	const syncDragStyles = useStableCallback((swiping) => {
		const element = elementRef.current;
		if (!trackDrag || !element) {
			if (!swiping) dragStyleSnapshotRef.current = null;
			return;
		}
		const style = element.style;
		const dragStyleSnapshot = dragStyleSnapshotRef.current;
		if (swiping) {
			if (!dragStyleSnapshot) dragStyleSnapshotRef.current = [style.transition, style.transform];
			style.transition = "none";
		} else if (dragStyleSnapshot) {
			[style.transition, style.transform] = dragStyleSnapshot;
			dragStyleSnapshotRef.current = null;
		}
		const dragOffset = dragOffsetRef.current;
		const initialTransform = initialTransformRef.current;
		const deltaX = dragOffset.x - initialTransform.x;
		const deltaY = dragOffset.y - initialTransform.y;
		if (swiping) style.transform = getDragTransform(dragOffset, initialTransform.scale);
		style.setProperty(movementCssVars.x, `${deltaX}px`);
		style.setProperty(movementCssVars.y, `${deltaY}px`);
	});
	function recordDragSample(offset, timeStamp) {
		if (timeStamp === null) return;
		const lastSample = lastDragSampleRef.current;
		if (lastSample && timeStamp > lastSample.time) {
			const durationMs = Math.max(timeStamp - lastSample.time, MIN_RELEASE_VELOCITY_DURATION_MS);
			lastDragVelocityRef.current = {
				x: (offset.x - lastSample.x) / durationMs,
				y: (offset.y - lastSample.y) / durationMs
			};
		}
		lastDragSampleRef.current = {
			x: offset.x,
			y: offset.y,
			time: timeStamp
		};
	}
	const reset = import_react.useCallback(() => {
		setCurrentSwipeDirection(void 0);
		setSwiping(false);
		setDragDismissed(false);
		updateSwipeProgress(0);
		swipeThresholdRef.current = swipeThresholdDefault;
		swipeThresholdFunctionRef.current = null;
		dragStartPosRef.current = {
			x: 0,
			y: 0
		};
		dragOffsetRef.current = {
			x: 0,
			y: 0
		};
		initialTransformRef.current = {
			x: 0,
			y: 0,
			scale: 1
		};
		intendedSwipeDirectionRef.current = void 0;
		maxSwipeDisplacementRef.current = 0;
		cancelledSwipeRef.current = false;
		swipeCancelBaselineRef.current = {
			x: 0,
			y: 0
		};
		lockedDirectionRef.current = null;
		isFirstPointerMoveRef.current = false;
		lastMovePosRef.current = null;
		pendingSwipeRef.current = false;
		pendingSwipeStartPosRef.current = null;
		swipeFromScrollableRef.current = false;
		sawPrimaryButtonsOnMoveRef.current = false;
		elementSizeRef.current = {
			width: 0,
			height: 0
		};
		swipeStartTimeRef.current = null;
		lastDragSampleRef.current = null;
		lastDragVelocityRef.current = {
			x: 0,
			y: 0
		};
		lastProgressDetailsRef.current = null;
		syncDragStyles(false);
	}, [
		setSwiping,
		swipeThresholdDefault,
		syncDragStyles,
		updateSwipeProgress
	]);
	function getPrimaryPointerPosition(event) {
		if ("touches" in event) {
			const touch = event.touches[0];
			return touch ? {
				x: touch.clientX,
				y: touch.clientY
			} : null;
		}
		return {
			x: event.clientX,
			y: event.clientY
		};
	}
	function isTouchLikeEvent(event) {
		if ("touches" in event) return true;
		return event.pointerType === "touch";
	}
	function getTargetAtPoint(position, nativeEvent) {
		const root = elementRef.current?.getRootNode();
		return getElementAtPoint(root, position.x, position.y) ?? getTarget(nativeEvent);
	}
	function findGestureScrollableTouchTarget(target, root) {
		const find = (axis) => {
			const scrollTarget = findScrollableTouchTarget(target, root, axis);
			const doc = ownerDocument(scrollTarget);
			return scrollTarget === doc.body || scrollTarget === doc.documentElement ? null : scrollTarget;
		};
		if (hasHorizontal && !hasVertical) return find("horizontal");
		if (hasVertical && !hasHorizontal) return find("vertical");
		return find("vertical") ?? find("horizontal");
	}
	function startSwipeAtPosition(event, position, startOptions) {
		swipeFromScrollableRef.current = false;
		const touchLike = isTouchLikeEvent(event);
		const target = getTargetAtPoint(position, event.nativeEvent);
		const body = ownerDocument(elementRef.current).body;
		const scrollableTarget = touchLike && body ? findGestureScrollableTouchTarget(target, body) : null;
		const ignoreScrollableTarget = startOptions?.ignoreScrollableTarget ?? false;
		if (scrollableTarget && !ignoreScrollableTarget) return false;
		swipeFromScrollableRef.current = Boolean(scrollableTarget && ignoreScrollableTarget);
		if ((target ? target.closest(ignoreSelector) : false) && (!touchLike || ignoreSelectorWhenTouch)) return false;
		const element = elementRef.current;
		if (ignoreScrollableAncestors && element && target && scrollAxes.length > 0) {
			if (!(startOptions?.ignoreScrollableAncestors ?? false) && hasScrollableAncestor(target, element, scrollAxes)) return false;
		}
		cancelledSwipeRef.current = false;
		intendedSwipeDirectionRef.current = void 0;
		maxSwipeDisplacementRef.current = 0;
		dragStartPosRef.current = position;
		swipeStartTimeRef.current = getValidTimeStamp(event.timeStamp);
		swipeCancelBaselineRef.current = position;
		lastMovePosRef.current = position;
		swipeThresholdRef.current = swipeThresholdDefault;
		swipeThresholdFunctionRef.current = typeof swipeThresholdProp === "function" ? swipeThresholdProp : null;
		if (element) {
			elementSizeRef.current = {
				width: element.offsetWidth,
				height: element.offsetHeight
			};
			resolveSwipeThreshold(primaryDirection);
			const transform = getElementTransform(element);
			initialTransformRef.current = transform;
			dragOffsetRef.current = {
				x: transform.x,
				y: transform.y
			};
			recordDragSample({
				x: transform.x,
				y: transform.y
			}, swipeStartTimeRef.current);
			if (!("touches" in event)) safelyChangePointerCapture(element, event.pointerId, "setPointerCapture");
		}
		onSwipeStart?.(event.nativeEvent);
		setSwiping(true);
		lockedDirectionRef.current = null;
		isFirstPointerMoveRef.current = true;
		updateSwipeProgress(0);
		syncDragStyles(true);
		return true;
	}
	function resetPendingSwipeState() {
		clearPendingSwipeStartState();
		swipeFromScrollableRef.current = false;
		lastMovePosRef.current = null;
	}
	function clearPendingSwipeStartState() {
		pendingSwipeRef.current = false;
		pendingSwipeStartPosRef.current = null;
	}
	function cancelSwipeInteraction(event) {
		resetPendingSwipeState();
		if (!isSwipingRef.current) return;
		setSwiping(false);
		lockedDirectionRef.current = null;
		const resolvedInitialTransform = initialTransformRef.current;
		dragOffsetRef.current = {
			x: resolvedInitialTransform.x,
			y: resolvedInitialTransform.y
		};
		setCurrentSwipeDirection(void 0);
		sawPrimaryButtonsOnMoveRef.current = false;
		syncDragStyles(false);
		const element = elementRef.current;
		if (element) safelyChangePointerCapture(element, event.pointerId, "releasePointerCapture");
		updateSwipeProgress(0, {
			deltaX: 0,
			deltaY: 0,
			direction: void 0
		});
		onCancel?.(event.nativeEvent);
	}
	function applyDirectionalDamping(deltaX, deltaY) {
		const exponent = (value) => Math.sign(value) * Math.abs(value) ** .5;
		const dampAxis = (delta, allowNegative, allowPositive) => {
			if (!allowNegative && delta < 0 || !allowPositive && delta > 0) return exponent(delta);
			return delta;
		};
		return {
			x: hasHorizontal ? dampAxis(deltaX, allowLeft, allowRight) : exponent(deltaX),
			y: hasVertical ? dampAxis(deltaY, allowUp, allowDown) : exponent(deltaY)
		};
	}
	function canSwipeFromScrollEdgeOnPendingMove(scrollTarget, deltaX, deltaY) {
		const canSwipeOnAxis = (delta, scrollOffset, maxScrollOffset, allowTowardStart, allowTowardEnd) => delta > 0 && scrollOffset <= 0 && allowTowardStart || delta < 0 && scrollOffset >= Math.max(0, maxScrollOffset) && allowTowardEnd;
		const absDeltaX = Math.abs(deltaX);
		const absDeltaY = Math.abs(deltaY);
		if (hasVertical && deltaY !== 0 && (!hasHorizontal || absDeltaY >= absDeltaX)) return canSwipeOnAxis(deltaY, scrollTarget.scrollTop, scrollTarget.scrollHeight - scrollTarget.clientHeight, allowDown, allowUp);
		if (hasHorizontal && deltaX !== 0 && (!hasVertical || absDeltaX > absDeltaY)) return canSwipeOnAxis(deltaX, scrollTarget.scrollLeft, scrollTarget.scrollWidth - scrollTarget.clientWidth, allowRight, allowLeft);
		return null;
	}
	const handleStart = useStableCallback((event) => {
		if (!enabled) return;
		if (event.defaultPrevented || event.nativeEvent.defaultPrevented) return;
		if (!("touches" in event) && event.button !== 0) return;
		const startPos = getPrimaryPointerPosition(event);
		if (!startPos) return;
		pendingSwipeRef.current = true;
		pendingSwipeStartPosRef.current = startPos;
		swipeFromScrollableRef.current = false;
		sawPrimaryButtonsOnMoveRef.current = !("touches" in event);
		if (!(canStart ? canStart(startPos, {
			nativeEvent: event.nativeEvent,
			direction: primaryDirection
		}) : true)) return;
		if (startSwipeAtPosition(event, startPos)) clearPendingSwipeStartState();
	});
	function handleMoveCore(event, position, movement) {
		if (!enabled || !isSwipingRef.current) return;
		const target = getTarget(event.nativeEvent);
		if (isTouchLikeEvent(event) && !swipeFromScrollableRef.current) {
			const boundaryElement = event.currentTarget;
			if (findGestureScrollableTouchTarget(target, boundaryElement)) return;
		}
		if (!("touches" in event)) event.preventDefault();
		if (isFirstPointerMoveRef.current) {
			isFirstPointerMoveRef.current = false;
			if (trackDrag) {
				dragStartPosRef.current = position;
				const moveTime = getValidTimeStamp(event.timeStamp);
				if (moveTime !== null) swipeStartTimeRef.current = moveTime;
			}
		}
		const clientX = position.x;
		const clientY = position.y;
		const movementX = movement.x;
		const movementY = movement.y;
		if (movementY < 0 && clientY > swipeCancelBaselineRef.current.y || movementY > 0 && clientY < swipeCancelBaselineRef.current.y) swipeCancelBaselineRef.current = {
			x: swipeCancelBaselineRef.current.x,
			y: clientY
		};
		if (movementX < 0 && clientX > swipeCancelBaselineRef.current.x || movementX > 0 && clientX < swipeCancelBaselineRef.current.x) swipeCancelBaselineRef.current = {
			x: clientX,
			y: swipeCancelBaselineRef.current.y
		};
		const deltaX = clientX - dragStartPosRef.current.x;
		const deltaY = clientY - dragStartPosRef.current.y;
		const cancelDeltaY = clientY - swipeCancelBaselineRef.current.y;
		const cancelDeltaX = clientX - swipeCancelBaselineRef.current.x;
		let lockedDirection = lockedDirectionRef.current;
		if (lockedDirection === null && hasHorizontal && hasVertical) {
			if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) >= MIN_DRAG_THRESHOLD) {
				lockedDirection = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
				lockedDirectionRef.current = lockedDirection;
			}
		}
		let candidate;
		if (!intendedSwipeDirectionRef.current) {
			if (lockedDirection === "vertical") {
				if (deltaY > 0) candidate = "down";
				else if (deltaY < 0) candidate = "up";
			} else if (lockedDirection === "horizontal") {
				if (deltaX > 0) candidate = "right";
				else if (deltaX < 0) candidate = "left";
			} else if (Math.abs(deltaX) >= Math.abs(deltaY)) candidate = deltaX > 0 ? "right" : "left";
			else candidate = deltaY > 0 ? "down" : "up";
			if (candidate) {
				if (candidate === "left" && allowLeft || candidate === "right" && allowRight || candidate === "up" && allowUp || candidate === "down" && allowDown) {
					intendedSwipeDirectionRef.current = candidate;
					maxSwipeDisplacementRef.current = getDisplacement(candidate, deltaX, deltaY);
					setCurrentSwipeDirection(candidate);
					resolveSwipeThreshold(candidate);
				}
			}
		} else {
			const direction = intendedSwipeDirectionRef.current;
			const currentDisplacement = getDisplacement(direction, cancelDeltaX, cancelDeltaY);
			if (currentDisplacement > swipeThresholdRef.current) {
				cancelledSwipeRef.current = false;
				setCurrentSwipeDirection(direction);
			} else if (!(allowLeft && allowRight) && !(allowUp && allowDown) && maxSwipeDisplacementRef.current - currentDisplacement >= REVERSE_CANCEL_THRESHOLD) cancelledSwipeRef.current = true;
		}
		const dampedDelta = applyDirectionalDamping(deltaX, deltaY);
		let newOffsetX = initialTransformRef.current.x;
		let newOffsetY = initialTransformRef.current.y;
		if (lockedDirection === "horizontal") {
			if (hasHorizontal) newOffsetX += dampedDelta.x;
		} else if (lockedDirection === "vertical") {
			if (hasVertical) newOffsetY += dampedDelta.y;
		} else {
			if (hasHorizontal) newOffsetX += dampedDelta.x;
			if (hasVertical) newOffsetY += dampedDelta.y;
		}
		const previousOffset = dragOffsetRef.current;
		const offsetChanged = newOffsetX !== previousOffset.x || newOffsetY !== previousOffset.y;
		dragOffsetRef.current = {
			x: newOffsetX,
			y: newOffsetY
		};
		if (offsetChanged) syncDragStyles(true);
		recordDragSample({
			x: newOffsetX,
			y: newOffsetY
		}, getValidTimeStamp(event.timeStamp));
		const dragDeltaX = newOffsetX - initialTransformRef.current.x;
		const dragDeltaY = newOffsetY - initialTransformRef.current.y;
		const progressDetails = {
			deltaX: dragDeltaX,
			deltaY: dragDeltaY,
			direction: intendedSwipeDirectionRef.current
		};
		let progress = 0;
		const progressDirection = primaryDirection ?? intendedSwipeDirectionRef.current;
		if (progressDirection) {
			const size = progressDirection === "left" || progressDirection === "right" ? elementSizeRef.current.width : elementSizeRef.current.height;
			const scale = initialTransformRef.current.scale || 1;
			const progressDisplacement = getDisplacement(progressDirection, dragDeltaX, dragDeltaY);
			if (size > 0 && scale > 0 && progressDisplacement > 0) progress = progressDisplacement / (size * scale);
		}
		updateSwipeProgress(progress, progressDetails);
	}
	const handleEnd = useStableCallback((event) => {
		if (!enabled) return;
		const resolvedDragOffset = dragOffsetRef.current;
		const resolvedInitialTransform = initialTransformRef.current;
		const releaseDeltaX = resolvedDragOffset.x - resolvedInitialTransform.x;
		const releaseDeltaY = resolvedDragOffset.y - resolvedInitialTransform.y;
		const progressDetails = {
			deltaX: releaseDeltaX,
			deltaY: releaseDeltaY,
			direction: intendedSwipeDirectionRef.current
		};
		if (!isSwipingRef.current) {
			resetPendingSwipeState();
			updateSwipeProgress(0, progressDetails);
			return;
		}
		setSwiping(false);
		lockedDirectionRef.current = null;
		resetPendingSwipeState();
		sawPrimaryButtonsOnMoveRef.current = false;
		const element = elementRef.current;
		if (element) {
			if (!("touches" in event)) safelyChangePointerCapture(element, event.pointerId, "releasePointerCapture");
		}
		const deltaX = releaseDeltaX;
		const deltaY = releaseDeltaY;
		const startTime = swipeStartTimeRef.current;
		const endTime = getValidTimeStamp(event.timeStamp);
		const durationMs = startTime !== null && endTime !== null && endTime > startTime ? endTime - startTime : 0;
		const velocityDurationMs = durationMs > 0 ? Math.max(durationMs, MIN_VELOCITY_DURATION_MS) : 0;
		const velocityX = velocityDurationMs > 0 ? deltaX / velocityDurationMs : 0;
		const velocityY = velocityDurationMs > 0 ? deltaY / velocityDurationMs : 0;
		let releaseVelocityX = lastDragVelocityRef.current.x;
		let releaseVelocityY = lastDragVelocityRef.current.y;
		const lastSample = lastDragSampleRef.current;
		if (lastSample && endTime !== null && endTime >= lastSample.time) {
			const ageMs = endTime - lastSample.time;
			if (ageMs <= MAX_RELEASE_VELOCITY_AGE_MS) {
				const sampleDurationMs = Math.max(ageMs, MIN_RELEASE_VELOCITY_DURATION_MS);
				const deltaFromLastSampleX = resolvedDragOffset.x - lastSample.x;
				const deltaFromLastSampleY = resolvedDragOffset.y - lastSample.y;
				const sampleVelocityX = deltaFromLastSampleX / sampleDurationMs;
				const sampleVelocityY = deltaFromLastSampleY / sampleDurationMs;
				if (sampleVelocityX !== 0) releaseVelocityX = sampleVelocityX;
				if (sampleVelocityY !== 0) releaseVelocityY = sampleVelocityY;
			} else {
				releaseVelocityX = 0;
				releaseVelocityY = 0;
			}
		}
		const releaseDecision = onRelease?.({
			event: event.nativeEvent,
			direction: intendedSwipeDirectionRef.current,
			deltaX,
			deltaY,
			velocityX,
			velocityY,
			releaseVelocityX,
			releaseVelocityY
		});
		const hasReleaseDecision = typeof releaseDecision === "boolean";
		if (cancelledSwipeRef.current && !hasReleaseDecision) {
			dragOffsetRef.current = {
				x: resolvedInitialTransform.x,
				y: resolvedInitialTransform.y
			};
			setCurrentSwipeDirection(void 0);
			syncDragStyles(false);
			updateSwipeProgress(0, progressDetails);
			return;
		}
		let shouldClose = false;
		let dismissDirection;
		if (hasReleaseDecision) {
			shouldClose = releaseDecision;
			dismissDirection = intendedSwipeDirectionRef.current ?? primaryDirection;
		} else for (const direction of directions) if (getDisplacement(direction, deltaX, deltaY) > swipeThresholdRef.current) {
			shouldClose = true;
			dismissDirection = direction;
			break;
		}
		if (shouldClose && dismissDirection) {
			setCurrentSwipeDirection(dismissDirection);
			setDragDismissed(true);
			syncDragStyles(false);
			onDismiss?.(event.nativeEvent, { direction: dismissDirection });
		} else {
			dragOffsetRef.current = {
				x: resolvedInitialTransform.x,
				y: resolvedInitialTransform.y
			};
			setCurrentSwipeDirection(void 0);
			syncDragStyles(false);
			updateSwipeProgress(0, progressDetails);
		}
	});
	const handleMove = useStableCallback((event) => {
		const currentPos = getPrimaryPointerPosition(event);
		if (!currentPos) return;
		let endAfterMove = false;
		if (!("touches" in event)) {
			const hasPrimaryButton = hasPrimaryMouseButton(event.buttons);
			if (hasPrimaryButton) sawPrimaryButtonsOnMoveRef.current = true;
			if (event.buttons !== 0 && !hasPrimaryButton) {
				cancelSwipeInteraction(event);
				return;
			}
			if (event.buttons === 0 && sawPrimaryButtonsOnMoveRef.current) {
				if (!isSwipingRef.current) {
					handleEnd(event);
					return;
				}
				endAfterMove = true;
			}
		}
		if (!isSwiping && pendingSwipeRef.current) {
			if (!isTouchLikeEvent(event) && (event.defaultPrevented || event.nativeEvent.defaultPrevented)) {
				resetPendingSwipeState();
				return;
			}
			if (canStart ? canStart(currentPos, {
				nativeEvent: event.nativeEvent,
				direction: primaryDirection
			}) : true) {
				const pendingStartPos = pendingSwipeStartPosRef.current;
				let ignoreScrollableOnStart = false;
				if (isTouchLikeEvent(event)) {
					const element = elementRef.current;
					if (pendingStartPos && element) {
						const target = getTargetAtPoint(currentPos, event.nativeEvent);
						const body = ownerDocument(element).body;
						const scrollTarget = body ? findGestureScrollableTouchTarget(target, body) : null;
						if (scrollTarget && (contains(element, scrollTarget) || contains(scrollTarget, element))) {
							const canSwipeFromEdge = canSwipeFromScrollEdgeOnPendingMove(scrollTarget, currentPos.x - pendingStartPos.x, currentPos.y - pendingStartPos.y);
							if (canSwipeFromEdge === false) return;
							if (canSwipeFromEdge === true) ignoreScrollableOnStart = true;
						}
					}
				}
				if (startSwipeAtPosition(event, currentPos, {
					ignoreScrollableTarget: ignoreScrollableOnStart,
					ignoreScrollableAncestors: ignoreScrollableOnStart
				})) {
					if (pendingStartPos && ignoreScrollableOnStart) {
						clearPendingSwipeStartState();
						dragStartPosRef.current = pendingStartPos;
						swipeCancelBaselineRef.current = pendingStartPos;
						lastMovePosRef.current = pendingStartPos;
						isFirstPointerMoveRef.current = false;
					} else {
						clearPendingSwipeStartState();
						swipeFromScrollableRef.current = false;
					}
				}
			}
		}
		const previousPos = lastMovePosRef.current;
		const movement = previousPos === null ? {
			x: 0,
			y: 0
		} : {
			x: currentPos.x - previousPos.x,
			y: currentPos.y - previousPos.y
		};
		lastMovePosRef.current = currentPos;
		handleMoveCore(event, currentPos, movement);
		if (endAfterMove && !("touches" in event)) handleEnd(event);
	});
	const moveNative = useStableCallback((nativeEvent, currentTarget) => {
		handleMove({
			touches: nativeEvent.touches,
			currentTarget,
			nativeEvent,
			defaultPrevented: nativeEvent.defaultPrevented,
			timeStamp: nativeEvent.timeStamp
		});
	});
	const getDragStyles = import_react.useCallback(() => {
		const swiping = isSwipingRef.current;
		const dragOffset = dragOffsetRef.current;
		const initialTransform = initialTransformRef.current;
		const deltaX = dragOffset.x - initialTransform.x;
		const deltaY = dragOffset.y - initialTransform.y;
		if (!swiping && deltaX === 0 && deltaY === 0 && !dragDismissed) return {
			[movementCssVars.x]: "0px",
			[movementCssVars.y]: "0px"
		};
		return {
			transition: swiping ? "none" : void 0,
			transform: swiping ? getDragTransform(dragOffset, initialTransform.scale) : void 0,
			[movementCssVars.x]: `${deltaX}px`,
			[movementCssVars.y]: `${deltaY}px`
		};
	}, [dragDismissed, movementCssVars]);
	return {
		swiping: isSwiping,
		swipeDirection: currentSwipeDirection,
		dragDismissed,
		getPointerProps: import_react.useCallback(() => {
			if (!enabled) return {};
			return {
				onPointerDown: handleStart,
				onPointerMove: handleMove,
				onPointerUp: handleEnd,
				onPointerCancel: handleEnd
			};
		}, [
			enabled,
			handleEnd,
			handleMove,
			handleStart
		]),
		getTouchProps: import_react.useCallback(() => {
			if (!enabled) return {};
			return {
				onTouchStart: handleStart,
				onTouchMove: handleMove,
				onTouchEnd: handleEnd,
				onTouchCancel: handleEnd
			};
		}, [
			enabled,
			handleEnd,
			handleMove,
			handleStart
		]),
		moveNative,
		getDragStyles,
		reset
	};
}
//#endregion
//#region node_modules/@base-ui/react/drawer/title/DrawerTitle.mjs
/**
* A heading that labels the drawer.
* Renders an `<h2>` element.
*
* Documentation: [Base UI Drawer](https://base-ui.com/react/components/drawer)
*/
var DrawerTitle = DialogTitle;
//#endregion
//#region node_modules/@base-ui/react/drawer/trigger/DrawerTrigger.mjs
/**
* A button that opens the drawer.
* Renders a `<button>` element.
*
* Documentation: [Base UI Drawer](https://base-ui.com/react/components/drawer)
*/
var DrawerTrigger = DialogTrigger;
/**
* Present when the dialog has other open dialogs nested within it.
*/
var nestedDialogOpen = "data-nested-dialog-open";
//#endregion
//#region node_modules/@base-ui/react/drawer/virtual-keyboard-provider/DrawerVirtualKeyboardContext.mjs
var DrawerVirtualKeyboardContext = /*#__PURE__*/ import_react.createContext(void 0);
function useDrawerVirtualKeyboardContext() {
	return import_react.useContext(DrawerVirtualKeyboardContext);
}
//#endregion
//#region node_modules/@base-ui/react/drawer/viewport/DrawerViewport.mjs
var MIN_SWIPE_THRESHOLD = 10;
var FAST_SWIPE_VELOCITY = .5;
var SNAP_VELOCITY_THRESHOLD = .5;
var SNAP_VELOCITY_MULTIPLIER = 300;
var MAX_SNAP_VELOCITY = 4;
var MIN_SWIPE_RELEASE_VELOCITY = .2;
var MAX_SWIPE_RELEASE_VELOCITY = 4;
var MIN_SWIPE_RELEASE_DURATION_MS = 80;
var MAX_SWIPE_RELEASE_DURATION_MS = 360;
var MIN_SWIPE_RELEASE_SCALAR = .1;
var AXIS_LOCK_SLOP = 6;
var AXIS_LOCK_BIAS = 2;
var DRAWER_CONTENT_SELECTOR = `[${DRAWER_CONTENT_ATTRIBUTE}]`;
/**
* A positioning container for the drawer popup that can be made scrollable.
* Renders a `<div>` element.
*
* Documentation: [Base UI Drawer](https://base-ui.com/react/components/drawer)
*/
var DrawerViewport = /*#__PURE__*/ import_react.forwardRef(function DrawerViewport(props, forwardedRef) {
	const { render, className, style, children, ...elementProps } = props;
	const store = useDialogRootContext();
	const popupRef = store.context.popupRef;
	const backdropRef = store.context.backdropRef;
	const { swipeDirection, notifyParentSwipingChange, notifyParentSwipeProgressChange, frontmostHeight, snapToSequentialPoints, swipeAreaActiveRef } = useDrawerRootContext();
	const providerContext = useDrawerProviderContext();
	const { snapPoints, resolvedSnapPoints, activeSnapPoint, activeSnapPointOffset, setActiveSnapPoint, popupHeight } = useDrawerSnapPoints();
	const open = store.useState("open");
	const mounted = store.useState("mounted");
	const nested = store.useState("nested");
	const nestedOpenDrawerCount = store.useState("nestedOpenDrawerCount");
	const viewportElement = store.useState("viewportElement");
	const popupElementState = store.useState("popupElement");
	const visualStateStore = providerContext?.visualStateStore;
	const nestedDrawerOpen = nestedOpenDrawerCount > 0;
	const scrollAxis = swipeDirection === "left" || swipeDirection === "right" ? "horizontal" : "vertical";
	const isVerticalScrollAxis = scrollAxis === "vertical";
	const crossScrollAxis = isVerticalScrollAxis ? "horizontal" : "vertical";
	const [swipeRelease, setSwipeRelease] = import_react.useState(null);
	const pendingSwipeCloseSnapPointRef = import_react.useRef(void 0);
	const resetSwipeRef = import_react.useRef(null);
	const controlledDismissFrame = useAnimationFrame();
	const swipingRef = import_react.useRef(false);
	const nestedSwipeActiveRef = import_react.useRef(false);
	const lastPointerTypeRef = import_react.useRef("");
	const ignoreNextTouchStartFromPenRef = import_react.useRef(false);
	const ignoreTouchSwipeRef = import_react.useRef(false);
	const touchScrollStateRef = import_react.useRef(null);
	const virtualKeyboard = useDrawerVirtualKeyboardContext();
	const snapPointRange = import_react.useMemo(() => {
		if (!snapPoints || snapPoints.length < 2 || resolvedSnapPoints.length < 2 || swipeDirection !== "down" && swipeDirection !== "up") return null;
		const offsets = resolvedSnapPoints.map((point) => point.offset).sort((a, b) => a - b);
		const minOffset = offsets[0];
		return {
			minOffset,
			range: offsets[1] - minOffset
		};
	}, [
		resolvedSnapPoints,
		snapPoints,
		swipeDirection
	]);
	const snapPointProgress = import_react.useMemo(() => {
		if (!snapPointRange || activeSnapPointOffset === null) return null;
		return clamp((activeSnapPointOffset - snapPointRange.minOffset) / snapPointRange.range, 0, 1);
	}, [activeSnapPointOffset, snapPointRange]);
	const swipeDirections = import_react.useMemo(() => {
		if (snapPoints && snapPoints.length > 0 && (swipeDirection === "down" || swipeDirection === "up")) return swipeDirection === "down" ? ["down", "up"] : ["up", "down"];
		return [swipeDirection];
	}, [snapPoints, swipeDirection]);
	const setSwipeDismissed = useStableCallback((dismissed) => {
		popupRef.current?.toggleAttribute(swipeDismiss, dismissed);
		backdropRef.current?.toggleAttribute(swipeDismiss, dismissed);
	});
	const clearSwipeRelease = useStableCallback(() => {
		setSwipeDismissed(false);
		popupRef.current?.removeAttribute(endingStyle$2);
		setSwipeRelease(null);
	});
	const finishNestedSwipe = useStableCallback(() => {
		if (!nestedSwipeActiveRef.current) return;
		nestedSwipeActiveRef.current = false;
		notifyParentSwipingChange?.(false);
	});
	const applySwipeProgress = useStableCallback((resolvedProgress, shouldTrackProgress, notifyParent) => {
		const isActive = open && !nested && shouldTrackProgress;
		const swipeProgress$1 = isActive ? resolvedProgress : 0;
		const nestedSwipeProgress = open && shouldTrackProgress ? resolvedProgress : 0;
		if (notifyParent && notifyParentSwipeProgressChange) {
			notifyParentSwipeProgressChange(nestedSwipeProgress);
			if (nestedSwipeProgress <= 0) finishNestedSwipe();
		}
		visualStateStore?.set({
			swipeProgress: swipeProgress$1,
			frontmostHeight: swipeProgress$1 > 0 ? frontmostHeight : 0
		});
		const backdropElement = backdropRef.current;
		if (!backdropElement) return;
		const showProgress = isActive && swipeProgress$1 > 0;
		backdropElement.style.setProperty(swipeProgress, showProgress ? `${swipeProgress$1}` : "0");
		if (showProgress && frontmostHeight > 0) backdropElement.style.setProperty(height, `${frontmostHeight}px`);
		else backdropElement.style.removeProperty(height);
	});
	function resolveSwipeRelease(popupElement, direction, deltaX, deltaY, velocityX, velocityY, releaseVelocityX, releaseVelocityY) {
		const size = getBaseSwipeSize(popupElement, direction);
		if (size <= 0) return null;
		const translationAlongDirection = ((direction === "down" || direction === "up") && snapPoints && snapPoints.length > 0 ? activeSnapPointOffset ?? 0 : 0) + getDisplacement(direction, deltaX, deltaY);
		const remainingDistance = Math.max(0, size - translationAlongDirection);
		if (remainingDistance <= 0) return null;
		const releaseVelocity = getDisplacement(direction, releaseVelocityX, releaseVelocityY);
		const directionalVelocity = Math.abs(releaseVelocity) > 0 ? releaseVelocity : getDisplacement(direction, velocityX, velocityY);
		if (directionalVelocity <= MIN_SWIPE_RELEASE_VELOCITY) return null;
		const clampedVelocity = clamp(directionalVelocity, MIN_SWIPE_RELEASE_VELOCITY, MAX_SWIPE_RELEASE_VELOCITY);
		return MIN_SWIPE_RELEASE_SCALAR + (clamp(remainingDistance / clampedVelocity, MIN_SWIPE_RELEASE_DURATION_MS, MAX_SWIPE_RELEASE_DURATION_MS) - MIN_SWIPE_RELEASE_DURATION_MS) / 280 * .9;
	}
	function updateNestedSwipeActive(details) {
		if (nestedSwipeActiveRef.current || !details) return;
		const delta = getDisplacement(details.direction ?? swipeDirection, details.deltaX, details.deltaY);
		if (Math.abs(delta) < MIN_SWIPE_THRESHOLD) return;
		nestedSwipeActiveRef.current = true;
		notifyParentSwipingChange?.(true);
	}
	const swipe$1 = useSwipeDismiss({
		enabled: mounted && !nestedDrawerOpen,
		directions: swipeDirections,
		elementRef: store.context.popupRef,
		ignoreSelectorWhenTouch: false,
		ignoreScrollableAncestors: true,
		movementCssVars: {
			x: swipeMovementX,
			y: swipeMovementY
		},
		onSwipeStart(event) {
			if ("touches" in event || event.pointerType === "touch") return;
			const popupElement = popupRef.current;
			const selection = ownerDocument(popupElement).getSelection?.();
			if (!selection || selection.isCollapsed) return;
			const anchorElement = isElement(selection.anchorNode) ? selection.anchorNode : selection.anchorNode?.parentElement;
			const focusElement = isElement(selection.focusNode) ? selection.focusNode : selection.focusNode?.parentElement;
			if (!contains(popupElement, anchorElement) && !contains(popupElement, focusElement)) return;
			selection.removeAllRanges();
		},
		onSwipingChange(swiping) {
			swipingRef.current = swiping;
			setBackdropSwipingAttribute(store.context.backdropRef.current, swiping);
			if (!swiping && !notifyParentSwipeProgressChange) finishNestedSwipe();
		},
		swipeThreshold({ element, direction }) {
			return getBaseSwipeThreshold(element, direction);
		},
		canStart(position, details) {
			const popupElement = store.context.popupRef.current;
			if (!popupElement) return false;
			const doc = popupElement.ownerDocument;
			const elementAtPoint = getElementAtPoint(popupElement.getRootNode(), position.x, position.y);
			if (!elementAtPoint || !contains(popupElement, elementAtPoint)) return false;
			const nativeEvent = details.nativeEvent;
			if (("touches" in nativeEvent || nativeEvent.pointerType === "touch") && shouldIgnoreSwipeForTextSelection(doc, popupElement)) return false;
			return true;
		},
		onProgress(progress, details) {
			const swiping = swipingRef.current;
			if (swiping) updateNestedSwipeActive(details);
			const hasSnapPoints = Boolean(snapPoints && snapPoints.length > 0);
			if (swiping && swipeDirection === "down" && hasSnapPoints && details) {
				const popupElement = store.context.popupRef.current;
				if (popupElement) {
					popupElement.style.removeProperty("transform");
					popupElement.style.setProperty(swipeMovementY, `${getSnapPointSwipeMovement(activeSnapPointOffset ?? 0, details.deltaY)}px`);
				}
			}
			let resolvedProgress = progress;
			if (snapPointRange && popupHeight > 0) {
				const baseOffset = activeSnapPointOffset ?? snapPointRange.minOffset;
				const offsetToProgress = (nextOffset) => clamp((nextOffset - snapPointRange.minOffset) / snapPointRange.range, 0, 1);
				if (swiping && details && Number.isFinite(details.deltaY)) resolvedProgress = offsetToProgress(clamp(baseOffset + details.deltaY, 0, popupHeight));
				else if (snapPointProgress !== null) resolvedProgress = snapPointProgress;
			}
			if (!swiping) {
				notifyParentSwipeProgressChange?.(0);
				finishNestedSwipe();
			}
			applySwipeProgress(resolvedProgress, true, swiping);
		},
		onRelease({ event, deltaX, deltaY, direction, velocityX, velocityY, releaseVelocityX, releaseVelocityY }) {
			const popupElement = store.context.popupRef.current;
			if (!popupElement) {
				clearSwipeRelease();
				return;
			}
			const releasePopupElement = popupElement;
			function startSwipeRelease(resolvedDirection) {
				finishNestedSwipe();
				setSwipeDismissed(true);
				releasePopupElement.style.removeProperty("transition");
				releasePopupElement.setAttribute(endingStyle$2, "");
				import_react_dom.flushSync(() => {
					setSwipeRelease(resolveSwipeRelease(releasePopupElement, resolvedDirection, deltaX, deltaY, velocityX, velocityY, releaseVelocityX, releaseVelocityY));
				});
			}
			if (!snapPoints || snapPoints.length === 0) {
				if (!direction) {
					clearSwipeRelease();
					return;
				}
				const directionalDelta = getDisplacement(direction, deltaX, deltaY);
				if (directionalDelta <= 0) {
					clearSwipeRelease();
					return false;
				}
				if (getDisplacement(direction, velocityX, velocityY) >= FAST_SWIPE_VELOCITY) {
					startSwipeRelease(direction);
					return true;
				}
				const shouldClose = directionalDelta > getBaseSwipeThreshold(releasePopupElement, direction);
				if (shouldClose) startSwipeRelease(direction);
				else clearSwipeRelease();
				return shouldClose;
			}
			if (swipeDirection !== "down" && swipeDirection !== "up") {
				clearSwipeRelease();
				return;
			}
			if (!popupHeight) {
				clearSwipeRelease();
				return false;
			}
			if (resolvedSnapPoints.length === 0) {
				clearSwipeRelease();
				return;
			}
			const dragDelta = swipeDirection === "down" ? deltaY : -deltaY;
			const dragDirection = Math.sign(dragDelta);
			const releaseDirectionalVelocity = swipeDirection === "down" ? releaseVelocityY : -releaseVelocityY;
			const fallbackDirectionalVelocity = swipeDirection === "down" ? velocityY : -velocityY;
			let resolvedDirectionalVelocity = releaseDirectionalVelocity;
			if (dragDirection !== 0 && Math.abs(dragDelta) >= MIN_SWIPE_THRESHOLD) {
				const velocityDirection = Math.sign(resolvedDirectionalVelocity);
				if (velocityDirection !== 0 && velocityDirection !== dragDirection) resolvedDirectionalVelocity = fallbackDirectionalVelocity;
			}
			const currentOffset = activeSnapPointOffset ?? 0;
			const dragTargetOffset = clamp(currentOffset + dragDelta, 0, popupHeight);
			const velocityOffset = Math.abs(resolvedDirectionalVelocity) >= SNAP_VELOCITY_THRESHOLD ? clamp(resolvedDirectionalVelocity, -4, MAX_SNAP_VELOCITY) * SNAP_VELOCITY_MULTIPLIER : 0;
			const targetOffset = snapToSequentialPoints ? dragTargetOffset : clamp(dragTargetOffset + velocityOffset, 0, popupHeight);
			const snapPointEventDetails = createChangeEventDetails(swipe, event);
			const settleInPlace = () => {
				applySwipeProgress(0, true, true);
				clearSwipeRelease();
				return false;
			};
			const settleOnSnapPoint = (snapPoint) => {
				setActiveSnapPoint(snapPoint.value, snapPointEventDetails);
				return settleInPlace();
			};
			const closeFromSnapPoints = (fallbackSnapPoint) => {
				if (!direction) return settleOnSnapPoint(fallbackSnapPoint);
				setActiveSnapPoint(null, snapPointEventDetails);
				if (snapPointEventDetails.isCanceled) return settleInPlace();
				pendingSwipeCloseSnapPointRef.current = activeSnapPoint;
				startSwipeRelease(swipeDirection);
				return true;
			};
			if (snapToSequentialPoints) {
				const orderedSnapPoints = [...resolvedSnapPoints].sort((first, second) => first.offset - second.offset);
				const orderedOffsets = orderedSnapPoints.map((point) => point.offset);
				const currentIndex = closestSnapPointIndex(orderedOffsets, currentOffset);
				let targetSnapPoint = orderedSnapPoints[closestSnapPointIndex(orderedOffsets, targetOffset)];
				const velocityDirection = Math.sign(resolvedDirectionalVelocity);
				const shouldAdvance = dragDirection !== 0 && velocityDirection !== 0 && velocityDirection === dragDirection && Math.abs(resolvedDirectionalVelocity) >= SNAP_VELOCITY_THRESHOLD;
				let effectiveTargetOffset = targetOffset;
				if (shouldAdvance) {
					const adjacentIndex = clamp(currentIndex + dragDirection, 0, orderedSnapPoints.length - 1);
					if (adjacentIndex !== currentIndex) {
						const adjacentPoint = orderedSnapPoints[adjacentIndex];
						if (dragDirection > 0 ? targetOffset < adjacentPoint.offset : targetOffset > adjacentPoint.offset) {
							targetSnapPoint = adjacentPoint;
							effectiveTargetOffset = adjacentPoint.offset;
						}
					} else if (dragDirection > 0) return closeFromSnapPoints(targetSnapPoint);
				}
				if (Math.abs(effectiveTargetOffset - popupHeight) < Math.abs(effectiveTargetOffset - targetSnapPoint.offset)) return closeFromSnapPoints(targetSnapPoint);
				return settleOnSnapPoint(targetSnapPoint);
			}
			const closestSnapPoint = resolvedSnapPoints[closestSnapPointIndex(resolvedSnapPoints.map((point) => point.offset), targetOffset)];
			if (resolvedDirectionalVelocity >= FAST_SWIPE_VELOCITY && dragDelta > 0) return closeFromSnapPoints(closestSnapPoint);
			if (Math.abs(targetOffset - popupHeight) < Math.abs(targetOffset - closestSnapPoint.offset)) return closeFromSnapPoints(closestSnapPoint);
			return settleOnSnapPoint(closestSnapPoint);
		},
		onDismiss(event) {
			visualStateStore?.set({
				swipeProgress: 0,
				frontmostHeight: 0
			});
			const backdropElement = store.context.backdropRef.current;
			if (backdropElement) {
				backdropElement.style.setProperty(swipeProgress, "0");
				backdropElement.style.removeProperty(height);
			}
			const dismissEventDetails = createChangeEventDetails(swipe, event);
			store.setOpen(false, dismissEventDetails);
			if (dismissEventDetails.isCanceled) {
				const pendingSnapPoint = pendingSwipeCloseSnapPointRef.current;
				if (pendingSnapPoint !== void 0) setActiveSnapPoint(pendingSnapPoint, createChangeEventDetails(swipe, event));
				pendingSwipeCloseSnapPointRef.current = void 0;
				resetSwipeRef.current?.();
				clearSwipeRelease();
				return;
			}
			if (store.select("open")) {
				const savedEvent = event;
				controlledDismissFrame.request(() => {
					if (store.select("open")) {
						const pendingSnapPoint = pendingSwipeCloseSnapPointRef.current;
						if (pendingSnapPoint !== void 0) setActiveSnapPoint(pendingSnapPoint, createChangeEventDetails(swipe, savedEvent));
						pendingSwipeCloseSnapPointRef.current = void 0;
						clearSwipeRelease();
						resetSwipeRef.current?.();
					} else pendingSwipeCloseSnapPointRef.current = void 0;
				});
				return;
			}
			pendingSwipeCloseSnapPointRef.current = void 0;
			setSwipeDismissed(true);
		}
	});
	const swipePointerProps = swipe$1.getPointerProps();
	const swipeTouchProps = swipe$1.getTouchProps();
	const { moveNative: moveSwipeNative, reset: resetSwipe } = swipe$1;
	resetSwipeRef.current = resetSwipe;
	import_react.useEffect(() => {
		const rootElement = viewportElement ?? popupElementState;
		if (!rootElement) return;
		const resolvedRootElement = rootElement;
		const doc = ownerDocument(resolvedRootElement);
		function processTouchMove(event, touchState, touch) {
			const drawerAxisDelta = isVerticalScrollAxis ? touch.clientY - touchState.lastY : touch.clientX - touchState.lastX;
			if (event.touches.length === 2) return;
			if (shouldIgnoreSwipeForTextSelection(doc, resolvedRootElement) || !open || !mounted || nestedDrawerOpen) return;
			if (shouldYieldTouchMove(touchState, event, touch, isVerticalScrollAxis)) return;
			const scrollTarget = touchState.scrollTarget;
			if (!scrollTarget || scrollTarget === doc.documentElement || scrollTarget === doc.body) {
				if (event.cancelable) event.preventDefault();
				event.stopPropagation();
				moveSwipeNative(event, resolvedRootElement);
				return;
			}
			if (!hasScrollableContentOnAxis(scrollTarget, scrollAxis)) {
				if (event.cancelable) event.preventDefault();
				event.stopPropagation();
				return;
			}
			if (drawerAxisDelta !== 0) {
				const canSwipeFromScrollEdge = canSwipeFromScrollEdgeOnMove(scrollTarget, scrollAxis, swipeDirection, drawerAxisDelta);
				if (!touchState.allowSwipe) {
					if (event.cancelable && canSwipeFromScrollEdge) {
						touchState.allowSwipe = true;
						event.preventDefault();
					} else touchState.allowSwipe = false;
				} else if (event.cancelable) event.preventDefault();
			}
			if (touchState.allowSwipe === true) {
				event.stopPropagation();
				moveSwipeNative(event, resolvedRootElement);
			}
		}
		function handleNativeTouchMove(event) {
			virtualKeyboard?.onTouchMove(event);
			if (ignoreTouchSwipeRef.current) return;
			const touchState = touchScrollStateRef.current;
			const touch = event.touches[0];
			if (!touch || !touchState) return;
			processTouchMove(event, touchState, touch);
			updateTouchScrollPosition(touchState, touch);
		}
		return addEventListener(doc, "touchmove", handleNativeTouchMove, {
			passive: false,
			capture: true
		});
	}, [
		mounted,
		nestedDrawerOpen,
		open,
		popupElementState,
		isVerticalScrollAxis,
		scrollAxis,
		swipeDirection,
		moveSwipeNative,
		viewportElement,
		virtualKeyboard
	]);
	useIsoLayoutEffect(() => {
		if (!snapPointRange || swipe$1.swiping) return;
		applySwipeProgress(!open || nested ? 0 : snapPointProgress ?? 0, true, false);
	}, [
		applySwipeProgress,
		frontmostHeight,
		nested,
		notifyParentSwipeProgressChange,
		open,
		snapPointProgress,
		snapPointRange,
		swipe$1.swiping,
		store,
		visualStateStore
	]);
	useIsoLayoutEffect(() => {
		if (!notifyParentSwipeProgressChange) return;
		if (!open) notifyParentSwipeProgressChange(0);
		return () => {
			notifyParentSwipeProgressChange(0);
		};
	}, [notifyParentSwipeProgressChange, open]);
	useIsoLayoutEffect(() => {
		if (open) {
			if (!swipeAreaActiveRef.current) resetSwipe();
			clearSwipeRelease();
		}
	}, [
		clearSwipeRelease,
		open,
		resetSwipe,
		swipeAreaActiveRef
	]);
	useIsoLayoutEffect(() => {
		const backdropElement = backdropRef.current;
		return () => {
			visualStateStore?.set({
				swipeProgress: 0,
				frontmostHeight: 0
			});
			setBackdropSwipingAttribute(backdropElement, false);
			const currentBackdrop = backdropRef.current;
			if (currentBackdrop !== backdropElement) setBackdropSwipingAttribute(currentBackdrop, false);
			finishNestedSwipe();
		};
	}, [
		backdropRef,
		finishNestedSwipe,
		visualStateStore
	]);
	const swipeProviderValue = import_react.useMemo(() => ({
		swiping: swipe$1.swiping,
		getDragStyles: swipe$1.getDragStyles,
		swipeStrength: swipeRelease ?? null,
		setSwipeDismissed
	}), [
		setSwipeDismissed,
		swipe$1.getDragStyles,
		swipe$1.swiping,
		swipeRelease
	]);
	function resetTouchSwipeState(ignoreSwipe) {
		ignoreTouchSwipeRef.current = ignoreSwipe;
		touchScrollStateRef.current = null;
	}
	function resetTouchTrackingState() {
		resetTouchSwipeState(false);
		lastPointerTypeRef.current = "";
		ignoreNextTouchStartFromPenRef.current = false;
	}
	function handlePointerEnd(event) {
		lastPointerTypeRef.current = "";
		return event.pointerType !== "touch";
	}
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(DialogViewport, {
		ref: forwardedRef,
		className,
		style,
		render,
		...mergeProps(elementProps, {
			onPointerDown(event) {
				lastPointerTypeRef.current = event.pointerType;
				ignoreNextTouchStartFromPenRef.current = event.pointerType === "pen";
				if (!open || !mounted || nestedDrawerOpen) return;
				const elementAtPoint = getElementAtPoint(event.currentTarget.getRootNode(), event.clientX, event.clientY);
				if (isSwipeIgnoredTarget(elementAtPoint) || isDrawerContentTarget(elementAtPoint)) return;
				if (event.pointerType === "touch") return;
				swipePointerProps.onPointerDown?.(event);
			},
			onPointerMove(event) {
				if (event.pointerType === "touch") return;
				swipePointerProps.onPointerMove?.(event);
			},
			onPointerUp(event) {
				if (handlePointerEnd(event)) swipePointerProps.onPointerUp?.(event);
			},
			onPointerCancel(event) {
				if (handlePointerEnd(event)) swipePointerProps.onPointerCancel?.(event);
			},
			onTouchStart(event) {
				if (lastPointerTypeRef.current === "pen" && ignoreNextTouchStartFromPenRef.current) {
					ignoreNextTouchStartFromPenRef.current = false;
					resetTouchSwipeState(false);
					return;
				}
				if (!open || !mounted || nestedDrawerOpen) {
					resetTouchSwipeState(false);
					return;
				}
				const touch = event.touches[0];
				if (!touch) return;
				if (isReactTouchEventOnRangeInput(event)) {
					resetTouchSwipeState(false);
					return;
				}
				const rootElement = event.currentTarget;
				const elementAtPoint = getElementAtPoint(rootElement.getRootNode(), touch.clientX, touch.clientY);
				const eventTarget = getTarget(event.nativeEvent);
				const target = isElement(eventTarget) ? eventTarget : rootElement;
				if (!contains(rootElement, target)) {
					resetTouchSwipeState(true);
					return;
				}
				virtualKeyboard?.onTouchStart(event);
				if (isSwipeIgnoredTarget(elementAtPoint)) {
					resetTouchSwipeState(true);
					return;
				}
				ignoreTouchSwipeRef.current = false;
				const scrollTarget = findScrollableTouchTarget(target, rootElement, scrollAxis);
				const hasCrossAxisScrollableContent = findScrollableTouchTarget(target, rootElement, crossScrollAxis) != null;
				let allowSwipe = null;
				if (scrollTarget) allowSwipe = isAtSwipeStartEdge(scrollTarget, scrollAxis, swipeDirection) ? null : false;
				touchScrollStateRef.current = {
					startX: touch.clientX,
					startY: touch.clientY,
					lastX: touch.clientX,
					lastY: touch.clientY,
					scrollTarget,
					hasCrossAxisScrollableContent,
					allowSwipe,
					preserveNativeCrossAxisScroll: false,
					drawerAxisAttributed: false
				};
				swipeTouchProps.onTouchStart?.(event);
			},
			onTouchEnd(event) {
				virtualKeyboard?.onTouchEnd(event);
				resetTouchTrackingState();
				swipeTouchProps.onTouchEnd?.(event);
			},
			onTouchCancel(event) {
				virtualKeyboard?.onTouchCancel();
				resetTouchTrackingState();
				swipeTouchProps.onTouchCancel?.(event);
			},
			[nestedDialogOpen]: void 0
		}),
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(DrawerViewportContext.Provider, {
			value: swipeProviderValue,
			children
		})
	});
});
function setBackdropSwipingAttribute(backdropElement, swiping$1) {
	backdropElement?.toggleAttribute(swiping, swiping$1);
}
function isSwipeIgnoredTarget(target) {
	return Boolean(target?.closest(BASE_UI_SWIPE_IGNORE_SELECTOR));
}
function isDrawerContentTarget(target) {
	return Boolean(target?.closest(DRAWER_CONTENT_SELECTOR));
}
function getBaseSwipeSize(element, direction) {
	return direction === "left" || direction === "right" ? element.offsetWidth : element.offsetHeight;
}
function getBaseSwipeThreshold(element, direction) {
	return Math.max(getBaseSwipeSize(element, direction) * .5, MIN_SWIPE_THRESHOLD);
}
function isRangeInput(target, win) {
	return target instanceof win.HTMLInputElement && target.type === "range";
}
function isTextSelectionControl(target) {
	return target.tagName === "INPUT" || target.tagName === "TEXTAREA";
}
function hasExpandedSelectionWithinTarget(selection, target) {
	const anchorElement = isElement(selection.anchorNode) ? selection.anchorNode : selection.anchorNode?.parentElement;
	const focusElement = isElement(selection.focusNode) ? selection.focusNode : selection.focusNode?.parentElement;
	return selection.containsNode(target, true) || contains(target, anchorElement) || contains(target, focusElement);
}
function shouldIgnoreSwipeForTextSelection(doc, rootElement) {
	const activeEl = activeElement(doc);
	if (activeEl && contains(rootElement, activeEl) && isTextSelectionControl(activeEl)) {
		const { selectionStart, selectionEnd } = activeEl;
		if (selectionStart != null && selectionEnd != null && selectionStart < selectionEnd) return true;
	}
	const selection = doc.getSelection?.();
	if (!selection || selection.isCollapsed) return false;
	return hasExpandedSelectionWithinTarget(selection, rootElement);
}
function isEventOnRangeInput(event, win) {
	return event.composedPath().some((pathTarget) => isRangeInput(pathTarget, win));
}
function isReactTouchEventOnRangeInput(event) {
	return isEventOnRangeInput(event.nativeEvent, getWindow(event.currentTarget));
}
function updateTouchScrollPosition(touchState, touch) {
	touchState.lastX = touch.clientX;
	touchState.lastY = touch.clientY;
}
/**
* Arbitrates a touchmove between the drawer swipe and a native cross-axis scroll.
* Returns `true` when the move must be left alone — either because the cross axis already won the
* gesture, or because neither axis has passed the slop yet and the gesture cannot be attributed.
*/
function shouldYieldTouchMove(touchState, event, touch, isVerticalScrollAxis) {
	if (touchState.preserveNativeCrossAxisScroll) return true;
	if (touchState.drawerAxisAttributed || touchState.allowSwipe === true || !touchState.hasCrossAxisScrollableContent) return false;
	if (!event.cancelable) {
		touchState.preserveNativeCrossAxisScroll = true;
		return true;
	}
	const drawerAxisGestureDelta = isVerticalScrollAxis ? touch.clientY - touchState.startY : touch.clientX - touchState.startX;
	const crossAxisGestureDelta = isVerticalScrollAxis ? touch.clientX - touchState.startX : touch.clientY - touchState.startY;
	const absDrawerAxisGestureDelta = Math.abs(drawerAxisGestureDelta);
	const absCrossAxisGestureDelta = Math.abs(crossAxisGestureDelta);
	if (absCrossAxisGestureDelta >= AXIS_LOCK_SLOP && absCrossAxisGestureDelta > absDrawerAxisGestureDelta + AXIS_LOCK_BIAS) {
		touchState.preserveNativeCrossAxisScroll = true;
		return true;
	}
	if (absDrawerAxisGestureDelta >= AXIS_LOCK_SLOP) {
		touchState.drawerAxisAttributed = true;
		return false;
	}
	return true;
}
function hasScrollableContentOnAxis(scrollTarget, axis) {
	return getScrollMetrics(scrollTarget, axis).max > 0;
}
function getScrollMetrics(scrollTarget, axis) {
	if (axis === "vertical") {
		const max = Math.max(0, scrollTarget.scrollHeight - scrollTarget.clientHeight);
		return {
			offset: scrollTarget.scrollTop,
			max
		};
	}
	const max = Math.max(0, scrollTarget.scrollWidth - scrollTarget.clientWidth);
	return {
		offset: scrollTarget.scrollLeft,
		max
	};
}
function isAtSwipeStartEdge(scrollTarget, axis, direction) {
	const dismissFromStartEdge = shouldDismissFromStartEdge(direction, axis);
	const { offset, max } = getScrollMetrics(scrollTarget, axis);
	return dismissFromStartEdge ? offset <= 0 : offset >= max;
}
function canSwipeFromScrollEdgeOnMove(scrollTarget, axis, direction, delta) {
	if (!(shouldDismissFromStartEdge(direction, axis) ? delta > 0 : delta < 0)) return false;
	return isAtSwipeStartEdge(scrollTarget, axis, direction);
}
function shouldDismissFromStartEdge(direction, axis) {
	return axis === "vertical" ? direction === "down" : direction === "right";
}
//#endregion
//#region node_modules/@base-ui/react/drawer/handle.mjs
/**
* Controls a Drawer imperatively and associates detached `Drawer.Trigger` components with a
* `Drawer.Root`. Create one with `Drawer.createHandle()` and pass it to the `handle` prop of the
* root and of any triggers rendered outside of it.
*
* The imperative methods take effect only while a root using this handle is mounted; calls made
* before a root attaches (or after it unmounts) are ignored.
*/
var DrawerHandle = class extends DialogHandle {};
/**
* Creates a new handle to connect a Drawer.Root with detached Drawer.Trigger components.
*/
function createDrawerHandle() {
	return new DrawerHandle();
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/glass/slots/sidebar.js
var drawerHandle = createDrawerHandle();
var itemTriggerVariants = cva("inline-flex items-center gap-2 rounded-lg px-2.5 py-2 md:py-1.5 [&_svg]:size-4 outline-none focus-visible:ring-2 focus-visible:ring-fd-ring", { variants: { active: {
	true: "bg-fd-primary/10 text-fd-primary",
	false: "text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground"
} } });
var Context = (0, import_react.createContext)(null);
function SidebarProvider({ children, collapsible = true }) {
	const [collapsed, setCollapsed] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Context, {
		value: (0, import_react.useMemo)(() => ({
			collapsible,
			collapsed,
			setCollapsed
		}), [collapsible, collapsed]),
		children
	});
}
function useSidebar() {
	const v = (0, import_react.use)(Context);
	if (!v) throw new Error("Missing <SidebarProvider />");
	return v;
}
function SidebarDrawer({ contentProps }) {
	const { menuItems, props: { aiChat }, slots } = useGlassLayout();
	const { root } = useTreeContext();
	const t = useTranslations();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerRoot, {
		handle: drawerHandle,
		swipeDirection: "right",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerPortal, {
			className: "z-40",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerBackdrop, { className: "[--bleed:3rem] fixed inset-0 min-h-dvh bg-fd-overlay backdrop-blur-sm opacity-[calc(1-var(--drawer-swipe-progress))] transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0 data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] supports-[-webkit-touch-callout:none]:absolute" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerViewport, {
				className: "[--viewport-padding:0px] supports-[-webkit-touch-callout:none]:[--viewport-padding:0.625rem] fixed inset-0 flex items-stretch justify-end p-(--viewport-padding)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerPopup, {
					id: "nd-mobile-sidebar",
					className: cn("relative [--bleed:3rem] supports-[-webkit-touch-callout:none]:[--bleed:0px] w-[360px] h-full max-w-[calc(100vw-3rem+var(--bleed))] pr-(--bleed) -mr-(--bleed) border-l bg-fd-background text-fd-foreground text-[0.9375rem] outline-none shadow-md touch-auto [transform:translateX(var(--drawer-swipe-movement-x))] transition-transform duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:select-none data-ending-style:[transform:translateX(calc(100%-var(--bleed)+var(--viewport-padding)+2px))] data-starting-style:[transform:translateX(calc(100%-var(--bleed)+var(--viewport-padding)+2px))] supports-[-webkit-touch-callout:none]:border supports-[-webkit-touch-callout:none]:rounded-xl", "[scrollbar-width:none] overflow-y-auto"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerContent, {
						...contentProps,
						className: cn("flex flex-col min-h-full px-3", contentProps?.className),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "sticky flex flex-col gap-2 top-0 pt-4 pb-2 bg-fd-background shadow-lg shadow-fd-background",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5 ps-2.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerTitle, { render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.navTitle, { className: "flex items-center font-semibold gap-2 flex-1" }) }),
										aiChat && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											className: cn(buttonVariants({
												variant: "secondary",
												size: "sm"
											}), "rounded-full h-8 gap-1.5"),
											onClick: () => {
												aiChat.onOpenChange(!aiChat.open);
												drawerHandle.close();
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4 text-fd-muted-foreground" }), t("Ask AI", { note: "AI chat button" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerClose, {
											"aria-label": t("Close Sidebar", { note: "aria-label" }),
											className: cn(buttonVariants({
												variant: "secondary",
												size: "icon-sm"
											}), "rounded-full"),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
										})
									]
								}), slots.languageSelect && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(slots.languageSelect.root, {
									variant: "secondary",
									className: "px-2.5 gap-2 rounded-lg",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Languages, { className: "size-4 text-fd-muted-foreground shrink-0" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.languageSelect.text, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsUpDown, { className: "ms-auto size-3.5 text-fd-muted-foreground shrink-0" })
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col py-2 flex-1",
								children: [menuItems.map((item, i) => item.type !== "icon" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarLinkItem, { item }, i)), root.children.map((item, i) => (0, import_react.cloneElement)(renderNode(item), { key: i }))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center sticky bottom-0 bg-fd-background px-1 pt-2 pb-4 border-t mt-2 empty:hidden",
								children: [menuItems.map((item, i) => item.type === "icon" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarIconLinkItem, { item }, i)), slots.themeSwitch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.themeSwitch, { className: "p-0 ms-auto" })]
							})
						]
					})
				})
			})]
		})
	});
}
function Sidebar({ className, children, ...props }) {
	const { menuItems, props: { tabs }, slots } = useGlassLayout();
	const { root } = useTreeContext();
	const { collapsible, collapsed, setCollapsed } = useSidebar();
	const t = useTranslations({ note: "sidebar" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		id: "nd-sidebar",
		className: cn("sticky flex flex-col transition-transform [grid-area:left] my-2 ms-2 z-30 top-2 border rounded-2xl bg-fd-popover/80 text-fd-popover-foreground text-sm backdrop-blur-sm shadow-sm h-[calc(100dvh---spacing(4))] max-md:hidden md:layout:[--fd-left-width:280px]", collapsed && "w-[calc(280px---spacing(2))] -translate-x-[280px] md:layout:[--fd-left-width:0px]", className),
		...props,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-1 pt-4 ps-4.5 pe-3.5 empty:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.navTitle, { className: "flex text-sm items-center font-semibold gap-2 me-auto" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex -mt-1.5 -me-1.5 empty:hidden",
					children: [menuItems.map((item, i) => item.type === "icon" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarIconLinkItem, { item }, i)), collapsible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						"aria-label": collapsed ? t("Show Sidebar") : t("Hide Sidebar"),
						className: cn(buttonVariants({
							variant: "ghost",
							size: "icon-sm"
						}), "text-fd-muted-foreground"),
						onClick: () => setCollapsed(!collapsed),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, {})
					})]
				})]
			}),
			tabs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutTabsDropdown, {
				tabs,
				className: "min-w-0 bg-fd-secondary text-fd-secondary-foreground rounded-xl px-2.5 py-2 [&_svg]:size-4 border rounded-xl shadow-sm mx-2 mt-2.5 empty:hidden"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "min-h-0 flex-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrollViewport, {
					className: "flex flex-col p-2 [mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent))]",
					children: [menuItems.map((item, i) => item.type !== "icon" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarLinkItem, { item }, i)), root.children.map((item, i) => (0, import_react.cloneElement)(renderNode(item), { key: i }))]
				})
			}),
			children
		]
	});
}
function SidebarIconLinkItem({ item, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		href: item.url,
		external: item.external,
		"aria-label": item.label,
		className: cn(buttonVariants({
			variant: "ghost",
			size: "icon-sm"
		}), "text-fd-muted-foreground", className),
		onClick: () => {
			drawerHandle.close();
		},
		children: item.icon
	});
}
function SidebarLinkItem({ item, className }) {
	const pathname = usePathname();
	const [open, setOpen] = (0, import_react.useState)(true);
	switch (item.type) {
		case "custom": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className,
			children: item.children
		});
		case "menu": {
			const rightIcon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("ms-auto text-fd-muted-foreground size-3.5! transition-transform", !open && "-rotate-90") });
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Collapsible, {
				open,
				onOpenChange: setOpen,
				className: cn("mt-4 first:mt-0", className),
				children: [item.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex w-full px-2.5 py-1.5 font-medium",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						href: item.url,
						external: item.external,
						className: cn("inline-flex items-center gap-2 [&_svg]:size-4", isLinkItemActive(item, pathname) ? "text-fd-primary" : "hover:underline hover:decoration-fd-muted-foreground hover:underline-offset-4 hover:decoration-dashed hover:text-fd-accent-foreground"),
						onClick: () => {
							drawerHandle.close();
						},
						children: [item.icon, item.text]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleTrigger, {
						className: "flex-1",
						children: rightIcon
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CollapsibleTrigger, {
					className: "w-full px-2.5 py-1.5 font-medium inline-flex items-center gap-2 [&_svg]:size-4",
					children: [
						item.icon,
						item.text,
						rightIcon
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleContent, {
					className: "flex flex-col",
					children: item.items.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarLinkItem, { item }, i))
				})]
			});
		}
		default: return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			href: item.url,
			external: item.external,
			className: cn(itemTriggerVariants({
				active: isLinkItemActive(item, pathname),
				className
			})),
			onClick: () => {
				drawerHandle.close();
			},
			children: [item.icon, item.text]
		});
	}
}
function renderNode(node) {
	if (node.type === "page") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarItem, { item: node });
	if (node.type === "folder") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarFolder, { folder: node });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "mt-4 w-full px-2.5 py-1.5 font-medium inline-flex items-center gap-2 [&_svg]:size-4 empty:hidden first:mt-0",
		children: [node.icon, node.name]
	});
}
function SidebarItem({ item }) {
	const path = useTreePath();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		href: item.url,
		external: item.external,
		className: itemTriggerVariants({ active: isNodeInPath(item, path) }),
		onClick: () => {
			drawerHandle.close();
		},
		children: [item.icon, item.name]
	});
}
function SidebarFolder({ folder }) {
	const path = useTreePath();
	const shouldOpen = (folder.defaultOpen ?? true) || isNodeInPath(folder, path);
	const [open, setOpen] = (0, import_react.useState)(shouldOpen);
	useOnChange(shouldOpen, () => shouldOpen && setOpen(true));
	if (folder.collapsible === false) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [folder.index ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		href: folder.index.url,
		external: folder.index.external,
		className: cn("inline-flex px-2.5 py-1.5 font-medium items-center gap-2 [&_svg]:size-4 mt-4 first:mt-0", isNodeInPath(folder.index, path) ? "text-fd-primary" : "hover:underline hover:decoration-fd-muted-foreground hover:underline-offset-4 hover:decoration-dashed hover:text-fd-accent-foreground"),
		onClick: () => {
			drawerHandle.close();
		},
		children: [folder.icon, folder.name]
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full px-3 py-1.5 font-medium inline-flex items-center gap-2 [&_svg]:size-4 mt-4 first:mt-0",
		children: [folder.icon, folder.name]
	}), folder.children.map((item, i) => (0, import_react.cloneElement)(renderNode(item), { key: i }))] });
	const rightIcon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("ms-auto text-fd-muted-foreground size-3.5! transition-transform", !open && "-rotate-90") });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Collapsible, {
		open,
		onOpenChange: setOpen,
		className: "mt-4 first:mt-0",
		children: [folder.index ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full px-2.5 py-1.5 font-medium",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				href: folder.index.url,
				external: folder.index.external,
				className: cn("inline-flex items-center gap-2 [&_svg]:size-4", isNodeInPath(folder.index, path) ? "text-fd-primary" : "hover:underline hover:decoration-fd-muted-foreground hover:underline-offset-4 hover:decoration-dashed hover:text-fd-accent-foreground"),
				onClick: () => {
					drawerHandle.close();
				},
				children: [folder.icon, folder.name]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleTrigger, {
				className: "flex-1",
				children: rightIcon
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CollapsibleTrigger, {
			className: "w-full px-2.5 py-1.5 font-medium inline-flex items-center gap-2 [&_svg]:size-4",
			children: [
				folder.icon,
				folder.name,
				rightIcon
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleContent, {
			className: "flex flex-col",
			children: folder.children.map((item, i) => (0, import_react.cloneElement)(renderNode(item), { key: i }))
		})]
	});
}
function isNodeInPath(node, path) {
	return path.some((other) => other.$id === node.$id || other === node);
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/glass/slots/header.js
var baseVariants = "rounded-full bg-fd-popover/80 text-fd-popover-foreground border backdrop-blur-sm shadow-sm";
function Header({ className, ...props }) {
	const { props: { tabs, aiChat }, slots } = useGlassLayout();
	const t = useTranslations();
	const sidebar = slots.sidebar.use();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("sticky flex flex-row justify-end gap-2 [grid-area:left-margin/left-margin/right/right] z-20 px-4 md:top-0 md:pt-2 md:px-2 md:h-12 md:bg-linear-to-b md:from-fd-background max-md:bottom-0 max-md:mt-auto max-md:h-16 max-md:pb-4 max-md:bg-linear-to-t max-md:from-fd-background", className),
		...props,
		children: [
			sidebar.collapsible && sidebar.collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				"aria-label": t("Show Sidebar", { note: "sidebar" }),
				className: cn(buttonVariants({
					size: "icon-sm",
					variant: "secondary"
				}), baseVariants, "size-10 me-auto shrink-0 max-md:hidden"),
				onClick: () => sidebar.setCollapsed(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, {})
			}),
			slots.searchTrigger && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.searchTrigger.sm, {
				color: "secondary",
				size: "icon",
				className: cn(baseVariants, "size-12 shrink-0 md:hidden")
			}),
			tabs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutTabsDropdown, {
				tabs,
				size: "lg",
				className: cn(baseVariants, "min-w-0 ps-4 pe-3 flex-1 [&_svg]:size-5 md:hidden")
			}),
			slots.searchTrigger && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "@container flex justify-end flex-1 max-md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.searchTrigger.full, { className: cn(baseVariants, "text-fd-muted-foreground ps-3 w-full @sm:max-w-[200px]") })
			}),
			aiChat && !aiChat.open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: cn(buttonVariants({ variant: "secondary" }), baseVariants, "px-3 gap-2 text-fd-muted-foreground shrink-0 max-md:hidden"),
				onClick: () => aiChat.onOpenChange(true),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" }), t("Ask AI", { note: "AI chat button" })]
			}),
			slots.languageSelect && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(slots.languageSelect.root, {
				className: cn(baseVariants, "px-3 rounded-full max-md:hidden"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Languages, { className: "size-4 text-fd-muted-foreground shrink-0" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.languageSelect.text, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsUpDown, { className: "size-3.5 text-fd-muted-foreground shrink-0" })
				]
			}),
			slots.themeSwitch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.themeSwitch, { className: cn(baseVariants, "shrink-0 px-1.5 max-md:hidden") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerTrigger, {
				handle: slots.sidebar.drawerHandle,
				render: (props, { open }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					...props,
					className: cn(buttonVariants({
						variant: "secondary",
						size: "icon"
					}), baseVariants, "shrink-0 size-12 md:hidden"),
					"aria-label": open ? t("Close Sidebar", { note: "aria-label" }) : t("Open Sidebar", { note: "aria-label" }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, {})
				})
			})
		]
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/glass/index.js
var LayoutContext = (0, import_react.createContext)(null);
function useGlassLayout() {
	const context = (0, import_react.use)(LayoutContext);
	if (!context) throw new Error("Please use Glass layout components under <GlassLayout /> (`fumadocs-ui/layouts/glass`).");
	return context;
}
var { useBaseSlots } = baseSlots({ useProps() {
	return useGlassLayout().props;
} });
function GlassLayout(props) {
	const { tree, tabs: defaultTabs, aiChat, children, slots: defaultSlots = {} } = props;
	const linkItems = useLinkItems(props);
	const { baseSlots, baseProps } = useBaseSlots(props);
	const tabs = (0, import_react.useMemo)(() => {
		if (Array.isArray(defaultTabs)) return defaultTabs;
		if (typeof defaultTabs === "object") return getLayoutTabs(tree, defaultTabs);
		if (defaultTabs !== false) return getLayoutTabs(tree);
		return [];
	}, [tree, defaultTabs]);
	const slots = {
		...baseSlots,
		header: defaultSlots.header ?? Header,
		sidebar: defaultSlots.sidebar ?? {
			drawer: SidebarDrawer,
			drawerHandle,
			main: Sidebar,
			provider: SidebarProvider,
			use: useSidebar
		}
	};
	const leftSpace = "calc(50% - var(--fd-main-width)/2 - var(--fd-left-width))";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutContext, {
		value: {
			props: {
				tabs,
				aiChat,
				...baseProps
			},
			slots,
			...linkItems
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.sidebar.provider, {
			...props.sidebar,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreeContextProvider, {
				tree,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					id: "fd-glass-layout",
					className: "grid overflow-x-clip min-h-dvh [--fd-main-width:900px] [--fd-left-width:0px] [--fd-right-width:0px]",
					style: { gridTemplate: `"left left-margin main right-margin right" 1fr / var(--fd-left-width) ${leftSpace} 1fr calc(50% - var(--fd-main-width)/2 - var(--fd-right-width) + min(${leftSpace}, 0px)) var(--fd-right-width)` },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.sidebar.drawer, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.sidebar.main, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.header, {}),
						children
					]
				})
			})
		})
	});
}
//#endregion
export { GlassLayout as t };
