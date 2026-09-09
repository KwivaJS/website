import { i as __toESM } from "./rolldown-runtime-B4iAMlE-.js";
import { t as require_jsx_runtime } from "./jsx-runtime-BqLYtsoi.js";
import { t as require_react } from "./react-SLAb4Nsi.js";
import { r as require_react_dom } from "../index.js";
import { t as cn } from "./dist-UQZjX_nd.js";
import { n as cva, r as cn$1, t as buttonVariants } from "./button-Cpca6tPg.js";
import { t as useCopyButton } from "./use-copy-button-7PXhh8CI.js";
import { t as mergeRefs } from "./merge-refs-BfwMulAo.js";
import { t as useControlled } from "./useControlled-B0XDiIsy.js";
import { $ as useIsoLayoutEffect, A as createChangeEventDetails, F as focusOut, G as triggerPress, H as outsidePress, K as EMPTY_ARRAY, R as linkPress, S as isHTMLElement, W as triggerHover, X as formatErrorMessage, Z as useStableCallback, d as getComputedStyle, n as useOpenChangeComplete, o as useAnimationFrame, q as EMPTY_OBJECT, r as useAnimationsFinished, t as useTransitionStatus, u as useId$1, y as getWindow, z as listNavigation } from "./useTransitionStatus-CgpR1fP4.js";
import { a as mergeProps, n as useBaseUiId, o as resolveStyle, r as useRenderElement, s as useMergedRefs, t as transitionStatusMapping } from "./stateAttributesMapping-B8mynGFP.js";
import { _ as useCompositeListItem, a as CodeBlockTabsList, c as X, d as Tabs$1, f as TabsContent$1, g as useCompositeItem, h as CompositeRoot, i as CodeBlockTabs, m as TabsTrigger$1, n as CodeBlock, o as CodeBlockTabsTrigger, p as TabsList$1, r as CodeBlockTab, s as Pre, t as Heading, u as Link, v as CompositeList } from "./heading-DwO5t_zs.js";
import { b as getTarget, d as inertValue, v as activeElement, x as ownerDocument, y as contains } from "./search-moGbV3Yd.js";
import { t as useButton } from "./useButton-CmgotloM.js";
import { C as useFloatingTree, S as useFloatingParentNodeId, _ as FloatingRootStore, a as PopupTriggerMap, b as FloatingTree, j as stopEvent, x as useFloatingNodeId, y as FloatingNode } from "./DialogStore-S_4PlVMb.js";
import { A as popupTransitionStateMapping, S as getTabbableAfterElement, T as getNodeChildren, _ as useTimeout, a as useDismiss, b as getNextTabbable, d as DROPDOWN_COLLISION_AVOIDANCE, f as POPUP_COLLISION_AVOIDANCE, h as mergeCleanups, j as pressableTriggerOpenStateMapping, k as popupStateMapping, m as FocusGuard, p as ownerVisuallyHidden, s as FloatingPortal, v as disableFocusInside, w as isOutsideEvent, x as getPreviousTabbable, y as enableFocusInside } from "./DialogRootContext-DTwNcHms.js";
import { g as round, m as getSide } from "./floating-ui.react-dom-DpBhZTYb.js";
import { a as useTabsGroups, c as getBreadcrumbItemsFromPath, f as ChevronDown, i as TreeContextProvider, l as PanelLeft, o as useTreeContext, s as useTreePath, u as Languages } from "./scroll-area-DW5uZXgq.js";
import { t as GlassLayout } from "./glass-7oYOX_Yt.js";
import { n as useDirection } from "./DirectionContext-CCPO2bjM.js";
import { t as createLucideIcon } from "./createLucideIcon-CUS0Rvh9.js";
import { C as useFloating, S as useHoverInteractionSharedState, T as useClick, _ as safePolygon, b as applySafePolygonPointerEventsMutation, d as PopoverContent, f as PopoverTrigger, g as DEFAULT_SIDES, h as useAnchorPositioningWithHook, i as isLayoutTabActive, m as getDisabledMountTransitionStyles, n as baseSlots, o as useLinkItems, p as usePositioner, s as isActive, t as LinkItem, u as Popover, v as useHoverReferenceInteraction, w as useFloatingRootContext, x as clearSafePolygonPointerEventsMutation, y as useHoverFloatingInteraction } from "./client-BU1Fmnr9.js";
import { t as Check } from "./check-C0qe87e9.js";
import { A as useFolder, C as SidebarFolderTrigger$1, D as SidebarTrigger$1, E as SidebarSeparator$1, M as useIsScrollTop, N as TextAlignStart, O as SidebarViewport, P as ChevronLeft, S as SidebarFolderLink$1, T as SidebarProvider$1, _ as SidebarContent$1, a as TOCItem$1, b as SidebarFolder$1, c as TOCProvider$2, d as useTOCItems, f as TOCItem, g as SidebarCollapseTrigger$1, h as createPageTreeRenderer, i as clerk_exports, j as useFolderDepth, k as base_exports, l as TOCScrollArea, m as createLinkItemRenderer, n as ViewOptionsPopover, o as TOCItems, p as SidebarTabsDropdown, r as useFooterItems, s as default_exports, t as MarkdownCopyButton, u as useItems, v as SidebarDrawerContent, w as SidebarItem$1, x as SidebarFolderContent$1, y as SidebarDrawerOverlay } from "./page-actions-CCMmsScm.js";
import { n as ChevronRight } from "./dist-D3b8pzgn.js";
import { c as useTranslations, i as usePathname, n as Image, o as T } from "./framework-BVFfi5Qn.js";
import { t as Link$1 } from "./link-BUqPnhxi.js";
import { t as useOnChange } from "./use-on-change-CnLJrKl4.js";
import { n as addEventListener, t as useValueAsRef } from "./useValueAsRef-BtxEwGNw.js";
import { a as collapsibleOpenStateMapping, c as useCollapsibleRootContext, i as useCollapsiblePanel, l as useCollapsibleRoot, n as CollapsibleContent, o as triggerOpenStateMapping, r as CollapsibleTrigger, s as CollapsibleRootContext, t as Collapsible } from "./collapsible-BTQIwl1c.js";
import { t as Link$1$1 } from "./link-BAuMaYNz.js";
//#region node_modules/@base-ui/react/utils/getCssDimensions.mjs
function getCssDimensions(element) {
	const css = getComputedStyle(element);
	let width = parseFloat(css.width) || 0;
	let height = parseFloat(css.height) || 0;
	const hasOffset = isHTMLElement(element);
	const offsetWidth = hasOffset ? element.offsetWidth : width;
	const offsetHeight = hasOffset ? element.offsetHeight : height;
	if (round(width) !== offsetWidth || round(height) !== offsetHeight) {
		width = offsetWidth;
		height = offsetHeight;
	}
	return {
		width,
		height
	};
}
//#endregion
//#region node_modules/lucide-react/dist/esm/icons/file.mjs
/**
* @license lucide-react v1.43.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var __iconData$3 = {
	name: "file",
	size: 24,
	node: [["path", {
		d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
		key: "1oefj6"
	}], ["path", {
		d: "M14 2v5a1 1 0 0 0 1 1h5",
		key: "wfsgrz"
	}]]
};
__iconData$3.node;
var File$1 = createLucideIcon(__iconData$3);
//#endregion
//#region node_modules/lucide-react/dist/esm/icons/folder-open.mjs
/**
* @license lucide-react v1.43.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var __iconData$2 = {
	name: "folder-open",
	size: 24,
	node: [["path", {
		d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",
		key: "usdka0"
	}]]
};
__iconData$2.node;
var FolderOpen = createLucideIcon(__iconData$2);
//#endregion
//#region node_modules/lucide-react/dist/esm/icons/folder.mjs
/**
* @license lucide-react v1.43.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var __iconData$1 = {
	name: "folder",
	size: 24,
	node: [["path", {
		d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
		key: "1kt360"
	}]]
};
__iconData$1.node;
var Folder$1 = createLucideIcon(__iconData$1);
//#endregion
//#region node_modules/lucide-react/dist/esm/icons/share.mjs
/**
* @license lucide-react v1.43.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var __iconData = {
	name: "share",
	size: 24,
	node: [
		["path", {
			d: "M12 2v13",
			key: "1km8f5"
		}],
		["path", {
			d: "m16 6-4-4-4 4",
			key: "13yo43"
		}],
		["path", {
			d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8",
			key: "1b2hhj"
		}]
	]
};
__iconData.node;
var Share = createLucideIcon(__iconData);
//#endregion
//#region node_modules/@base-ui/react/utils/adaptiveOriginMiddleware.mjs
var adaptiveOrigin = {
	name: "adaptiveOrigin",
	async fn(state) {
		const { x: rawX, y: rawY, rects: { floating: floatRect }, elements: { floating }, platform, strategy, placement } = state;
		const win = getWindow(floating);
		const styles = win.getComputedStyle(floating);
		if (!(styles.transitionDuration !== "0s" && styles.transitionDuration !== "")) return {
			x: rawX,
			y: rawY,
			data: DEFAULT_SIDES
		};
		const offsetParent = await platform.getOffsetParent?.(floating);
		let offsetDimensions = {
			width: 0,
			height: 0
		};
		if (strategy === "fixed" && win?.visualViewport) offsetDimensions = {
			width: win.visualViewport.width,
			height: win.visualViewport.height
		};
		else if (offsetParent === win) {
			const doc = ownerDocument(floating);
			offsetDimensions = {
				width: doc.documentElement.clientWidth,
				height: doc.documentElement.clientHeight
			};
		} else if (await platform.isElement?.(offsetParent)) offsetDimensions = await platform.getDimensions(offsetParent);
		const currentSide = getSide(placement);
		let x = rawX;
		let y = rawY;
		if (currentSide === "left") x = offsetDimensions.width - (rawX + floatRect.width);
		if (currentSide === "top") y = offsetDimensions.height - (rawY + floatRect.height);
		const sideX = currentSide === "left" ? "right" : DEFAULT_SIDES.sideX;
		const sideY = currentSide === "top" ? "bottom" : DEFAULT_SIDES.sideY;
		return {
			x,
			y,
			data: {
				sideX,
				sideY
			}
		};
	}
};
//#endregion
//#region node_modules/@base-ui/react/accordion/root/AccordionRootContext.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var AccordionRootContext = /*#__PURE__*/ import_react.createContext(void 0);
function useAccordionRootContext() {
	const context = import_react.useContext(AccordionRootContext);
	if (context === void 0) throw new Error(formatErrorMessage(10));
	return context;
}
//#endregion
//#region node_modules/@base-ui/react/accordion/root/AccordionRoot.mjs
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime(), 1);
var rootStateAttributesMapping = { value: () => null };
/**
* Groups all parts of the accordion.
* Renders a `<div>` element.
*
* Documentation: [Base UI Accordion](https://base-ui.com/react/components/accordion)
*/
var AccordionRoot = /*#__PURE__*/ import_react.forwardRef(function AccordionRoot(componentProps, forwardedRef) {
	const { render, className, disabled = false, hiddenUntilFound: hiddenUntilFoundProp, keepMounted: keepMountedProp, loopFocus, onValueChange, multiple = false, orientation = "vertical", value: valueProp, defaultValue: defaultValueProp, style, ...elementProps } = componentProps;
	const defaultValue = defaultValueProp ?? EMPTY_ARRAY;
	const accordionItemRefs = import_react.useRef([]);
	const [value, setValue] = useControlled({
		controlled: valueProp,
		default: defaultValue,
		name: "Accordion",
		state: "value"
	});
	const handleValueChange = useStableCallback((newValue, nextOpen, details) => {
		if (!multiple) {
			const nextValue = value[0] === newValue ? [] : [newValue];
			onValueChange?.(nextValue, details);
			if (details.isCanceled) return;
			setValue(nextValue);
		} else if (nextOpen) {
			const nextOpenValues = value.slice();
			nextOpenValues.push(newValue);
			onValueChange?.(nextOpenValues, details);
			if (details.isCanceled) return;
			setValue(nextOpenValues);
		} else {
			const nextOpenValues = value.filter((v) => v !== newValue);
			onValueChange?.(nextOpenValues, details);
			if (details.isCanceled) return;
			setValue(nextOpenValues);
		}
	});
	const state = import_react.useMemo(() => ({
		value,
		disabled,
		orientation
	}), [
		value,
		disabled,
		orientation
	]);
	const contextValue = import_react.useMemo(() => ({
		disabled,
		handleValueChange,
		hiddenUntilFound: hiddenUntilFoundProp ?? false,
		keepMounted: keepMountedProp ?? false,
		state,
		value
	}), [
		disabled,
		handleValueChange,
		hiddenUntilFoundProp,
		keepMountedProp,
		state,
		value
	]);
	const element = useRenderElement("div", componentProps, {
		state,
		ref: forwardedRef,
		props: elementProps,
		stateAttributesMapping: rootStateAttributesMapping
	});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(AccordionRootContext.Provider, {
		value: contextValue,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CompositeList, {
			elementsRef: accordionItemRefs,
			children: element
		})
	});
});
//#endregion
//#region node_modules/@base-ui/react/accordion/item/AccordionItemContext.mjs
var AccordionItemContext = /*#__PURE__*/ import_react.createContext(void 0);
function useAccordionItemContext() {
	const context = import_react.useContext(AccordionItemContext);
	if (context === void 0) throw new Error(formatErrorMessage(9));
	return context;
}
//#endregion
//#region node_modules/@base-ui/react/accordion/item/AccordionItemDataAttributes.mjs
/**
* Indicates the index of the accordion item.
* @type {number}
*/
var index = "data-index";
//#endregion
//#region node_modules/@base-ui/react/accordion/item/stateAttributesMapping.mjs
var accordionStateAttributesMapping = {
	...collapsibleOpenStateMapping,
	index: (value) => ({ [index]: String(value) }),
	...transitionStatusMapping,
	value: () => null
};
//#endregion
//#region node_modules/@base-ui/react/accordion/item/AccordionItem.mjs
/**
* Groups an accordion header with the corresponding panel.
* Renders a `<div>` element.
*
* Documentation: [Base UI Accordion](https://base-ui.com/react/components/accordion)
*/
var AccordionItem$1 = /*#__PURE__*/ import_react.forwardRef(function AccordionItem(componentProps, forwardedRef) {
	const { className, disabled: disabledProp = false, onOpenChange: onOpenChangeProp, render, value: valueProp, style, ...elementProps } = componentProps;
	const { ref: listItemRef, index } = useCompositeListItem();
	const mergedRef = useMergedRefs(forwardedRef, listItemRef);
	const { disabled: contextDisabled, handleValueChange, state: rootState, value: openValues } = useAccordionRootContext();
	const fallbackValue = useBaseUiId();
	const value = valueProp ?? fallbackValue;
	const disabled = disabledProp || contextDisabled;
	const isOpen = openValues.indexOf(value) !== -1;
	const onOpenChange = useStableCallback((nextOpen, eventDetails) => {
		onOpenChangeProp?.(nextOpen, eventDetails);
		if (eventDetails.isCanceled) return;
		handleValueChange(value, nextOpen, eventDetails);
	});
	const collapsible = useCollapsibleRoot({
		open: isOpen,
		onOpenChange,
		disabled
	});
	const collapsibleState = import_react.useMemo(() => ({
		open: collapsible.open,
		disabled: collapsible.disabled,
		transitionStatus: collapsible.transitionStatus
	}), [
		collapsible.open,
		collapsible.disabled,
		collapsible.transitionStatus
	]);
	const collapsibleContext = import_react.useMemo(() => ({
		...collapsible,
		onOpenChange,
		state: collapsibleState
	}), [
		collapsible,
		collapsibleState,
		onOpenChange
	]);
	const state = import_react.useMemo(() => ({
		...rootState,
		hidden: !isOpen && !collapsible.mounted,
		index,
		disabled,
		open: isOpen
	}), [
		collapsible.mounted,
		disabled,
		index,
		isOpen,
		rootState
	]);
	const defaultTriggerId = useBaseUiId();
	const [registeredTriggerId, setTriggerId] = import_react.useState();
	const triggerId = registeredTriggerId === null ? void 0 : registeredTriggerId ?? defaultTriggerId;
	const accordionItemContext = import_react.useMemo(() => ({
		defaultTriggerId,
		open: isOpen,
		state,
		setTriggerId,
		triggerId
	}), [
		defaultTriggerId,
		isOpen,
		state,
		setTriggerId,
		triggerId
	]);
	const element = useRenderElement("div", componentProps, {
		state,
		ref: mergedRef,
		props: elementProps,
		stateAttributesMapping: accordionStateAttributesMapping
	});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CollapsibleRootContext.Provider, {
		value: collapsibleContext,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(AccordionItemContext.Provider, {
			value: accordionItemContext,
			children: element
		})
	});
});
//#endregion
//#region node_modules/@base-ui/react/accordion/header/AccordionHeader.mjs
/**
* A heading that labels the corresponding panel.
* Renders an `<h3>` element.
*
* Documentation: [Base UI Accordion](https://base-ui.com/react/components/accordion)
*/
var AccordionHeader$1 = /*#__PURE__*/ import_react.forwardRef(function AccordionHeader(componentProps, forwardedRef) {
	const { render, className, style, ...elementProps } = componentProps;
	const { state } = useAccordionItemContext();
	return useRenderElement("h3", componentProps, {
		state,
		ref: forwardedRef,
		props: elementProps,
		stateAttributesMapping: accordionStateAttributesMapping
	});
});
//#endregion
//#region node_modules/@base-ui/react/accordion/trigger/AccordionTrigger.mjs
/**
* A button that opens and closes the corresponding panel.
* Renders a `<button>` element.
*
* Documentation: [Base UI Accordion](https://base-ui.com/react/components/accordion)
*/
var AccordionTrigger$1 = /*#__PURE__*/ import_react.forwardRef(function AccordionTrigger(componentProps, forwardedRef) {
	const { disabled: disabledProp, className, id: idProp, render, nativeButton = true, style, ...elementProps } = componentProps;
	const { panelId, open, handleTrigger, disabled: contextDisabled } = useCollapsibleRootContext();
	const { getButtonProps, buttonRef } = useButton({
		disabled: disabledProp || contextDisabled,
		focusableWhenDisabled: true,
		native: nativeButton
	});
	const { defaultTriggerId, state, setTriggerId } = useAccordionItemContext();
	const registeredId = idProp || void 0;
	const id = registeredId ?? defaultTriggerId;
	useIsoLayoutEffect(() => {
		setTriggerId((currentId) => registeredId ?? (currentId === null ? void 0 : currentId));
		return () => {
			setTriggerId((currentId) => currentId === registeredId ? null : currentId);
		};
	}, [registeredId, setTriggerId]);
	return useRenderElement("button", componentProps, {
		state,
		ref: [forwardedRef, buttonRef],
		props: [
			{
				"aria-controls": open ? panelId : void 0,
				"aria-expanded": open,
				id,
				onClick: handleTrigger
			},
			elementProps,
			getButtonProps
		],
		stateAttributesMapping: triggerOpenStateMapping
	});
});
//#endregion
//#region node_modules/@base-ui/react/accordion/panel/AccordionPanelCssVars.mjs
/**
* The accordion panel's height.
* @type {number}
*/
var accordionPanelHeight = "--accordion-panel-height";
/**
* The accordion panel's width.
* @type {number}
*/
var accordionPanelWidth = "--accordion-panel-width";
//#endregion
//#region node_modules/@base-ui/react/accordion/panel/AccordionPanel.mjs
/**
* A collapsible panel with the accordion item contents.
* Renders a `<div>` element.
*
* Documentation: [Base UI Accordion](https://base-ui.com/react/components/accordion)
*/
var AccordionPanel = /*#__PURE__*/ import_react.forwardRef(function AccordionPanel(componentProps, forwardedRef) {
	const { className, hiddenUntilFound: hiddenUntilFoundProp, keepMounted: keepMountedProp, id: idProp, render, style, ...elementProps } = componentProps;
	const { hiddenUntilFound: contextHiddenUntilFound, keepMounted: contextKeepMounted } = useAccordionRootContext();
	const { defaultPanelId, mounted, onOpenChange, open, setMounted, setOpen, setPanelIdState, transitionStatus } = useCollapsibleRootContext();
	const hiddenUntilFound = hiddenUntilFoundProp ?? contextHiddenUntilFound;
	const keepMounted = keepMountedProp ?? contextKeepMounted;
	const registeredId = idProp || void 0;
	const id = idProp ?? defaultPanelId;
	useIsoLayoutEffect(() => {
		setPanelIdState((currentId) => registeredId ?? (currentId === null ? void 0 : currentId));
		return () => {
			setPanelIdState((currentId) => currentId === registeredId ? null : currentId);
		};
	}, [registeredId, setPanelIdState]);
	const { height, props, ref, shouldPreventOpenAnimation, shouldRender, transitionStatus: panelTransitionStatus, width } = useCollapsiblePanel({
		externalRef: forwardedRef,
		hiddenUntilFound,
		id,
		keepMounted,
		mounted,
		onOpenChange,
		open,
		setMounted,
		setOpen,
		transitionStatus
	});
	const { state, triggerId } = useAccordionItemContext();
	const panelState = {
		...state,
		transitionStatus: panelTransitionStatus
	};
	const resolvedStyle = resolveStyle(style, panelState);
	const element = useRenderElement("div", {
		...componentProps,
		style: void 0
	}, {
		state: panelState,
		ref,
		props: [
			props,
			{
				"aria-labelledby": triggerId,
				role: "region",
				style: {
					[accordionPanelHeight]: height === void 0 ? "auto" : `${height}px`,
					[accordionPanelWidth]: width === void 0 ? "auto" : `${width}px`
				}
			},
			elementProps,
			resolvedStyle ? { style: resolvedStyle } : void 0,
			shouldPreventOpenAnimation ? { style: { animationName: "none" } } : void 0
		],
		stateAttributesMapping: accordionStateAttributesMapping
	});
	if (!shouldRender) return null;
	return element;
});
//#endregion
//#region node_modules/fumadocs-ui/dist/components/ui/accordion.js
function Accordion$1({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionRoot, {
		className: (s) => cn$1("divide-y divide-fd-border overflow-hidden rounded-lg border bg-fd-card", typeof className === "function" ? className(s) : className),
		...props
	});
}
function AccordionItem({ children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionItem$1, {
		...props,
		children
	});
}
function AccordionHeader({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionHeader$1, {
		className: (s) => cn$1("scroll-m-24 not-prose flex flex-row items-center text-fd-card-foreground font-medium has-focus-visible:bg-fd-accent", typeof className === "function" ? className(s) : className),
		...props,
		children
	});
}
function AccordionTrigger({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionTrigger$1, {
		className: (s) => cn$1("group flex flex-1 items-center gap-2 px-3 py-2.5 text-start focus-visible:outline-none", typeof className === "function" ? className(s) : className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 shrink-0 text-fd-muted-foreground transition-transform duration-200 group-data-panel-open:rotate-90" }), children]
	});
}
function AccordionContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionPanel, {
		className: (s) => cn$1("h-(--accordion-panel-height) overflow-hidden transition-[height] ease-out data-ending-style:h-0 data-starting-style:h-0", typeof className === "function" ? className(s) : className),
		...props,
		children
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/components/accordion.js
function Accordions({ ref, className, defaultValue, ...props }) {
	const rootRef = (0, import_react.useRef)(null);
	const composedRef = mergeRefs(ref, rootRef);
	const [value, setValue] = (0, import_react.useState)(defaultValue ?? []);
	(0, import_react.useEffect)(() => {
		const id = window.location.hash.substring(1);
		const element = rootRef.current;
		if (!element || id.length === 0) return;
		const selected = document.getElementById(id);
		if (!selected || !element.contains(selected)) return;
		const value = selected.getAttribute("data-accordion-value");
		if (value) setValue((prev) => [value, ...prev]);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Accordion$1, {
		ref: composedRef,
		value,
		onValueChange: setValue,
		className: (s) => cn$1("divide-y divide-fd-border overflow-hidden rounded-lg border bg-fd-card", typeof className === "function" ? className(s) : className),
		...props
	});
}
function Accordion({ title, id, value = String(title), children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionItem, {
		value,
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionHeader, {
			id,
			"data-accordion-value": value,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionTrigger, { children: title }), id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyButton, { id }) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionContent, {
			hiddenUntilFound: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4 pb-2 text-[0.9375rem] prose-no-margin [&[hidden]:not([hidden='until-found'])]:hidden",
				children
			})
		})]
	});
}
function CopyButton({ id }) {
	const t = useTranslations({ note: "accordion" });
	const [checked, onClick] = useCopyButton(() => {
		const url = new URL(window.location.href);
		url.hash = id;
		return navigator.clipboard.writeText(url.toString());
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": t("Copy Link", { note: "aria-label" }),
		className: cn$1(buttonVariants({
			color: "ghost",
			className: "text-fd-muted-foreground me-2"
		})),
		onClick,
		children: checked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, { className: "size-3.5" })
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/components/files.js
var itemVariants$1 = cva("flex flex-row items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-fd-accent hover:text-fd-accent-foreground [&_svg]:size-4");
function Files({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn$1("not-prose rounded-md border bg-fd-card p-2", className),
		...props,
		children: props.children
	});
}
function File({ name, icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(File$1, {}), className, ...rest }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn$1(itemVariants$1({ className })),
		...rest,
		children: [icon, name]
	});
}
function Folder({ name, defaultOpen = false, ...props }) {
	const [open, setOpen] = (0, import_react.useState)(defaultOpen);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Collapsible, {
		open,
		onOpenChange: setOpen,
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CollapsibleTrigger, {
			className: cn$1(itemVariants$1({ className: "w-full" })),
			children: [open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderOpen, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Folder$1, {}), name]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "ms-2 flex flex-col border-l ps-2",
			children: props.children
		}) })]
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/components/tabs.js
var TabsContext = (0, import_react.createContext)(null);
function useTabContext() {
	const ctx = (0, import_react.useContext)(TabsContext);
	if (!ctx) throw new Error("You must wrap your component in <Tabs>");
	return ctx;
}
function TabsList({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList$1, {
		...props,
		className: (s) => cn$1("flex gap-3.5 text-fd-secondary-foreground overflow-x-auto px-4 not-prose", typeof className === "function" ? className(s) : className)
	});
}
function TabsTrigger({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger$1, {
		...props,
		className: (s) => cn$1("inline-flex items-center gap-2 whitespace-nowrap text-fd-muted-foreground border-b border-transparent py-2 text-sm font-medium transition-colors [&_svg]:size-4 hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[active]:border-fd-primary data-[active]:text-fd-primary", typeof className === "function" ? className(s) : className)
	});
}
function Tabs({ ref, className, items, label, defaultIndex = 0, defaultValue = items ? escapeValue(items[defaultIndex]) : void 0, ...props }) {
	const [value, setValue] = (0, import_react.useState)(defaultValue);
	const collection = (0, import_react.useMemo)(() => [], []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs$1, {
		ref,
		className: (s) => cn$1("flex flex-col overflow-hidden rounded-xl border bg-fd-secondary my-4", typeof className === "function" ? className(s) : className),
		value,
		onValueChange: (v) => {
			if (items && !items.some((item) => escapeValue(item) === v)) return;
			setValue(v);
		},
		...props,
		children: [items && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [label && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm font-medium my-auto me-auto",
			children: label
		}), items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
			value: escapeValue(item),
			children: item
		}, item))] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContext.Provider, {
			value: (0, import_react.useMemo)(() => ({
				items,
				collection
			}), [collection, items]),
			children: props.children
		})]
	});
}
function Tab({ value, ...props }) {
	const { items } = useTabContext();
	const resolved = value ?? items?.at(useCollectionIndex());
	if (!resolved) throw new Error("Failed to resolve tab `value`, please pass a `value` prop to the Tab component.");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
		value: escapeValue(resolved),
		...props,
		children: props.children
	});
}
function TabsContent({ value, className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent$1, {
		value,
		className: (s) => cn$1("p-4 text-[0.9375rem] bg-fd-background rounded-xl outline-none prose-no-margin data-[inactive]:hidden [&>figure:only-child]:-m-4 [&>figure:only-child]:border-none", typeof className === "function" ? className(s) : className),
		...props,
		children: props.children
	});
}
/**
* Inspired by Headless UI.
*
* Return the index of children, this is made possible by registering the order of render from children using React context.
* This is supposed by work with pre-rendering & pure client-side rendering.
*/
function useCollectionIndex() {
	const key = (0, import_react.useId)();
	const { collection } = useTabContext();
	(0, import_react.useEffect)(() => {
		return () => {
			const idx = collection.indexOf(key);
			if (idx !== -1) collection.splice(idx, 1);
		};
	}, [key, collection]);
	if (!collection.includes(key)) collection.push(key);
	return collection.indexOf(key);
}
/**
* only escape whitespaces in values in simple mode
*/
function escapeValue(v) {
	return v.toLowerCase().replace(/\s/, "-");
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/glass/page/slots/footer.js
function Footer$1({ items, children, className, ...props }) {
	const footerList = useFooterItems();
	const pathname = usePathname();
	const { previous, next } = (0, import_react.useMemo)(() => {
		if (items) return items;
		const idx = footerList.findIndex((item) => isActive(item.url, pathname));
		if (idx === -1) return {};
		return {
			previous: footerList[idx - 1],
			next: footerList[idx + 1]
		};
	}, [
		footerList,
		items,
		pathname
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn$1("@container grid gap-4", previous && next ? "grid-cols-2" : "grid-cols-1", className),
		...props,
		children: [previous && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterItem$1, {
			item: previous,
			index: 0
		}), next && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterItem$1, {
			item: next,
			index: 1
		})]
	}), children] });
}
function FooterItem$1({ item, index }) {
	const t = useTranslations({ note: "pagination" });
	const Icon = index === 0 ? ChevronLeft : ChevronRight;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
		href: item.url,
		className: cn$1("flex flex-col gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground @max-lg:col-span-full", index === 1 && "text-end"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn$1("inline-flex items-center gap-1.5 font-medium", index === 1 && "flex-row-reverse"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "-mx-1 size-4 shrink-0 rtl:rotate-180" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: item.name })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-fd-muted-foreground truncate",
			children: item.description ?? (index === 0 ? t("Previous Page") : t("Next Page"))
		})]
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/glass/page/slots/breadcrumb.js
function Breadcrumb$1({ includeRoot, includeSeparator, includePage, ...props }) {
	const path = useTreePath();
	const { root } = useTreeContext();
	const items = (0, import_react.useMemo)(() => {
		return getBreadcrumbItemsFromPath(root, path, {
			includePage,
			includeSeparator,
			includeRoot
		});
	}, [
		includePage,
		includeRoot,
		includeSeparator,
		path,
		root
	]);
	if (items.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		...props,
		className: cn$1("flex items-center gap-1.5 text-sm text-fd-muted-foreground", props.className),
		children: items.map((item, i) => {
			const className = cn$1("truncate", i === items.length - 1 && "text-fd-primary font-medium");
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [i !== 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3.5 shrink-0" }), item.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
				href: item.url,
				className: cn$1(className, "transition-opacity hover:opacity-80"),
				children: item.name
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className,
				children: item.name
			})] }, i);
		})
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/glass/page/slots/toc.js
var Context = (0, import_react.createContext)(null);
function TOCProvider$1(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TOCProvider$2, { ...props });
}
function useContext$1() {
	return (0, import_react.use)(Context);
}
function TOC$1({ container, header, footer }) {
	const t = useTranslations({ note: "table of contents" });
	const items = useTOCItems();
	const [hover, setHover] = (0, import_react.useState)(false);
	const [mobileOpen, setMobileOpen] = (0, import_react.useState)(false);
	const [inAnimation, setInAnimation] = (0, import_react.useState)(false);
	const exitTimerRef = (0, import_react.useRef)(null);
	const transitionTimerRef = (0, import_react.useRef)(null);
	const open = hover || mobileOpen;
	useOnChange(open, () => {
		setInAnimation(true);
		if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
		transitionTimerRef.current = window.setTimeout(() => {
			setInAnimation(false);
		}, 300);
	});
	const ctx = (0, import_react.useMemo)(() => ({
		open,
		setMobileOpen,
		inAnimation
	}), [open, inAnimation]);
	if (items.length === 0 && !footer && !header) return;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Context, {
		value: ctx,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn$1("fixed inset-0 z-10 backdrop-blur-sm transition-opacity duration-300 [mask-image:radial-gradient(circle_at_center_right,white,white_200px,transparent_500px)] xl:hidden", !open && "opacity-0 pointer-events-none"),
			onClick: () => setMobileOpen(false)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TOCScrollArea, {
			id: "nd-toc",
			...container,
			className: cn$1("z-10 grid transition-[width,padding] duration-300 [grid-area:right]", "xl:sticky xl:top-10 xl:h-[calc(100dvh---spacing(10))] md:layout:[--fd-right-width:12px] xl:layout:[--fd-right-width:240px] xl:items-center xl:pe-4", "max-xl:fixed max-xl:top-1/2 max-xl:-translate-y-1/2 max-xl:end-1 max-xl:bg-fd-popover max-xl:text-fd-popover-foreground max-xl:border max-xl:rounded-xl max-xl:shadow-md max-xl:mask-none max-xl:max-h-[calc(100dvh---spacing(32))] max-xl:grid-cols-[calc(240px---spacing(6))]", inAnimation && "overflow-y-hidden", open ? "max-xl:w-[240px] max-xl:p-3" : "max-md:w-4 max-md:ps-[calc(--spacing(1.5)-1px)] max-xl:w-6 max-xl:ps-[calc(--spacing(2.5)-1px)] max-xl:overflow-clip", container?.className),
			onPointerDown: (e) => {
				if (!mobileOpen && (e.pointerType === "touch" || e.pointerType === "pen")) setMobileOpen(true);
			},
			onPointerEnter: (e) => {
				if (e.pointerType === "mouse") {
					if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);
					if (!hover) setHover(true);
				}
			},
			onPointerLeave: (e) => {
				if (hover && e.pointerType === "mouse") {
					if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);
					exitTimerRef.current = window.setTimeout(() => {
						setHover(false);
					}, window.innerWidth - e.clientX < 30 ? 700 : 50);
				}
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col xl:items-end xl:text-end",
				children: [
					header,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						id: "nd-toc-title",
						className: cn$1("inline-flex items-center gap-1.5 overflow-hidden text-xs text-fd-muted-foreground transition-[opacity,height] opacity-0 h-0", open ? "opacity-100 h-6" : "xl:[@media(hover:none)]:opacity-100 xl:[@media(hover:none)]:h-6"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextAlignStart, { className: "size-3.5 shrink-0" }), t("On this page")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TOCPanel, {}),
					footer
				]
			})
		})]
	});
}
function TOCPanel({ className, style, ...props }) {
	const items = useTOCItems();
	const { open, inAnimation, setMobileOpen } = useContext$1();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn$1("grid grid-cols-1 transition-[grid-template-rows]", open ? "[--row:calc(6*var(--spacing))]" : "[--row:calc(3*var(--spacing))] xl:[@media(hover:none)]:[--row:calc(6*var(--spacing))]", (!open || inAnimation) && "pointer-events-none xl:[@media(hover:none)]:pointer-events-auto", className),
		style: {
			...style,
			gridTemplateRows: `repeat(${items.length}, var(--row))`
		},
		...props,
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TOCItem, {
			href: item.url,
			className: "group prose prose-sm flex items-center gap-2 text-xs text-fd-muted-foreground transition-colors data-[active=true]:text-fd-primary data-[active=false]:hover:text-fd-accent-foreground xl:flex-row-reverse",
			onClick: () => setMobileOpen(false),
			autoScroll: open && !inAnimation,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn$1("shrink-0 bg-fd-muted-foreground/50 rounded-full size-1 transition-[background-color,width,height] group-data-[active=true]:bg-fd-primary", open ? "w-(--width) h-px" : "transition-[width,height] duration-300 xl:[@media(hover:none)]:w-(--width) xl:[@media(hover:none)]:h-px"),
				style: { "--width": `calc(pow(${item.depth}, 1.5) * var(--spacing))` }
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn$1("truncate transition-opacity opacity-0", open ? "opacity-100" : "xl:[@media(hover:none)]:opacity-100"),
				children: item.title
			})]
		}, item.url))
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/glass/page/index.js
var PageContext$1 = (0, import_react.createContext)(null);
var Empty = [];
function DocsPage$1({ full = false, toc = Empty, tableOfContent, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageContext$1, {
		value: { full },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TOCProvider$1, {
			toc,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-fd-full": full,
				className: cn$1("flex flex-col gap-2 p-6 pb-16 min-w-0 [grid-area:main] md:pt-16 md:pb-8", full && "layout:[--fd-main-width:1200px]"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Breadcrumb$1, {}),
					children,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer$1, {})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TOC$1, { ...tableOfContent })]
		})
	});
}
/**
* Add typography styles
*/
function DocsBody$1({ children, className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		...props,
		className: cn$1("prose flex-1", className),
		children
	});
}
function DocsDescription$1({ children, className, ...props }) {
	if (children === void 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		...props,
		className: cn$1("mb-8 text-lg text-fd-muted-foreground", className),
		children
	});
}
function DocsTitle$1({ children, className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
		...props,
		className: cn$1("text-[1.75em] font-semibold", className),
		children
	});
}
function PageLastUpdate$1({ date: value, ...props }) {
	const t = useTranslations({ note: "page footer" });
	const [date, setDate] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setDate(value.toLocaleDateString());
	}, [value]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		...props,
		className: cn$1("text-sm text-fd-muted-foreground", props.className),
		children: [
			t("Last updated on"),
			" ",
			date
		]
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/home/slots/container.js
function Container$2(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		id: "nd-home-layout",
		...props,
		className: cn$1("flex flex-1 flex-col [--fd-layout-width:1400px]", props.className)
	});
}
//#endregion
//#region node_modules/@base-ui/react/navigation-menu/root/NavigationMenuRootContext.mjs
var NavigationMenuRootContext = /*#__PURE__*/ import_react.createContext(void 0);
function useNavigationMenuRootContext(optional) {
	const context = import_react.useContext(NavigationMenuRootContext);
	if (context === void 0 && !optional) throw new Error(formatErrorMessage(41));
	return context;
}
var NavigationMenuTreeContext = /*#__PURE__*/ import_react.createContext(void 0);
function useNavigationMenuTreeContext() {
	return import_react.useContext(NavigationMenuTreeContext);
}
//#endregion
//#region node_modules/@base-ui/react/navigation-menu/positioner/NavigationMenuPositionerCssVars.mjs
/**
* The fixed width of the positioner element.
* @type {number}
*/
var positionerWidth = "--positioner-width";
/**
* The fixed height of the positioner element.
* @type {number}
*/
var positionerHeight = "--positioner-height";
//#endregion
//#region node_modules/@base-ui/react/navigation-menu/popup/NavigationMenuPopupCssVars.mjs
/**
* The fixed width of the popup element.
* @type {number}
*/
var popupWidth = "--popup-width";
/**
* The fixed height of the popup element.
* @type {number}
*/
var popupHeight = "--popup-height";
//#endregion
//#region node_modules/@base-ui/react/navigation-menu/utils/setSharedFixedSize.mjs
function setSharedFixedSize(popupElement, positionerElement, width, height) {
	popupElement.style.setProperty(popupWidth, `${width}px`);
	popupElement.style.setProperty(popupHeight, `${height}px`);
	positionerElement.style.setProperty(positionerWidth, `${width}px`);
	positionerElement.style.setProperty(positionerHeight, `${height}px`);
}
//#endregion
//#region node_modules/@base-ui/react/navigation-menu/root/NavigationMenuRoot.mjs
var blockedReturnFocusReasons = /* @__PURE__ */ new Set([
	triggerHover,
	outsidePress,
	focusOut
]);
function getPositionerFixedSize(positionerElement) {
	const width = parseFloat(positionerElement.style.getPropertyValue("--positioner-width")) || 0;
	const height = parseFloat(positionerElement.style.getPropertyValue("--positioner-height")) || 0;
	if (width <= 0 || height <= 0) return null;
	return {
		width,
		height
	};
}
/**
* Groups all parts of the navigation menu.
* Renders a `<nav>` element at the root, or `<div>` element when nested.
*
* Documentation: [Base UI Navigation Menu](https://base-ui.com/react/components/navigation-menu)
*/
var NavigationMenuRoot = /*#__PURE__*/ import_react.forwardRef(function NavigationMenuRoot(componentProps, forwardedRef) {
	const { defaultValue = null, value: valueParam, onValueChange, actionsRef, delay = 50, closeDelay = 50, orientation = "horizontal", onOpenChangeComplete } = componentProps;
	const nested = useFloatingParentNodeId() != null;
	const parentRootContext = useNavigationMenuRootContext(true);
	const [value, setValueUnwrapped] = useControlled({
		controlled: valueParam,
		default: defaultValue,
		name: "NavigationMenu",
		state: "value"
	});
	const open = value != null;
	const closeReasonRef = import_react.useRef(void 0);
	const rootRef = import_react.useRef(null);
	const [positionerElement, setPositionerElement] = import_react.useState(null);
	const [popupElement, setPopupElement] = import_react.useState(null);
	const [viewportElement, setViewportElement] = import_react.useState(null);
	const [viewportTargetElement, setViewportTargetElement] = import_react.useState(null);
	const [activationDirection, setActivationDirection] = import_react.useState(null);
	const [floatingRootContext, setFloatingRootContext] = import_react.useState(void 0);
	const [viewportInert, setViewportInert] = import_react.useState(false);
	const prevTriggerElementRef = import_react.useRef(null);
	const currentContentRef = import_react.useRef(null);
	const beforeInsideRef = import_react.useRef(null);
	const afterInsideRef = import_react.useRef(null);
	const beforeOutsideRef = import_react.useRef(null);
	const afterOutsideRef = import_react.useRef(null);
	const popupAutoSizeResetRef = import_react.useRef({
		abortController: null,
		owner: null
	});
	const { mounted, setMounted, transitionStatus } = useTransitionStatus(open);
	useIsoLayoutEffect(() => {
		if (open) return;
		if (!positionerElement || !popupElement) return;
		const closeTransitionSize = getPositionerFixedSize(positionerElement);
		if (!closeTransitionSize) return;
		setSharedFixedSize(popupElement, positionerElement, closeTransitionSize.width, closeTransitionSize.height);
	}, [
		open,
		popupElement,
		positionerElement
	]);
	import_react.useEffect(() => {
		setViewportInert(false);
	}, [value]);
	const setValue = useStableCallback((nextValue, eventDetails) => {
		if (nextValue == null) closeReasonRef.current = eventDetails.reason;
		if (nextValue !== value) onValueChange?.(nextValue, eventDetails);
		if (eventDetails.isCanceled) return;
		if (nextValue == null) {
			setActivationDirection(null);
			setFloatingRootContext(void 0);
		}
		setValueUnwrapped(nextValue);
		if (nested && nextValue == null && eventDetails.reason === "link-press" && parentRootContext) parentRootContext.setValue(null, eventDetails);
	});
	const handleUnmount = useStableCallback(() => {
		const doc = ownerDocument(rootRef.current);
		const activeEl = activeElement(doc);
		if (!(closeReasonRef.current ? blockedReturnFocusReasons.has(closeReasonRef.current) : false) && isHTMLElement(prevTriggerElementRef.current) && (activeEl === ownerDocument(popupElement).body || contains(popupElement, activeEl)) && popupElement) {
			prevTriggerElementRef.current.focus({ preventScroll: true });
			prevTriggerElementRef.current = void 0;
		}
		setMounted(false);
		onOpenChangeComplete?.(false);
		setActivationDirection(null);
		setFloatingRootContext(void 0);
		currentContentRef.current = null;
		closeReasonRef.current = void 0;
	});
	import_react.useImperativeHandle(actionsRef, () => ({ unmount: handleUnmount }), [handleUnmount]);
	useOpenChangeComplete({
		enabled: !actionsRef,
		open,
		ref: { current: popupElement },
		onComplete() {
			if (!open) handleUnmount();
		}
	});
	useOpenChangeComplete({
		enabled: !actionsRef,
		open,
		ref: { current: viewportTargetElement },
		onComplete() {
			if (!open) handleUnmount();
		}
	});
	const contextActivationDirection = open ? activationDirection : null;
	const contextValue = import_react.useMemo(() => ({
		open,
		value,
		setValue,
		mounted,
		transitionStatus,
		positionerElement,
		setPositionerElement,
		popupElement,
		setPopupElement,
		viewportElement,
		setViewportElement,
		viewportTargetElement,
		setViewportTargetElement,
		activationDirection: contextActivationDirection,
		setActivationDirection,
		floatingRootContext,
		setFloatingRootContext,
		currentContentRef,
		nested,
		rootRef,
		beforeInsideRef,
		afterInsideRef,
		beforeOutsideRef,
		afterOutsideRef,
		prevTriggerElementRef,
		popupAutoSizeResetRef,
		delay,
		closeDelay,
		orientation,
		viewportInert,
		setViewportInert
	}), [
		open,
		value,
		setValue,
		mounted,
		transitionStatus,
		positionerElement,
		popupElement,
		viewportElement,
		viewportTargetElement,
		contextActivationDirection,
		floatingRootContext,
		nested,
		delay,
		closeDelay,
		orientation,
		viewportInert
	]);
	const jsx = /*#__PURE__*/ (0, import_jsx_runtime.jsx)(NavigationMenuRootContext.Provider, {
		value: contextValue,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(TreeContext, {
			componentProps,
			forwardedRef,
			children: componentProps.children
		})
	});
	if (!nested) return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FloatingTree, { children: jsx });
	return jsx;
});
function TreeContext(props) {
	const { className, render, defaultValue, value: valueParam, onValueChange, actionsRef, delay, closeDelay, orientation, onOpenChangeComplete, style, ...elementProps } = props.componentProps;
	const nodeId = useFloatingNodeId();
	const { rootRef, nested, open } = useNavigationMenuRootContext();
	const state = {
		open,
		nested
	};
	const element = useRenderElement(nested ? "div" : "nav", props.componentProps, {
		state,
		ref: [props.forwardedRef, rootRef],
		props: elementProps
	});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(NavigationMenuTreeContext.Provider, {
		value: nodeId,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FloatingNode, {
			id: nodeId,
			children: element
		})
	});
}
//#endregion
//#region node_modules/@base-ui/react/navigation-menu/utils/constants.mjs
var NAVIGATION_MENU_TRIGGER_IDENTIFIER = "data-base-ui-navigation-menu-trigger";
//#endregion
//#region node_modules/@base-ui/react/navigation-menu/list/NavigationMenuDismissContext.mjs
var NavigationMenuDismissContext = /*#__PURE__*/ import_react.createContext(void 0);
function useNavigationMenuDismissContext() {
	return import_react.useContext(NavigationMenuDismissContext);
}
//#endregion
//#region node_modules/@base-ui/react/floating-ui-react/utils/getEmptyRootContext.mjs
function getEmptyRootContext() {
	return new FloatingRootStore({
		open: false,
		transitionStatus: void 0,
		floatingElement: null,
		referenceElement: null,
		triggerElements: new PopupTriggerMap(),
		floatingId: void 0,
		syncOnly: false,
		nested: false,
		onOpenChange: void 0
	});
}
//#endregion
//#region node_modules/@base-ui/react/navigation-menu/list/NavigationMenuList.mjs
/**
* Contains a list of navigation menu items.
* Renders a `<ul>` element.
*
* Documentation: [Base UI Navigation Menu](https://base-ui.com/react/components/navigation-menu)
*/
var NavigationMenuList = /*#__PURE__*/ import_react.forwardRef(function NavigationMenuList(componentProps, forwardedRef) {
	const { render, className, style, ...elementProps } = componentProps;
	const nodeId = useNavigationMenuTreeContext();
	const { orientation, open, floatingRootContext, positionerElement, value, closeDelay, viewportElement, nested } = useNavigationMenuRootContext();
	const fallbackContext = import_react.useMemo(() => getEmptyRootContext(), []);
	const context = floatingRootContext || fallbackContext;
	const interactionsEnabled = positionerElement != null || value == null;
	useHoverFloatingInteraction(context, {
		enabled: Boolean(floatingRootContext) && (positionerElement != null || viewportElement != null || value == null),
		closeDelay,
		nodeId
	});
	const dismiss = useDismiss(context, {
		enabled: interactionsEnabled,
		outsidePressEvent: "intentional",
		outsidePress(event) {
			return getTarget(event)?.closest(`[${NAVIGATION_MENU_TRIGGER_IDENTIFIER}]`) === null;
		}
	});
	const dismissProps = floatingRootContext ? dismiss : void 0;
	const state = { open };
	const defaultProps = nested ? EMPTY_OBJECT : { onKeyDown(event) {
		if (orientation === "horizontal" && (event.key === "ArrowLeft" || event.key === "ArrowRight") || orientation === "vertical" && (event.key === "ArrowUp" || event.key === "ArrowDown")) event.stopPropagation();
	} };
	const props = [
		dismissProps?.floating || EMPTY_OBJECT,
		defaultProps,
		elementProps
	];
	const element = useRenderElement("ul", componentProps, {
		state,
		ref: forwardedRef,
		props,
		enabled: nested
	});
	if (nested) return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(NavigationMenuDismissContext.Provider, {
		value: dismissProps,
		children: element
	});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(NavigationMenuDismissContext.Provider, {
		value: dismissProps,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CompositeRoot, {
			render,
			className,
			style,
			state,
			refs: [forwardedRef],
			props,
			loopFocus: false,
			orientation,
			tag: "ul"
		})
	});
});
//#endregion
//#region node_modules/@base-ui/react/navigation-menu/item/NavigationMenuItemContext.mjs
var NavigationMenuItemContext = /*#__PURE__*/ import_react.createContext(void 0);
function useNavigationMenuItemContext() {
	const value = import_react.useContext(NavigationMenuItemContext);
	if (!value) throw new Error(formatErrorMessage(39));
	return value;
}
//#endregion
//#region node_modules/@base-ui/react/navigation-menu/item/NavigationMenuItem.mjs
/**
* An individual navigation menu item.
* Renders a `<li>` element.
*
* Documentation: [Base UI Navigation Menu](https://base-ui.com/react/components/navigation-menu)
*/
var NavigationMenuItem = /*#__PURE__*/ import_react.forwardRef(function NavigationMenuItem(componentProps, forwardedRef) {
	const { render, className, style, value: valueProp, ...elementProps } = componentProps;
	const fallbackValue = useBaseUiId();
	const value = valueProp ?? fallbackValue;
	const element = useRenderElement("li", componentProps, {
		ref: forwardedRef,
		props: elementProps
	});
	const contextValue = import_react.useMemo(() => ({ value }), [value]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(NavigationMenuItemContext.Provider, {
		value: contextValue,
		children: element
	});
});
/**
* Which direction another trigger was activated from.
* @type {'left' | 'right' | 'up' | 'down'}
*/
var activationDirection = "data-activation-direction";
//#endregion
//#region node_modules/@base-ui/react/navigation-menu/content/NavigationMenuContent.mjs
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom(), 1);
var stateAttributesMapping = {
	...popupStateMapping,
	...transitionStatusMapping,
	activationDirection(value) {
		if (!value) return null;
		return { [activationDirection]: value };
	}
};
/**
* A container for the content of the navigation menu item that is moved into the popup
* when the item is active.
* Renders a `<div>` element.
*
* Documentation: [Base UI Navigation Menu](https://base-ui.com/react/components/navigation-menu)
*/
var NavigationMenuContent = /*#__PURE__*/ import_react.forwardRef(function NavigationMenuContent(componentProps, forwardedRef) {
	const { render, className, style, keepMounted = false, ...elementProps } = componentProps;
	const { mounted: popupMounted, viewportElement, value, activationDirection, currentContentRef, viewportTargetElement } = useNavigationMenuRootContext();
	const { value: itemValue } = useNavigationMenuItemContext();
	const nodeId = useNavigationMenuTreeContext();
	const open = popupMounted && value === itemValue;
	const ref = import_react.useRef(null);
	const [hasMountedInPortal, setHasMountedInPortal] = import_react.useState(false);
	const [focusInside, setFocusInside] = import_react.useState(false);
	const { mounted, setMounted, transitionStatus } = useTransitionStatus(open);
	if (mounted && !popupMounted) setMounted(false);
	useOpenChangeComplete({
		ref,
		open,
		onComplete() {
			if (!open) setMounted(false);
		}
	});
	useIsoLayoutEffect(() => {
		if (open && ref.current) currentContentRef.current = ref.current;
	}, [open, currentContentRef]);
	const state = {
		open,
		transitionStatus,
		activationDirection
	};
	const handleCurrentContentRef = useStableCallback((node) => {
		if (node && open) currentContentRef.current = node;
	});
	const commonProps = {
		onFocus(event) {
			if (getTarget(event.nativeEvent)?.hasAttribute("data-base-ui-focus-guard")) return;
			setFocusInside(true);
		},
		onBlur(event) {
			if (!contains(event.currentTarget, event.relatedTarget)) setFocusInside(false);
		}
	};
	const defaultProps = !open && mounted ? {
		style: {
			position: "absolute",
			top: 0,
			left: 0
		},
		inert: inertValue(!focusInside),
		...commonProps
	} : commonProps;
	const portalContainer = viewportTargetElement || viewportElement;
	const hidden = keepMounted && !mounted;
	const shouldRenderInline = keepMounted && !portalContainer && !hasMountedInPortal;
	if (keepMounted && portalContainer && !hasMountedInPortal) setHasMountedInPortal(true);
	if (shouldRenderInline) return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CompositeRoot, {
		render,
		className,
		style,
		state,
		refs: [forwardedRef],
		props: [
			defaultProps,
			{ hidden: true },
			elementProps
		],
		stateAttributesMapping
	});
	if (!portalContainer || !mounted && !keepMounted) return null;
	return /*#__PURE__*/ import_react_dom.createPortal(/*#__PURE__*/ (0, import_jsx_runtime.jsx)(FloatingNode, {
		id: nodeId,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CompositeRoot, {
			render,
			className,
			style,
			state,
			refs: [
				forwardedRef,
				ref,
				handleCurrentContentRef
			],
			props: [
				defaultProps,
				hidden ? { hidden: true } : EMPTY_OBJECT,
				elementProps
			],
			stateAttributesMapping
		})
	}), portalContainer);
});
//#endregion
//#region node_modules/@base-ui/react/navigation-menu/utils/isOutsideMenuEvent.mjs
function isOutsideMenuEvent({ currentTarget, relatedTarget }, params) {
	const { popupElement, rootRef, tree, nodeId } = params;
	const nodeChildrenContains = tree ? getNodeChildren(tree.nodesRef.current, nodeId).some((node) => contains(node.context?.elements.floating, relatedTarget)) : false;
	if (!popupElement) return !contains(rootRef.current, relatedTarget) && !nodeChildrenContains;
	return !contains(popupElement, currentTarget) && !contains(popupElement, relatedTarget) && !contains(rootRef.current, relatedTarget) && !nodeChildrenContains;
}
//#endregion
//#region node_modules/@base-ui/react/internals/composite/item/CompositeItem.mjs
function CompositeItem(componentProps) {
	const { render, className, style, state = EMPTY_OBJECT, props = EMPTY_ARRAY, refs = EMPTY_ARRAY, metadata, stateAttributesMapping, tag = "div", ...elementProps } = componentProps;
	const { compositeProps, compositeRef } = useCompositeItem({ metadata });
	return useRenderElement(tag, componentProps, {
		state,
		ref: [compositeRef, ...refs],
		props: [
			compositeProps,
			...props,
			elementProps
		],
		stateAttributesMapping
	});
}
//#endregion
//#region node_modules/@base-ui/react/navigation-menu/trigger/NavigationMenuTrigger.mjs
var DEFAULT_SIZE = {
	width: 0,
	height: 0
};
/**
* Opens the navigation menu popup when hovered or clicked, revealing the
* associated content.
* Renders a `<button>` element.
*
* Documentation: [Base UI Navigation Menu](https://base-ui.com/react/components/navigation-menu)
*/
var NavigationMenuTrigger = /*#__PURE__*/ import_react.forwardRef(function NavigationMenuTrigger(componentProps, forwardedRef) {
	const { render, className, style, nativeButton = true, disabled = false, ...elementProps } = componentProps;
	const { value, setValue, mounted, open, positionerElement, setActivationDirection, setFloatingRootContext, popupElement, viewportElement, transitionStatus, rootRef, beforeOutsideRef, afterOutsideRef, afterInsideRef, beforeInsideRef, prevTriggerElementRef, popupAutoSizeResetRef, currentContentRef, delay, closeDelay, orientation, setViewportInert, nested } = useNavigationMenuRootContext();
	const { value: itemValue } = useNavigationMenuItemContext();
	const nodeId = useNavigationMenuTreeContext();
	const tree = useFloatingTree();
	const dismissProps = useNavigationMenuDismissContext();
	const direction = useDirection();
	const stickIfOpenTimeout = useTimeout();
	const mutationFrame = useAnimationFrame();
	const resizeFrame = useAnimationFrame();
	const sizeFrame = useAnimationFrame();
	const [triggerElement, setTriggerElement] = import_react.useState(null);
	const [stickIfOpen, setStickIfOpen] = import_react.useState(true);
	const [pointerType, setPointerType] = import_react.useState("");
	const triggerElementRef = import_react.useRef(null);
	const prevSizeRef = import_react.useRef(DEFAULT_SIZE);
	const skipAutoSizeSyncRef = import_react.useRef(false);
	const isActiveItem = open && value === itemValue;
	const isActiveItemRef = useValueAsRef(isActiveItem);
	const interactionsEnabled = (positionerElement != null || value == null) && !disabled;
	const hoverFloatingElement = positionerElement || viewportElement;
	const hoverInteractionsEnabled = (hoverFloatingElement != null || value == null) && !disabled;
	const runOnceAnimationsFinish = useAnimationsFinished(popupElement);
	const handleTriggerElement = import_react.useCallback((element) => {
		triggerElementRef.current = element;
		setTriggerElement(element);
	}, []);
	const cancelAutoSizeReset = useStableCallback((force = false) => {
		if (!force && popupAutoSizeResetRef.current.owner !== itemValue) return;
		popupAutoSizeResetRef.current.abortController?.abort();
		popupAutoSizeResetRef.current.abortController = null;
		popupAutoSizeResetRef.current.owner = null;
	});
	useIsoLayoutEffect(() => {
		if (isActiveItem) return;
		mutationFrame.cancel();
		sizeFrame.cancel();
		cancelAutoSizeReset();
	}, [
		isActiveItem,
		mutationFrame,
		sizeFrame,
		cancelAutoSizeReset
	]);
	function setAutoSizes(element) {
		element.style.setProperty(popupWidth, "auto");
		element.style.setProperty(popupHeight, "auto");
	}
	function clearFixedSizes(popup, positioner) {
		popup.style.removeProperty(popupWidth);
		popup.style.removeProperty(popupHeight);
		positioner.style.removeProperty(positionerWidth);
		positioner.style.removeProperty(positionerHeight);
	}
	function scheduleAutoSizeReset(popup) {
		cancelAutoSizeReset(true);
		const abortController = new AbortController();
		popupAutoSizeResetRef.current.abortController = abortController;
		popupAutoSizeResetRef.current.owner = itemValue;
		runOnceAnimationsFinish(() => {
			popupAutoSizeResetRef.current.abortController = null;
			popupAutoSizeResetRef.current.owner = null;
			setAutoSizes(popup);
		}, abortController.signal);
	}
	const handleValueChange = useStableCallback((popup, positioner, currentWidth, currentHeight) => {
		cancelAutoSizeReset(true);
		clearFixedSizes(popup, positioner);
		const { width, height } = getCssDimensions(popup);
		const measuredWidth = width || prevSizeRef.current.width;
		const measuredHeight = height || prevSizeRef.current.height;
		if (currentHeight === 0 || currentWidth === 0) {
			currentWidth = measuredWidth;
			currentHeight = measuredHeight;
		}
		popup.style.setProperty(popupWidth, `${currentWidth}px`);
		popup.style.setProperty(popupHeight, `${currentHeight}px`);
		positioner.style.setProperty(positionerWidth, `${measuredWidth}px`);
		positioner.style.setProperty(positionerHeight, `${measuredHeight}px`);
		sizeFrame.request(() => {
			if (!isActiveItemRef.current) return;
			popup.style.setProperty(popupWidth, `${measuredWidth}px`);
			popup.style.setProperty(popupHeight, `${measuredHeight}px`);
			scheduleAutoSizeReset(popup);
		});
	});
	const handleInterruptedMutationResize = useStableCallback((popup, positioner, currentWidth, currentHeight) => {
		sizeFrame.cancel();
		mutationFrame.cancel();
		cancelAutoSizeReset(true);
		if (currentWidth === 0 || currentHeight === 0) return;
		setSharedFixedSize(popup, positioner, currentWidth, currentHeight);
		mutationFrame.request(() => {
			mutationFrame.request(() => {
				clearFixedSizes(popup, positioner);
				const { width, height } = getCssDimensions(popup);
				const measuredWidth = width || currentWidth;
				const measuredHeight = height || currentHeight;
				setSharedFixedSize(popup, positioner, currentWidth, currentHeight);
				sizeFrame.request(() => {
					if (!isActiveItemRef.current) return;
					setSharedFixedSize(popup, positioner, measuredWidth, measuredHeight);
					scheduleAutoSizeReset(popup);
				});
			});
		});
	});
	const syncCurrentSize = useStableCallback((popup, positioner) => {
		sizeFrame.cancel();
		cancelAutoSizeReset(true);
		clearFixedSizes(popup, positioner);
		const { width, height } = getCssDimensions(popup);
		if (width === 0 || height === 0) return;
		prevSizeRef.current = {
			width,
			height
		};
		setAutoSizes(popup);
		positioner.style.setProperty(positionerWidth, `${width}px`);
		positioner.style.setProperty(positionerHeight, `${height}px`);
	});
	const getMutationBaseline = useStableCallback((popup) => {
		const popupWidth$1 = popup.style.getPropertyValue(popupWidth);
		const popupHeight$1 = popup.style.getPropertyValue(popupHeight);
		if (!(popupWidth$1 !== "" && popupWidth$1 !== "auto" && popupHeight$1 !== "" && popupHeight$1 !== "auto")) return {
			size: prevSizeRef.current,
			syncPositioner: false
		};
		return {
			size: {
				width: popup.offsetWidth || prevSizeRef.current.width,
				height: popup.offsetHeight || prevSizeRef.current.height
			},
			syncPositioner: true
		};
	});
	import_react.useEffect(() => {
		if (!open) {
			stickIfOpenTimeout.clear();
			mutationFrame.cancel();
			resizeFrame.cancel();
			sizeFrame.cancel();
			cancelAutoSizeReset(true);
			skipAutoSizeSyncRef.current = false;
			setPointerType("");
		}
	}, [
		stickIfOpenTimeout,
		open,
		mutationFrame,
		resizeFrame,
		sizeFrame,
		cancelAutoSizeReset
	]);
	import_react.useEffect(() => {
		if (!mounted) prevSizeRef.current = DEFAULT_SIZE;
	}, [mounted]);
	useIsoLayoutEffect(() => {
		if (!popupElement || typeof ResizeObserver !== "function") return;
		const resizeObserver = new ResizeObserver(() => {
			prevSizeRef.current = {
				width: popupElement.offsetWidth,
				height: popupElement.offsetHeight
			};
		});
		resizeObserver.observe(popupElement);
		return () => {
			resizeObserver.disconnect();
		};
	}, [popupElement]);
	import_react.useEffect(() => {
		if (!open || !isActiveItem || !popupElement || !positionerElement) return;
		const popup = popupElement;
		const positioner = positionerElement;
		const win = getWindow(positioner);
		function handleResize() {
			resizeFrame.cancel();
			resizeFrame.request(() => syncCurrentSize(popup, positioner));
		}
		const unsubscribe = addEventListener(win, "resize", handleResize);
		return () => {
			resizeFrame.cancel();
			unsubscribe();
		};
	}, [
		open,
		isActiveItem,
		popupElement,
		positionerElement,
		resizeFrame,
		syncCurrentSize
	]);
	import_react.useEffect(() => {
		const observedElement = currentContentRef.current;
		if (!observedElement || !popupElement || !positionerElement || !isActiveItem || typeof MutationObserver !== "function") return;
		const mutationObserver = new MutationObserver(() => {
			if (transitionStatus === "starting" || popupElement.hasAttribute("data-starting-style")) {
				syncCurrentSize(popupElement, positionerElement);
				return;
			}
			const { size, syncPositioner } = getMutationBaseline(popupElement);
			if (syncPositioner) {
				handleInterruptedMutationResize(popupElement, positionerElement, size.width, size.height);
				return;
			}
			handleValueChange(popupElement, positionerElement, size.width, size.height);
		});
		mutationObserver.observe(observedElement, {
			childList: true,
			subtree: true,
			characterData: true,
			attributes: true,
			attributeFilter: ["hidden"]
		});
		return () => {
			mutationObserver.disconnect();
		};
	}, [
		currentContentRef,
		popupElement,
		positionerElement,
		isActiveItem,
		transitionStatus,
		getMutationBaseline,
		handleInterruptedMutationResize,
		handleValueChange,
		syncCurrentSize
	]);
	useIsoLayoutEffect(() => {
		if (isActiveItemRef.current && open && popupElement && positionerElement) {
			if (skipAutoSizeSyncRef.current) {
				skipAutoSizeSyncRef.current = false;
				return;
			}
			const { width, height } = getCssDimensions(popupElement);
			handleValueChange(popupElement, positionerElement, width, height);
		}
	}, [
		currentContentRef,
		handleValueChange,
		isActiveItemRef,
		open,
		popupElement,
		positionerElement,
		transitionStatus
	]);
	function handleOpenChange(nextOpen, eventDetails) {
		const isHover = eventDetails.reason === triggerHover;
		if (!interactionsEnabled) return;
		if (pointerType === "touch" && isHover) return;
		if (!nextOpen && value !== itemValue) return;
		function changeState() {
			if (isHover) {
				setStickIfOpen(true);
				stickIfOpenTimeout.clear();
				stickIfOpenTimeout.start(500, () => {
					setStickIfOpen(false);
				});
			}
			if (nextOpen) setValue(itemValue, eventDetails);
			else {
				setValue(null, eventDetails);
				setPointerType("");
			}
		}
		if (isHover) import_react_dom.flushSync(changeState);
		else changeState();
	}
	const context = useFloatingRootContext({
		open,
		onOpenChange: handleOpenChange,
		elements: {
			reference: triggerElement,
			floating: hoverFloatingElement
		}
	});
	const hoverInteractionState = useHoverInteractionSharedState(context);
	const shouldBlockSafePolygonPointerEvents = pointerType !== "touch";
	import_react.useEffect(() => {
		if (!open) {
			context.context.dataRef.current.openEvent = void 0;
			hoverInteractionState.pointerType = void 0;
			hoverInteractionState.interactedInside = false;
			hoverInteractionState.restTimeoutPending = false;
			hoverInteractionState.openChangeTimeout.clear();
			hoverInteractionState.restTimeout.clear();
		}
		return () => {
			clearSafePolygonPointerEventsMutation(hoverInteractionState);
		};
	}, [
		context,
		hoverInteractionState,
		open
	]);
	const getInlineHandleCloseContext = useStableCallback(() => {
		if (!nested || positionerElement || !triggerElementRef.current || !hoverFloatingElement) return null;
		return getHandleCloseContext(triggerElementRef.current, hoverFloatingElement, nodeId);
	});
	function getScope() {
		if (nested && positionerElement) return null;
		return triggerElementRef.current?.closest("ul") ?? null;
	}
	const hoverProps = useHoverReferenceInteraction(context, {
		enabled: hoverInteractionsEnabled,
		move: false,
		handleClose: safePolygon({
			blockPointerEvents: shouldBlockSafePolygonPointerEvents,
			getScope
		}),
		restMs: mounted && positionerElement ? 0 : delay,
		delay: { close: closeDelay },
		triggerElementRef,
		getHandleCloseContext: getInlineHandleCloseContext
	});
	const hover = import_react.useMemo(() => hoverProps ? { reference: hoverProps } : void 0, [hoverProps]);
	const click = useClick(context, {
		enabled: interactionsEnabled,
		stickIfOpen,
		toggle: isActiveItem
	});
	const referenceProps = import_react.useMemo(() => mergeProps(click.reference, hover?.reference), [click.reference, hover]);
	useIsoLayoutEffect(() => {
		if (isActiveItem) {
			setFloatingRootContext(context);
			prevTriggerElementRef.current = triggerElement;
		}
	}, [
		isActiveItem,
		context,
		setFloatingRootContext,
		prevTriggerElementRef,
		triggerElement
	]);
	function handleActivation(event) {
		import_react_dom.flushSync(() => {
			const currentTarget = event.currentTarget;
			const prevTriggerRect = prevTriggerElementRef.current?.getBoundingClientRect();
			if (mounted && prevTriggerRect && triggerElement) {
				const nextTriggerRect = triggerElement.getBoundingClientRect();
				const isMovingRight = nextTriggerRect.left > prevTriggerRect.left;
				const isMovingDown = nextTriggerRect.top > prevTriggerRect.top;
				if (orientation === "horizontal" && nextTriggerRect.left !== prevTriggerRect.left) setActivationDirection(isMovingRight ? "right" : "left");
				else if (orientation === "vertical" && nextTriggerRect.top !== prevTriggerRect.top) setActivationDirection(isMovingDown ? "down" : "up");
			}
			if (event.type !== "click" && value != null) context.context.dataRef.current.openEvent = void 0;
			if (pointerType === "touch" && event.type !== "click") return;
			if (value != null && event.type !== "keydown") setValue(itemValue, createChangeEventDetails(event.type === "mouseenter" ? triggerHover : triggerPress, event.nativeEvent));
			if (event.type === "mouseenter" && shouldBlockSafePolygonPointerEvents && (!nested || !positionerElement) && hoverFloatingElement) {
				const applyPointerEventsMutation = () => {
					const scopeElement = getScope() ?? currentTarget.ownerDocument.body;
					applySafePolygonPointerEventsMutation(hoverInteractionState, {
						scopeElement,
						referenceElement: currentTarget,
						floatingElement: hoverFloatingElement
					});
				};
				if (value != null && value !== itemValue) queueMicrotask(applyPointerEventsMutation);
				else applyPointerEventsMutation();
			}
		});
	}
	const handleOpenEvent = useStableCallback((event) => {
		if (disabled) return;
		if (!popupElement || !positionerElement) {
			handleActivation(event);
			return;
		}
		const { width, height } = getCssDimensions(popupElement);
		const shouldSkipAutoSizeSync = value != null && value !== itemValue && (event.type === "click" || pointerType !== "touch");
		handleActivation(event);
		if (shouldSkipAutoSizeSync) skipAutoSizeSyncRef.current = true;
		handleValueChange(popupElement, positionerElement, width, height);
	});
	const state = {
		open: isActiveItem,
		disabled
	};
	function handleSetPointerType(event) {
		setPointerType(event.pointerType);
	}
	function handleTriggerPointerDown(event) {
		handleSetPointerType(event);
		clearSafePolygonPointerEventsMutation(hoverInteractionState);
	}
	const defaultProps = {
		tabIndex: 0,
		onMouseEnter: handleOpenEvent,
		onClick: handleOpenEvent,
		onPointerEnter: handleSetPointerType,
		onPointerDown: handleTriggerPointerDown,
		"aria-expanded": isActiveItem,
		"aria-controls": isActiveItem ? popupElement?.id : void 0,
		[NAVIGATION_MENU_TRIGGER_IDENTIFIER]: "",
		onFocus() {
			if (!isActiveItem) return;
			setViewportInert(false);
		},
		onMouseLeave() {
			if (value == null) clearSafePolygonPointerEventsMutation(hoverInteractionState);
		},
		onKeyDown(event) {
			if (nested) return;
			const verticalOpenKey = direction === "rtl" ? "ArrowLeft" : "ArrowRight";
			const openHorizontal = orientation === "horizontal" && event.key === "ArrowDown";
			const openVertical = orientation === "vertical" && event.key === verticalOpenKey;
			if (openHorizontal || openVertical) {
				setValue(itemValue, createChangeEventDetails(listNavigation, event.nativeEvent));
				handleOpenEvent(event);
				stopEvent(event);
			}
		},
		onBlur(event) {
			if (positionerElement && popupElement && isOutsideMenuEvent({
				currentTarget: event.currentTarget,
				relatedTarget: event.relatedTarget
			}, {
				popupElement,
				rootRef,
				tree,
				nodeId
			})) setValue(null, createChangeEventDetails(focusOut, event.nativeEvent));
		}
	};
	const { getButtonProps, buttonRef } = useButton({
		disabled,
		focusableWhenDisabled: true,
		native: nativeButton
	});
	const referenceElement = hoverFloatingElement;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/*#__PURE__*/ (0, import_jsx_runtime.jsx)(CompositeItem, {
		tag: "button",
		render,
		className,
		style,
		state,
		stateAttributesMapping: pressableTriggerOpenStateMapping,
		refs: [
			forwardedRef,
			handleTriggerElement,
			buttonRef
		],
		props: [
			referenceProps,
			dismissProps?.reference || EMPTY_ARRAY,
			defaultProps,
			elementProps,
			getButtonProps
		]
	}), isActiveItem && /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [
		/*#__PURE__*/ (0, import_jsx_runtime.jsx)(FocusGuard, {
			ref: beforeOutsideRef,
			onFocus: (event) => {
				if (referenceElement && isOutsideEvent(event, referenceElement)) beforeInsideRef.current?.focus();
				else getPreviousTabbable(triggerElement)?.focus();
			}
		}),
		/*#__PURE__*/ (0, import_jsx_runtime.jsx)("span", {
			"aria-owns": viewportElement?.id,
			style: ownerVisuallyHidden
		}),
		/*#__PURE__*/ (0, import_jsx_runtime.jsx)(FocusGuard, {
			ref: afterOutsideRef,
			onFocus: (event) => {
				if (referenceElement && isOutsideEvent(event, referenceElement)) {
					import_react_dom.flushSync(() => {
						setViewportInert(false);
					});
					(afterInsideRef.current || triggerElement)?.focus();
				} else {
					let nextTabbable = getNextTabbable(triggerElement);
					if (nested && !positionerElement && referenceElement && nextTabbable && contains(referenceElement, nextTabbable)) nextTabbable = getTabbableAfterElement(afterInsideRef.current);
					nextTabbable?.focus();
					if ((!nested || positionerElement) && !contains(rootRef.current, nextTabbable)) setValue(null, createChangeEventDetails("focus-out", event.nativeEvent));
				}
			}
		})
	] })] });
});
function getPlacementFromElements(domReferenceElement, floatingElement) {
	const referenceRect = domReferenceElement.getBoundingClientRect();
	const floatingRect = floatingElement.getBoundingClientRect();
	const referenceCenterX = referenceRect.left + referenceRect.width / 2;
	const referenceCenterY = referenceRect.top + referenceRect.height / 2;
	const floatingCenterX = floatingRect.left + floatingRect.width / 2;
	const floatingCenterY = floatingRect.top + floatingRect.height / 2;
	const deltaX = floatingCenterX - referenceCenterX;
	const deltaY = floatingCenterY - referenceCenterY;
	if (Math.abs(deltaX) >= Math.abs(deltaY)) return deltaX >= 0 ? "right" : "left";
	return deltaY >= 0 ? "bottom" : "top";
}
function getHandleCloseContext(domReferenceElement, floatingElement, nodeId) {
	return {
		placement: getPlacementFromElements(domReferenceElement, floatingElement),
		elements: {
			domReference: domReferenceElement,
			floating: floatingElement
		},
		nodeId
	};
}
//#endregion
//#region node_modules/@base-ui/react/navigation-menu/portal/NavigationMenuPortalContext.mjs
var NavigationMenuPortalContext = /*#__PURE__*/ import_react.createContext(void 0);
function useNavigationMenuPortalContext() {
	const value = import_react.useContext(NavigationMenuPortalContext);
	if (value === void 0) throw new Error(formatErrorMessage(40));
	return value;
}
//#endregion
//#region node_modules/@base-ui/react/navigation-menu/portal/NavigationMenuPortal.mjs
/**
* A portal element that moves the popup to a different part of the DOM.
* By default, the portal element is appended to `<body>`.
* Renders a `<div>` element.
*
* Documentation: [Base UI Navigation Menu](https://base-ui.com/react/components/navigation-menu)
*/
var NavigationMenuPortal = /*#__PURE__*/ import_react.forwardRef(function NavigationMenuPortal(props, forwardedRef) {
	const { keepMounted = false, ...portalProps } = props;
	const { mounted } = useNavigationMenuRootContext();
	if (!(mounted || keepMounted)) return null;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(NavigationMenuPortalContext.Provider, {
		value: keepMounted,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FloatingPortal, {
			ref: forwardedRef,
			...portalProps
		})
	});
});
//#endregion
//#region node_modules/@base-ui/react/navigation-menu/utils/useNavigationMenuAnchorPositioning.mjs
/**
* Positioning path for the Navigation Menu, whose active trigger supplies its root store after the
* positioner has already rendered.
*/
function useNavigationMenuAnchorPositioning(params) {
	return useAnchorPositioningWithHook(params, useFloating);
}
//#endregion
//#region node_modules/@base-ui/react/navigation-menu/positioner/NavigationMenuPositionerContext.mjs
var NavigationMenuPositionerContext = /*#__PURE__*/ import_react.createContext(void 0);
function useNavigationMenuPositionerContext(optional = false) {
	const context = import_react.useContext(NavigationMenuPositionerContext);
	if (!context && !optional) throw new Error(formatErrorMessage(42));
	return context;
}
//#endregion
//#region node_modules/@base-ui/react/navigation-menu/positioner/NavigationMenuPositioner.mjs
var EMPTY_ROOT_CONTEXT$1 = getEmptyRootContext();
/**
* Positions the navigation menu against the currently active trigger.
* Renders a `<div>` element.
*
* Documentation: [Base UI Navigation Menu](https://base-ui.com/react/components/navigation-menu)
*/
var NavigationMenuPositioner = /*#__PURE__*/ import_react.forwardRef(function NavigationMenuPositioner(componentProps, forwardedRef) {
	const { open, mounted, positionerElement, setPositionerElement, floatingRootContext, nested, transitionStatus } = useNavigationMenuRootContext();
	const { className, render, anchor, positionMethod = "absolute", side = "bottom", align = "center", sideOffset = 0, alignOffset = 0, collisionBoundary = "clipping-ancestors", collisionPadding = 5, collisionAvoidance = nested ? POPUP_COLLISION_AVOIDANCE : DROPDOWN_COLLISION_AVOIDANCE, arrowPadding = 5, sticky = false, disableAnchorTracking = false, style, ...elementProps } = componentProps;
	const keepMounted = useNavigationMenuPortalContext();
	const nodeId = useNavigationMenuTreeContext();
	const initialInstantTimeout = useTimeout();
	const resizeTimeout = useTimeout();
	const [instant, setInstant] = import_react.useState(open);
	const needsInitialInstantResetRef = import_react.useRef(open);
	import_react.useEffect(() => {
		if (!positionerElement) return;
		function onFocus(event) {
			if (positionerElement && isOutsideEvent(event)) (event.type === "focusin" ? enableFocusInside : disableFocusInside)(positionerElement);
		}
		return mergeCleanups(addEventListener(positionerElement, "focusin", onFocus, true), addEventListener(positionerElement, "focusout", onFocus, true));
	}, [positionerElement]);
	const domReference = (floatingRootContext || EMPTY_ROOT_CONTEXT$1).useState("domReferenceElement");
	const positioning = useNavigationMenuAnchorPositioning({
		anchor: anchor ?? domReference,
		positionMethod,
		mounted,
		side,
		sideOffset,
		align,
		alignOffset,
		arrowPadding,
		collisionBoundary,
		collisionPadding,
		sticky,
		disableAnchorTracking,
		keepMounted,
		floatingRootContext,
		collisionAvoidance,
		shift: { rootBoundary: "layoutViewport" },
		nodeId,
		adaptiveOrigin
	});
	const state = {
		open,
		side: positioning.side,
		align: positioning.align,
		anchorHidden: positioning.anchorHidden,
		instant
	};
	import_react.useEffect(() => {
		if (!open) return;
		if (needsInitialInstantResetRef.current) initialInstantTimeout.start(0, () => {
			needsInitialInstantResetRef.current = false;
			if (!resizeTimeout.isStarted()) setInstant(false);
		});
		function handleResize() {
			import_react_dom.flushSync(() => {
				setInstant(true);
			});
			resizeTimeout.start(100, () => {
				setInstant(false);
			});
		}
		const win = getWindow(positionerElement);
		return addEventListener(win, "resize", handleResize);
	}, [
		open,
		initialInstantTimeout,
		resizeTimeout,
		positionerElement
	]);
	const element = usePositioner(componentProps, state, {
		styles: positioning.positionerStyles,
		transitionStatus,
		props: elementProps,
		refs: [forwardedRef, setPositionerElement],
		hidden: !mounted,
		inert: !open
	});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(NavigationMenuPositionerContext.Provider, {
		value: positioning,
		children: element
	});
});
//#endregion
//#region node_modules/@base-ui/react/navigation-menu/viewport/NavigationMenuViewport.mjs
var EMPTY_ROOT_CONTEXT = getEmptyRootContext();
function Guards({ children }) {
	const { beforeInsideRef, beforeOutsideRef, afterInsideRef, afterOutsideRef, positionerElement, viewportElement, floatingRootContext } = useNavigationMenuRootContext();
	const hasPositioner = Boolean(useNavigationMenuPositionerContext(true));
	const referenceElement = positionerElement || viewportElement;
	if (!floatingRootContext && !hasPositioner) return children;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [
		/*#__PURE__*/ (0, import_jsx_runtime.jsx)(FocusGuard, {
			ref: beforeInsideRef,
			onFocus: (event) => {
				if (referenceElement && isOutsideEvent(event, referenceElement)) getNextTabbable(referenceElement)?.focus();
				else beforeOutsideRef.current?.focus();
			}
		}),
		children,
		/*#__PURE__*/ (0, import_jsx_runtime.jsx)(FocusGuard, {
			ref: afterInsideRef,
			onFocus: (event) => {
				if (referenceElement && isOutsideEvent(event, referenceElement)) getPreviousTabbable(referenceElement)?.focus();
				else afterOutsideRef.current?.focus();
			}
		})
	] });
}
/**
* The clipping viewport of the navigation menu's current content.
* Renders a `<div>` element.
*
* Documentation: [Base UI Navigation Menu](https://base-ui.com/react/components/navigation-menu)
*/
var NavigationMenuViewport = /*#__PURE__*/ import_react.forwardRef(function NavigationMenuViewport(componentProps, forwardedRef) {
	const { render, className, style, children, id: idProp, ...elementProps } = componentProps;
	const id = useId$1(idProp);
	const { setViewportElement, setViewportTargetElement, floatingRootContext, prevTriggerElementRef, viewportInert, setViewportInert } = useNavigationMenuRootContext();
	const positioning = useNavigationMenuPositionerContext(true);
	const hasPositioner = Boolean(positioning);
	const domReference = (floatingRootContext || EMPTY_ROOT_CONTEXT).useState("domReferenceElement");
	useIsoLayoutEffect(() => {
		if (domReference) prevTriggerElementRef.current = domReference;
	}, [domReference, prevTriggerElementRef]);
	const element = useRenderElement("div", componentProps, {
		ref: [forwardedRef, setViewportElement],
		props: [{
			id,
			onBlur(event) {
				const relatedTarget = event.relatedTarget;
				const currentTarget = event.currentTarget;
				if (relatedTarget && !contains(currentTarget, relatedTarget) && relatedTarget !== domReference) setViewportInert(true);
			},
			...!hasPositioner && viewportInert && { inert: inertValue(true) },
			children: hasPositioner ? children : /*#__PURE__*/ (0, import_jsx_runtime.jsx)(Guards, { children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)("div", {
				ref: setViewportTargetElement,
				children
			}) })
		}, elementProps]
	});
	return hasPositioner ? /*#__PURE__*/ (0, import_jsx_runtime.jsx)(Guards, { children: element }) : element;
});
//#endregion
//#region node_modules/@base-ui/react/navigation-menu/popup/NavigationMenuPopup.mjs
/**
* A container for the navigation menu contents.
* Renders a `<nav>` element.
*
* Documentation: [Base UI Navigation Menu](https://base-ui.com/react/components/navigation-menu)
*/
var NavigationMenuPopup = /*#__PURE__*/ import_react.forwardRef(function NavigationMenuPopup(componentProps, forwardedRef) {
	const { render, className, style, id: idProp, ...elementProps } = componentProps;
	const { open, transitionStatus, setPopupElement } = useNavigationMenuRootContext();
	const positioning = useNavigationMenuPositionerContext();
	const direction = useDirection();
	const id = useBaseUiId(idProp);
	const state = {
		open,
		transitionStatus,
		side: positioning.side,
		align: positioning.align,
		anchorHidden: positioning.anchorHidden
	};
	let isPhysicalLeft = positioning.side === "left";
	if (direction === "rtl") isPhysicalLeft = isPhysicalLeft || positioning.side === "inline-end";
	else isPhysicalLeft = isPhysicalLeft || positioning.side === "inline-start";
	const isOriginSide = positioning.side === "top" || isPhysicalLeft;
	return useRenderElement("nav", componentProps, {
		state,
		ref: [forwardedRef, setPopupElement],
		props: [
			{
				id,
				tabIndex: -1,
				style: isOriginSide ? {
					position: "absolute",
					[positioning.side === "top" ? "bottom" : "top"]: "0",
					[isPhysicalLeft ? "right" : "left"]: "0"
				} : {}
			},
			getDisabledMountTransitionStyles(transitionStatus),
			elementProps
		],
		stateAttributesMapping: popupTransitionStateMapping
	});
});
//#endregion
//#region node_modules/@base-ui/react/navigation-menu/link/NavigationMenuLink.mjs
/**
* A link in the navigation menu that can be used to navigate to a different page or section.
* Renders an `<a>` element.
*
* Documentation: [Base UI Navigation Menu](https://base-ui.com/react/components/navigation-menu)
*/
var NavigationMenuLink = /*#__PURE__*/ import_react.forwardRef(function NavigationMenuLink(componentProps, forwardedRef) {
	const { className, render, active = false, closeOnClick = false, style, ...elementProps } = componentProps;
	const { setValue, popupElement, positionerElement, rootRef } = useNavigationMenuRootContext();
	const nodeId = useNavigationMenuTreeContext();
	const tree = useFloatingTree();
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CompositeItem, {
		tag: "a",
		render,
		className,
		style,
		state: { active },
		refs: [forwardedRef],
		props: [{
			"aria-current": active ? "page" : void 0,
			tabIndex: void 0,
			onClick(event) {
				if (closeOnClick) setValue(null, createChangeEventDetails(linkPress, event.nativeEvent));
			},
			onBlur(event) {
				if (positionerElement && popupElement && isOutsideMenuEvent({
					currentTarget: event.currentTarget,
					relatedTarget: event.relatedTarget
				}, {
					popupElement,
					rootRef,
					tree,
					nodeId
				})) setValue(null, createChangeEventDetails(focusOut, event.nativeEvent));
			}
		}, elementProps]
	});
});
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/home/slots/header.js
var navItemVariants = cva("[&_svg]:size-4", {
	variants: { variant: {
		main: "inline-flex items-center gap-1 p-2 text-fd-muted-foreground transition-colors hover:text-fd-accent-foreground data-[active=true]:text-fd-primary",
		button: buttonVariants({
			color: "secondary",
			className: "gap-1.5"
		}),
		icon: buttonVariants({
			color: "ghost",
			size: "icon"
		})
	} },
	defaultVariants: { variant: "main" }
});
var MobileNavigationMenuContext = (0, import_react.createContext)(null);
function Header$1(props) {
	const { navItems, menuItems, slots, props: { nav } } = useHomeLayout();
	const headerRef = (0, import_react.useRef)(null);
	const listRef = (0, import_react.useRef)(null);
	const [open, setOpen] = (0, import_react.useState)(false);
	const t = useTranslations({ note: "home layout header" });
	const transparentMode = nav?.transparentMode ?? "none";
	const isTop = useIsScrollTop({ enabled: transparentMode === "top" }) ?? true;
	const isNavTransparent = transparentMode === "top" ? isTop : transparentMode === "always";
	const onClick = (0, import_react.useEffectEvent)((e) => {
		const element = headerRef.current;
		if (!open || !element) return;
		if (element !== e.target && !element.contains(e.target)) setOpen(false);
	});
	(0, import_react.useEffect)(() => {
		window.addEventListener("click", onClick);
		return () => {
			window.removeEventListener("click", onClick);
		};
	}, []);
	const list = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NavigationMenuList, {
		ref: listRef,
		render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {}),
		className: "flex h-14 w-full mx-auto max-w-(--fd-layout-width) items-center px-4",
		children: [
			slots.navTitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.navTitle, { className: "inline-flex items-center gap-2.5 font-semibold" }),
			nav?.children,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-row items-center gap-2 px-6 max-sm:hidden",
				children: navItems.filter((item) => !isSecondary(item)).map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationMenuLinkItem, {
					item,
					className: "text-sm"
				}, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-row items-center justify-end gap-1.5 flex-1 max-lg:hidden",
				children: [
					slots.searchTrigger && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.searchTrigger.full, {
						hideIfDisabled: true,
						className: "w-full rounded-full ps-2.5 max-w-[240px]"
					}),
					slots.themeSwitch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.themeSwitch, {}),
					slots.languageSelect && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.languageSelect.root, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Languages, { className: "size-5" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "flex flex-row gap-2 items-center empty:hidden",
						children: navItems.filter(isSecondary).map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationMenuLinkItem, {
							className: cn$1(item.type === "icon" && "-mx-1 first:ms-0 last:me-0"),
							item
						}, i))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-row items-center ms-auto -me-1.5 lg:hidden",
				children: [slots.searchTrigger && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.searchTrigger.sm, {
					hideIfDisabled: true,
					className: "p-2"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleTrigger, {
					"aria-label": t("Toggle Menu", { note: "aria-label" }),
					className: cn$1(buttonVariants({
						size: "icon",
						color: "ghost"
					})),
					onPointerEnter: nav?.enableHoverToOpen ? () => {
						setOpen(true);
					} : void 0,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn$1("transition-transform", open && "rotate-180") })
				})]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Collapsible, {
		open,
		onOpenChange: setOpen,
		render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			id: "nd-nav",
			...props,
			ref: mergeRefs(headerRef, props.ref),
			className: cn$1("sticky h-14 top-0 z-40", props.className),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NavigationMenuRoot, {
				className: (s) => cn$1("backdrop-blur-lg border-b transition-[box-shadow,background-color,border-radius]", open && "max-lg:shadow-lg max-lg:rounded-b-2xl", (open || !isNavTransparent || s.open) && "bg-fd-background/80"),
				children: [
					list,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleContent, {
						className: "mx-auto max-w-(--fd-layout-width) lg:hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-col pt-2 p-4 sm:flex-row sm:items-center sm:justify-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MobileNavigationMenuContext, {
								value: (0, import_react.useMemo)(() => ({ setOpen }), []),
								children: [menuItems.filter((item) => !isSecondary(item)).map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileNavigationMenuLinkItem, {
									item,
									className: "sm:hidden"
								}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "-ms-1.5 flex flex-row items-center gap-2 max-sm:mt-2",
									children: [
										menuItems.filter(isSecondary).map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileNavigationMenuLinkItem, {
											item,
											className: cn$1(item.type === "icon" && "-mx-1 first:ms-0")
										}, i)),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											role: "separator",
											className: "flex-1"
										}),
										slots.languageSelect && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(slots.languageSelect.root, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Languages, { className: "size-5" }),
											slots.languageSelect.text && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.languageSelect.text, {}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3 text-fd-muted-foreground" })
										] }),
										slots.themeSwitch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.themeSwitch, {})
									]
								})]
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationMenuPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationMenuPositioner, {
						side: "bottom",
						anchor: listRef,
						collisionPadding: {
							top: 5,
							bottom: 5
						},
						className: "z-40 box-border h-(--positioner-height) w-(--anchor-width) max-w-(--available-width) duration-(--duration) ease-(--easing) before:absolute before:content-[''] data-instant:transition-none data-[side=bottom]:before:top-[-10px] data-[side=bottom]:before:right-0 data-[side=bottom]:before:left-0 data-[side=bottom]:before:h-2.5 data-[side=left]:before:top-0 data-[side=left]:before:right-[-10px] data-[side=left]:before:bottom-0 data-[side=left]:before:w-2.5 data-[side=right]:before:top-0 data-[side=right]:before:bottom-0 data-[side=right]:before:left-[-10px] data-[side=right]:before:w-2.5 data-[side=top]:before:right-0 data-[side=top]:before:bottom-[-10px] data-[side=top]:before:left-0 data-[side=top]:before:h-2.5",
						style: {
							["--duration"]: "0.35s",
							["--easing"]: "cubic-bezier(0.22, 1, 0.36, 1)"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationMenuPopup, {
							className: "relative border h-(--popup-height) w-full rounded-xl bg-fd-popover/80 text-fd-popover-foreground backdrop-blur-md shadow-lg transition-[opacity,width,height] duration-(--duration) ease-(--easing) data-ending-style:opacity-0 data-ending-style:duration-150 data-starting-style:opacity-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationMenuViewport, { className: "relative size-full overflow-hidden" })
						})
					}) })
				]
			})
		})
	});
}
function isSecondary(item) {
	if ("secondary" in item && item.secondary != null) return item.secondary;
	return item.type === "icon";
}
function NavigationMenuLinkItem({ item, className, ...props }) {
	if (item.type === "custom") return item.children;
	if (item.type === "menu") {
		const children = item.items.map((child, j) => {
			if (child.type === "custom") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: child.children }, j);
			const { banner = child.icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-fit rounded-md border bg-fd-muted p-1 [&_svg]:size-4",
				children: child.icon
			}) : null, ...rest } = child.menu ?? {};
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationMenuLink, { render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
				href: child.url,
				external: child.external,
				...rest,
				className: cn$1("flex flex-col gap-2 rounded-lg border bg-fd-card p-3 transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground", rest.className),
				children: rest.children ?? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					banner,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-base font-medium",
						children: child.text
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-fd-muted-foreground empty:hidden",
						children: child.description
					})
				] })
			}) }, `${j}-${child.url}`);
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NavigationMenuItem, {
			className: cn$1("list-none", className),
			...props,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationMenuTrigger, {
				className: cn$1(navItemVariants(), "rounded-md"),
				children: item.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
					href: item.url,
					external: item.external,
					children: item.text
				}) : item.text
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationMenuContent, {
				className: cn$1("h-full w-(--anchor-width) max-w-(--available-width) p-3", "transition-[opacity,transform,translate] duration-(--duration) ease-(--easing)", "data-starting-style:opacity-0 data-ending-style:opacity-0", "data-starting-style:data-[activation-direction=left]:-translate-x-1/2", "data-starting-style:data-[activation-direction=right]:translate-x-1/2", "data-ending-style:data-[activation-direction=left]:translate-x-1/2", "data-ending-style:data-[activation-direction=right]:-translate-x-1/2", "grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3"),
				children
			})]
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationMenuItem, {
		className: cn$1("list-none", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationMenuLink, { render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkItem, {
			item,
			"aria-label": item.type === "icon" ? item.label : void 0,
			className: cn$1(navItemVariants({ variant: item.type })),
			children: item.type === "icon" ? item.icon : item.text
		}) })
	});
}
function MobileNavigationMenuLinkItem({ item, ...props }) {
	const { setOpen } = (0, import_react.use)(MobileNavigationMenuContext);
	if (item.type === "custom") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn$1("grid", props.className),
		children: item.children
	});
	if (item.type === "menu") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn$1("mb-4 flex flex-col", props.className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-1 text-sm text-fd-muted-foreground",
			children: item.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
				href: item.url,
				external: item.external,
				onClick: () => setOpen(false),
				children: [item.icon, item.text]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [item.icon, item.text] })
		}), item.items.map((child, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileNavigationMenuLinkItem, { item: child }, i))]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LinkItem, {
		item,
		className: cn$1({
			main: "inline-flex items-center gap-2 py-1.5 transition-colors hover:text-fd-popover-foreground/50 data-[active=true]:font-medium data-[active=true]:text-fd-primary [&_svg]:size-4",
			icon: buttonVariants({
				size: "icon",
				color: "ghost"
			}),
			button: buttonVariants({
				color: "secondary",
				className: "gap-1.5 [&_svg]:size-4"
			})
		}[item.type ?? "main"], props.className),
		"aria-label": item.type === "icon" ? item.label : void 0,
		onClick: () => setOpen(false),
		children: [item.icon, item.type === "icon" ? void 0 : item.text]
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/home/index.js
var LayoutContext$1 = (0, import_react.createContext)(null);
function useHomeLayout() {
	const context = (0, import_react.use)(LayoutContext$1);
	if (!context) throw new Error("Please use this component under <HomeLayout /> (`fumadocs-ui/layouts/home`).");
	return context;
}
var { useBaseSlots: useBaseSlots$1 } = baseSlots({ useProps() {
	return useHomeLayout().props;
} });
function HomeLayout(props) {
	const { nav: { enabled: navEnabled = true } = {}, slots: defaultSlots, children, i18n: _i18n, githubUrl: _githubUrl, links: _links, themeSwitch: _themeSwitch, searchToggle: _searchToggle, ...rest } = props;
	const { baseSlots, baseProps } = useBaseSlots$1(props);
	const linkItems = useLinkItems(props);
	const slots = {
		...baseSlots,
		header: defaultSlots?.header ?? InlineHeader,
		container: defaultSlots?.container ?? Container$2
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutContext$1, {
		value: {
			props: baseProps,
			slots,
			...linkItems
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(slots.container, {
			...rest,
			children: [navEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.header, {}), children]
		})
	});
}
function InlineHeader(props) {
	const { nav } = useHomeLayout().props;
	if (nav?.component) return nav.component;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header$1, { ...props });
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/notebook/slots/container.js
function Container$1(props) {
	const { props: { nav }, slots } = useNotebookLayout();
	const pageCol = "calc(var(--fd-layout-width,97rem) - var(--fd-sidebar-col) - var(--fd-toc-width))";
	const { collapsed } = slots.sidebar?.useSidebar?.() ?? {};
	const [previousCollapsed, setPreviousCollapsed] = (0, import_react.useState)(collapsed);
	const isCollapseChanged = previousCollapsed !== collapsed;
	(0, import_react.useEffect)(() => {
		if (isCollapseChanged) setPreviousCollapsed(collapsed);
	}, [collapsed, isCollapseChanged]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		id: "nd-notebook-layout",
		"data-sidebar-collapsed": collapsed,
		"data-column-changed": isCollapseChanged,
		...props,
		style: {
			gridTemplate: nav?.mode === "top" ? `". header header header ."
"sidebar sidebar toc-popover toc-popover ."
"sidebar sidebar main toc ." 1fr / minmax(min-content, 1fr) var(--fd-sidebar-col) minmax(0, ${pageCol}) var(--fd-toc-width) minmax(min-content, 1fr)` : `"sidebar sidebar header header ."
"sidebar sidebar toc-popover toc-popover ."
"sidebar sidebar main toc ." 1fr / minmax(min-content, 1fr) var(--fd-sidebar-col) minmax(0, ${pageCol}) var(--fd-toc-width) minmax(min-content, 1fr)`,
			"--fd-docs-row-1": "var(--fd-banner-height, 0px)",
			"--fd-docs-row-2": "calc(var(--fd-docs-row-1) + var(--fd-header-height))",
			"--fd-docs-row-3": "calc(var(--fd-docs-row-2) + var(--fd-toc-popover-height))",
			"--fd-sidebar-col": collapsed ? "0px" : "var(--fd-sidebar-width)",
			...props.style
		},
		className: cn$1("grid overflow-x-clip min-h-(--fd-docs-height) auto-cols-auto auto-rows-auto [--fd-docs-height:100dvh] [--fd-header-height:0px] [--fd-toc-popover-height:0px] [--fd-sidebar-width:0px] [--fd-toc-width:0px] data-[column-changed=true]:transition-[grid-template-columns]", props.className),
		children: props.children
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/notebook/slots/sidebar.js
var itemVariants = cva("relative flex flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground wrap-anywhere [&_svg]:size-4 [&_svg]:shrink-0", { variants: {
	variant: {
		link: "transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary data-[active=true]:hover:transition-colors",
		button: "transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none"
	},
	highlight: { true: "data-[active=true]:before:content-[''] data-[active=true]:before:bg-fd-primary data-[active=true]:before:absolute data-[active=true]:before:w-px data-[active=true]:before:inset-y-2.5 data-[active=true]:before:start-2.5" }
} });
function getItemOffset(depth) {
	return `calc(${2 + 3 * depth} * var(--spacing))`;
}
var { useSidebar } = base_exports;
function SidebarProvider(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarProvider$1, { ...props });
}
function SidebarTrigger(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarTrigger$1, { ...props });
}
function SidebarCollapseTrigger(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarCollapseTrigger$1, { ...props });
}
function SidebarContent({ ref: refProp, className, children, ...props }) {
	const { props: { nav } } = useNotebookLayout();
	const navMode = nav?.mode ?? "auto";
	const ref = (0, import_react.useRef)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarContent$1, { children: ({ collapsed, hovered, ref: asideRef, ...rest }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-sidebar-placeholder": "",
		className: cn$1("sticky z-20 [grid-area:sidebar] pointer-events-none *:pointer-events-auto md:layout:[--fd-sidebar-width:268px] max-md:hidden", navMode === "auto" ? "top-(--fd-docs-row-1) h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))]" : "top-(--fd-docs-row-2) h-[calc(var(--fd-docs-height)-var(--fd-docs-row-2))]"),
		children: [collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute start-0 inset-y-0 w-4",
			...rest
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
			id: "nd-sidebar",
			ref: mergeRefs(ref, refProp, asideRef),
			"data-collapsed": collapsed,
			"data-hovered": collapsed && hovered,
			className: cn$1("absolute flex flex-col w-full start-0 inset-y-0 items-end text-sm duration-250 *:w-(--fd-sidebar-width)", navMode === "auto" && "bg-fd-card border-e", collapsed && ["inset-y-2 rounded-xl bg-fd-card transition-transform border w-(--fd-sidebar-width)", hovered ? "shadow-lg translate-x-2 rtl:-translate-x-2" : "-translate-x-(--fd-sidebar-width) rtl:translate-x-full"], ref.current && ref.current.getAttribute("data-collapsed") === "true" !== collapsed && "transition-[width,inset-block,translate,background-color]", className),
			...props,
			...rest,
			children
		})]
	}) });
}
function SidebarDrawer({ children, className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarDrawerOverlay, { className: "fixed z-40 inset-0 backdrop-blur-xs data-[state=open]:animate-fd-fade-in data-[state=closed]:animate-fd-fade-out" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarDrawerContent, {
		className: cn$1("fixed text-[0.9375rem] flex flex-col shadow-lg border-s end-0 inset-y-0 w-[85%] max-w-[380px] z-40 bg-fd-background data-[state=open]:animate-fd-sidebar-in data-[state=closed]:animate-fd-sidebar-out", className),
		...props,
		children
	})] });
}
function SidebarFolder(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarFolder$1, { ...props });
}
function SidebarSeparator({ className, style, children, ...props }) {
	const depth = useFolderDepth();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarSeparator$1, {
		className: cn$1("inline-flex items-center gap-2 mb-1.5 px-2 mt-6 empty:mb-0 [&_svg]:size-4 [&_svg]:shrink-0", depth === 0 && "first:mt-0", className),
		style: {
			paddingInlineStart: getItemOffset(depth),
			...style
		},
		...props,
		children
	});
}
function SidebarItem({ className, style, children, ...props }) {
	const depth = useFolderDepth();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarItem$1, {
		className: cn$1(itemVariants({
			variant: "link",
			highlight: depth >= 1
		}), className),
		style: {
			paddingInlineStart: getItemOffset(depth),
			...style
		},
		...props,
		children
	});
}
function SidebarFolderTrigger({ className, style, ...props }) {
	const { depth, collapsible } = useFolder();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarFolderTrigger$1, {
		className: (state) => cn$1(itemVariants({ variant: collapsible ? "button" : null }), "w-full", typeof className === "function" ? className(state) : className),
		style: {
			paddingInlineStart: getItemOffset(depth - 1),
			...style
		},
		...props,
		children: props.children
	});
}
function SidebarFolderLink({ className, style, ...props }) {
	const depth = useFolderDepth();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarFolderLink$1, {
		className: cn$1(itemVariants({
			variant: "link",
			highlight: depth > 1
		}), "w-full", className),
		style: {
			paddingInlineStart: getItemOffset(depth - 1),
			...style
		},
		...props,
		children: props.children
	});
}
function SidebarFolderContent({ className, children, ...props }) {
	const depth = useFolderDepth();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarFolderContent$1, {
		className: (state) => cn$1("relative flex flex-col gap-0.5 pt-0.5", depth === 1 && "before:content-[''] before:absolute before:w-px before:inset-y-1 before:bg-fd-border before:start-2.5", typeof className === "function" ? className(state) : className),
		...props,
		children
	});
}
var SidebarPageTree = createPageTreeRenderer({
	SidebarFolder,
	SidebarFolderContent,
	SidebarFolderLink,
	SidebarFolderTrigger,
	SidebarItem,
	SidebarSeparator
});
var SidebarLinkItem = createLinkItemRenderer({
	SidebarFolder,
	SidebarFolderContent,
	SidebarFolderLink,
	SidebarFolderTrigger,
	SidebarItem
});
function Sidebar({ banner, footer, components, collapsible = true, ...rest }) {
	const { menuItems, slots, props: { nav, tabs, tabMode } } = useNotebookLayout();
	const navMode = nav?.mode ?? "auto";
	const iconLinks = menuItems.filter((item) => item.type === "icon");
	function renderHeader(props) {
		if (typeof banner === "function") return (0, import_react.createElement)(banner, props);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			...props,
			className: cn$1("flex flex-col gap-3 p-4 pb-2 empty:hidden", props.className),
			children: [props.children, banner]
		});
	}
	function renderFooter(props) {
		if (typeof footer === "function") return (0, import_react.createElement)(footer, props);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			...props,
			children: [props.children, footer]
		});
	}
	const viewport = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarViewport, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-0.5",
		children: [menuItems.filter((item) => item.type !== "icon").map((item, i, arr) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarLinkItem, {
			item,
			className: cn$1("lg:hidden", i === arr.length - 1 && "mb-4")
		}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarPageTree, { ...components })]
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarContent, {
		...rest,
		children: [
			renderHeader({ children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [navMode === "auto" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between",
				children: [
					slots.navTitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.navTitle, { className: "inline-flex items-center gap-2.5 font-medium" }),
					nav?.children,
					collapsible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarCollapseTrigger, {
						className: cn$1(buttonVariants({
							color: "ghost",
							size: "icon-sm",
							className: "mt-px mb-auto text-fd-muted-foreground"
						})),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, {})
					})
				]
			}), tabs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarTabsDropdown, {
				options: tabs,
				className: cn$1(tabMode === "navbar" && "lg:hidden")
			})] }) }),
			viewport,
			renderFooter({
				className: cn$1("hidden flex-row text-fd-muted-foreground items-center border-t px-4 py-2.5", iconLinks.length > 0 && "max-lg:flex"),
				children: iconLinks.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkItem, {
					item,
					className: cn$1(buttonVariants({
						size: "icon-sm",
						color: "ghost",
						className: "lg:hidden"
					})),
					"aria-label": item.label,
					children: item.icon
				}, i))
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarDrawer, {
		...rest,
		children: [
			renderHeader({ children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarTrigger, {
				className: cn$1(buttonVariants({
					size: "icon-sm",
					color: "ghost",
					className: "ms-auto text-fd-muted-foreground"
				})),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
			}), tabs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarTabsDropdown, { options: tabs })] }) }),
			viewport,
			renderFooter({
				className: cn$1("hidden flex-row text-fd-muted-foreground items-center border-t p-4 pt-2 justify-end", (slots.languageSelect || slots.themeSwitch) && "flex", iconLinks.length > 0 && "max-lg:flex"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					iconLinks.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkItem, {
						item,
						className: cn$1(buttonVariants({
							size: "icon-sm",
							color: "ghost"
						}), "text-fd-muted-foreground lg:hidden", i === iconLinks.length - 1 && "me-auto"),
						"aria-label": item.label,
						children: item.icon
					}, i)),
					slots.languageSelect && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.languageSelect.root, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Languages, { className: "size-4.5 text-fd-muted-foreground" }) }),
					slots.themeSwitch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.themeSwitch, {})
				] })
			})
		]
	})] });
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/notebook/slots/header.js
function Header(props) {
	const { slots, navItems, isNavTransparent, props: { tabMode, nav, tabs, sidebar } } = useNotebookLayout();
	const { open } = slots.sidebar?.useSidebar?.() ?? {};
	const navMode = nav?.mode ?? "auto";
	const sidebarCollapsible = sidebar.collapsible ?? true;
	const groups = useTabsGroups(tabs);
	const showLayoutTabs = tabMode === "navbar" && groups.length > 0;
	if (nav?.component) return nav.component;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		id: "nd-subnav",
		"data-transparent": isNavTransparent && !open,
		...props,
		className: cn$1("sticky [grid-area:header] flex flex-col top-(--fd-docs-row-1) z-10 backdrop-blur-sm transition-colors data-[transparent=false]:bg-fd-background/80 layout:[--fd-header-height:--spacing(14)]", showLayoutTabs && "lg:layout:[--fd-header-height:--spacing(24)]", props.className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-header-body": "",
			className: cn$1("flex border-b px-4 gap-2 h-14", navMode === "top" && "md:px-6"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn$1("items-center", navMode === "top" && "flex flex-1", navMode === "auto" && "hidden has-data-[collapsed=true]:md:flex max-md:flex"),
					children: [
						sidebarCollapsible && slots.sidebar && navMode === "auto" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.sidebar.collapseTrigger, {
							className: cn$1(buttonVariants({
								color: "ghost",
								size: "icon-sm"
							}), "-ms-1.5 text-fd-muted-foreground data-[collapsed=false]:hidden max-md:hidden"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, {})
						}),
						slots.navTitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.navTitle, { className: cn$1("inline-flex items-center gap-2.5 font-semibold", navMode === "auto" && "md:hidden") }),
						nav?.children
					]
				}),
				slots.searchTrigger && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.searchTrigger.full, {
					hideIfDisabled: true,
					className: cn$1("w-full my-auto max-md:hidden", navMode === "top" ? "ps-2.5 rounded-xl max-w-sm" : "max-w-[240px]")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-1 items-center justify-end md:gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-6 empty:hidden max-lg:hidden",
							children: navItems.filter((item) => item.type !== "icon").map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavbarLinkItem, { item }, i))
						}),
						navItems.filter((item) => item.type === "icon").map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkItem, {
							item,
							className: cn$1(buttonVariants({
								size: "icon-sm",
								color: "ghost"
							}), "text-fd-muted-foreground max-lg:hidden"),
							"aria-label": item.label,
							children: item.icon
						}, i)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center md:hidden",
							children: [slots.searchTrigger && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.searchTrigger.sm, {
								hideIfDisabled: true,
								className: "p-2"
							}), slots.sidebar && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.sidebar.trigger, {
								className: cn$1(buttonVariants({
									color: "ghost",
									size: "icon-sm",
									className: "p-2 -me-1.5"
								})),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, {})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 max-md:hidden",
							children: [
								slots.languageSelect && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.languageSelect.root, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Languages, { className: "size-4.5 text-fd-muted-foreground" }) }),
								slots.themeSwitch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.themeSwitch, {}),
								sidebarCollapsible && slots.sidebar && navMode === "top" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.sidebar.collapseTrigger, {
									className: cn$1(buttonVariants({
										color: "secondary",
										size: "icon-sm"
									}), "text-fd-muted-foreground rounded-full -me-1.5"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, {})
								})
							]
						})
					]
				})
			]
		}), showLayoutTabs && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutHeaderTabs, {
			"data-header-tabs": "",
			className: "overflow-x-auto border-b px-6 h-10 max-lg:hidden",
			tabs
		})]
	});
}
function LayoutHeaderTabs({ tabs: allTabs, className, ...props }) {
	const pathname = usePathname();
	const path = useTreePath();
	const tabs = useTabsGroups(allTabs).findLast((group) => typeof group.active?.root !== "string")?.options;
	const typedTabs = (0, import_react.useMemo)(() => {
		return allTabs.filter((tab) => typeof tab.$folder?.root === "string");
	}, [allTabs]);
	const selectedIdx = (0, import_react.useMemo)(() => {
		return tabs?.findLastIndex((option) => isLayoutTabActive(option, path, pathname)) ?? -1;
	}, [
		tabs,
		path,
		pathname
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn$1("flex flex-row items-end gap-6", className),
		...props,
		children: [typedTabs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarTabsDropdown, {
			options: typedTabs,
			className: "my-auto p-1"
		}), tabs?.map((option, i) => {
			const { title, url, unlisted, props: { className, ...rest } = {} } = option;
			const isSelected = selectedIdx === i;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
				href: url,
				className: cn$1("inline-flex border-b-2 border-transparent transition-colors items-center pb-1.5 font-medium gap-2 text-fd-muted-foreground text-sm text-nowrap hover:text-fd-accent-foreground", unlisted && !isSelected && "hidden", isSelected && "border-fd-primary text-fd-primary", className),
				...rest,
				children: title
			}, i);
		})]
	});
}
function NavbarLinkItem({ item, className, ...props }) {
	if (item.type === "custom") return item.children;
	if (item.type === "menu") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavbarLinkItemMenu, {
		item,
		className,
		...props
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkItem, {
		item,
		className: cn$1("text-sm text-fd-muted-foreground transition-colors hover:text-fd-accent-foreground data-[active=true]:text-fd-primary", className),
		...props,
		children: item.text
	});
}
function NavbarLinkItemMenu({ item, hoverDelay = 50, className, ...props }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const timeoutRef = (0, import_react.useRef)(null);
	const freezeUntil = (0, import_react.useRef)(null);
	const delaySetOpen = (value) => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		timeoutRef.current = window.setTimeout(() => {
			setOpen(value);
			freezeUntil.current = Date.now() + 300;
		}, hoverDelay);
	};
	const onPointerEnter = (e) => {
		if (e.pointerType === "touch") return;
		delaySetOpen(true);
	};
	const onPointerLeave = (e) => {
		if (e.pointerType === "touch") return;
		delaySetOpen(false);
	};
	function isTouchDevice() {
		return "ontouchstart" in window || navigator.maxTouchPoints > 0;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
		open,
		onOpenChange: (value) => {
			if (freezeUntil.current === null || Date.now() >= freezeUntil.current) setOpen(value);
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverTrigger, {
			className: cn$1("inline-flex items-center gap-1.5 p-1 text-sm text-fd-muted-foreground transition-colors has-data-[active=true]:text-fd-primary data-[popup-open]:text-fd-accent-foreground focus-visible:outline-none", className),
			onPointerEnter,
			onPointerLeave,
			...props,
			children: [item.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkItem, {
				item,
				children: item.text
			}) : item.text, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
			className: "flex flex-col p-1 text-fd-muted-foreground text-start",
			onPointerEnter,
			onPointerLeave,
			children: item.items.map((child, i) => {
				if (child.type === "custom") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: child.children }, i);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LinkItem, {
					item: child,
					className: "inline-flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground data-[active=true]:text-fd-primary [&_svg]:size-4",
					onClick: () => {
						if (isTouchDevice()) setOpen(false);
					},
					children: [child.icon, child.text]
				}, i);
			})
		})]
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/notebook/client.js
var { useBaseSlots } = baseSlots({ useProps() {
	return useNotebookLayout().props;
} });
var LayoutContext = (0, import_react.createContext)(null);
function useNotebookLayout() {
	const context = (0, import_react.use)(LayoutContext);
	if (!context) throw new Error("Please use <DocsPage /> (`fumadocs-ui/layouts/notebook/page`) under <DocsLayout /> (`fumadocs-ui/layouts/notebook`).");
	return context;
}
function LayoutBody(props) {
	const { nav: { enabled: navEnabled = true, transparentMode: navTransparentMode = "none" } = {}, sidebar: { defaultOpenLevel, prefetch, ...sidebarProps } = {}, slots: defaultSlots, tabMode = "sidebar", tabs, tree, containerProps, children } = props;
	const isTop = useIsScrollTop({ enabled: navTransparentMode === "top" }) ?? true;
	const isNavTransparent = navTransparentMode === "top" ? isTop : navTransparentMode === "always";
	const { baseSlots, baseProps } = useBaseSlots(props);
	const linkItems = useLinkItems(props);
	const slots = {
		...baseSlots,
		header: defaultSlots?.header ?? Header,
		container: defaultSlots?.container ?? Container$1,
		sidebar: defaultSlots?.sidebar ?? {
			provider: SidebarProvider,
			root: Sidebar,
			trigger: SidebarTrigger,
			collapseTrigger: SidebarCollapseTrigger,
			useSidebar
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreeContextProvider, {
		tree,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutContext, {
			value: {
				props: {
					tabs,
					tabMode,
					sidebar: sidebarProps,
					...baseProps
				},
				isNavTransparent,
				slots,
				...linkItems
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.sidebar.provider, {
				defaultOpenLevel,
				prefetch,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(slots.container, {
					...containerProps,
					children: [
						navEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.header, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.sidebar.root, { ...sidebarProps }),
						children
					]
				})
			})
		})
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/notebook/page/slots/toc.js
function TOCProvider(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TOCProvider$2, { ...props });
}
function TOC({ container, header, footer, style = "normal", list }) {
	const t = useTranslations({ note: "table of contents" });
	const items = useTOCItems();
	const { TOCItems, TOCEmpty, TOCItem } = style === "clerk" ? clerk_exports : default_exports;
	if (items.length === 0 && !footer && !header) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		id: "nd-toc-placeholder",
		className: "hidden xl:layout:[--fd-toc-width:268px]"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		id: "nd-toc",
		...container,
		className: cn$1("sticky top-(--fd-docs-row-3) [grid-area:toc] h-[calc(var(--fd-docs-height)-var(--fd-docs-row-3))] flex flex-col w-(--fd-toc-width) pt-12 pe-4 pb-2 xl:layout:[--fd-toc-width:268px] max-xl:hidden", container?.className),
		children: [
			header,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				id: "toc-title",
				className: "inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextAlignStart, { className: "size-4" }), t("On this page")]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TOCScrollArea, {
				className: "ms-px",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TOCItems, {
					...list,
					children: [items.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TOCEmpty, {}), items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TOCItem, { item }, item.url))]
				})
			}),
			footer
		]
	});
}
var TocPopoverContext = (0, import_react.createContext)(null);
function TOCPopover({ container, trigger, content, header, footer, style = "normal", list }) {
	const items = useTOCItems();
	const ref = (0, import_react.useRef)(null);
	const [open, setOpen] = (0, import_react.useState)(false);
	const { isNavTransparent } = useNotebookLayout();
	const { TOCItems, TOCItem, TOCEmpty } = style === "clerk" ? clerk_exports : default_exports;
	const onClickOutside = (0, import_react.useEffectEvent)((e) => {
		if (!open || !(e.target instanceof HTMLElement)) return;
		if (ref.current && !ref.current.contains(e.target)) setOpen(false);
	});
	const onClickItem = () => {
		setOpen(false);
	};
	(0, import_react.useEffect)(() => {
		window.addEventListener("click", onClickOutside);
		return () => {
			window.removeEventListener("click", onClickOutside);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TocPopoverContext, {
		value: (0, import_react.useMemo)(() => ({
			open,
			setOpen
		}), [setOpen, open]),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Collapsible, {
			open,
			onOpenChange: setOpen,
			"data-toc-popover": "",
			...container,
			className: cn$1("sticky top-(--fd-docs-row-2) z-10 [grid-area:toc-popover] h-(--fd-toc-popover-height) xl:hidden max-xl:layout:[--fd-toc-popover-height:--spacing(10)]", container?.className),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				ref,
				className: cn$1("border-b backdrop-blur-sm transition-colors", (!isNavTransparent || open) && "bg-fd-background/80", open && "shadow-lg"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTOCPopoverTrigger, { ...trigger }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageTOCPopoverContent, {
					...content,
					children: [
						header,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TOCScrollArea, {
							className: "ms-px",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TOCItems, {
								...list,
								children: [items.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TOCEmpty, {}), items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TOCItem, {
									item,
									onClick: onClickItem
								}, item.url))]
							})
						}),
						footer
					]
				})]
			})
		})
	});
}
function PageTOCPopoverTrigger({ className, ...props }) {
	const t = useTranslations({ note: "table of contents" });
	const { open } = (0, import_react.use)(TocPopoverContext);
	const items = useItems();
	const selectedIdx = items.findIndex((item) => item.active);
	const path = useTreePath().at(-1);
	const showItem = selectedIdx !== -1 && !open;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CollapsibleTrigger, {
		className: cn$1("flex w-full h-10 items-center text-sm text-fd-muted-foreground gap-2.5 px-4 py-2.5 text-start focus-visible:outline-none [&_svg]:size-4 md:px-6", className),
		"data-toc-popover-trigger": "",
		...props,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressCircle, {
				value: (items.findLastIndex((item) => item.active) + 1) / Math.max(1, items.length),
				max: 1,
				className: cn$1("shrink-0", open && "text-fd-primary")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "grid flex-1 *:my-auto *:row-start-1 *:col-start-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn$1("truncate transition-[opacity,translate,color]", open && "text-fd-foreground", showItem && "opacity-0 -translate-y-full pointer-events-none"),
					children: path?.name ?? t("On this page")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn$1("truncate transition-[opacity,translate]", !showItem && "opacity-0 translate-y-full pointer-events-none"),
					children: items[selectedIdx]?.original.title
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn$1("shrink-0 transition-transform mx-0.5", open && "rotate-180") })
		]
	});
}
function clamp(input, min, max) {
	if (input < min) return min;
	if (input > max) return max;
	return input;
}
function ProgressCircle({ value, strokeWidth = 1.5, size = 18, min = 0, max = 100, style, ...restSvgProps }) {
	const normalizedValue = clamp(value, min, max);
	const radius = size / 2 - strokeWidth;
	const circumference = 2 * Math.PI * radius;
	const progress = normalizedValue / max * circumference;
	const circleProps = {
		cx: size / 2,
		cy: size / 2,
		r: radius,
		fill: "none",
		strokeWidth
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		role: "progressbar",
		viewBox: `0 0 ${size} ${size}`,
		"aria-valuenow": normalizedValue,
		"aria-valuemin": min,
		"aria-valuemax": max,
		style: {
			width: size,
			height: size,
			...style
		},
		...restSvgProps,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			...circleProps,
			className: "stroke-current/25"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			...circleProps,
			stroke: "currentColor",
			strokeDasharray: circumference,
			strokeDashoffset: circumference - progress,
			strokeLinecap: "round",
			transform: `rotate(-90 ${size / 2} ${size / 2})`,
			className: "transition-all"
		})]
	});
}
function PageTOCPopoverContent(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleContent, {
		"data-toc-popover-content": "",
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col px-4 max-h-[50vh] md:px-6",
			children: props.children
		})
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/notebook/page/slots/footer.js
function Footer({ items, children, className, ...props }) {
	const footerList = useFooterItems();
	const pathname = usePathname();
	const { previous, next } = (0, import_react.useMemo)(() => {
		if (items) return items;
		const idx = footerList.findIndex((item) => isActive(item.url, pathname));
		if (idx === -1) return {};
		return {
			previous: footerList[idx - 1],
			next: footerList[idx + 1]
		};
	}, [
		footerList,
		items,
		pathname
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn$1("@container grid gap-4", previous && next ? "grid-cols-2" : "grid-cols-1", className),
		...props,
		children: [previous && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterItem, {
			item: previous,
			index: 0
		}), next && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterItem, {
			item: next,
			index: 1
		})]
	}), children] });
}
function FooterItem({ item, index }) {
	const t = useTranslations({ note: "pagination" });
	const Icon = index === 0 ? ChevronLeft : ChevronRight;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
		href: item.url,
		className: cn$1("flex flex-col gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground @max-lg:col-span-full", index === 1 && "text-end"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn$1("inline-flex items-center gap-1.5 font-medium", index === 1 && "flex-row-reverse"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "-mx-1 size-4 shrink-0 rtl:rotate-180" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: item.name })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-fd-muted-foreground truncate",
			children: item.description ?? (index === 0 ? t("Previous Page") : t("Next Page"))
		})]
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/notebook/page/slots/breadcrumb.js
function Breadcrumb({ includeRoot, includeSeparator, includePage, ...props }) {
	const path = useTreePath();
	const { root } = useTreeContext();
	const items = (0, import_react.useMemo)(() => {
		return getBreadcrumbItemsFromPath(root, path, {
			includePage,
			includeSeparator,
			includeRoot
		});
	}, [
		includePage,
		includeRoot,
		includeSeparator,
		path,
		root
	]);
	if (items.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		...props,
		className: cn$1("flex items-center gap-1.5 text-sm text-fd-muted-foreground", props.className),
		children: items.map((item, i) => {
			const className = cn$1("truncate", i === items.length - 1 && "text-fd-primary font-medium");
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [i !== 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3.5 shrink-0" }), item.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
				href: item.url,
				className: cn$1(className, "transition-opacity hover:opacity-80"),
				children: item.name
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className,
				children: item.name
			})] }, i);
		})
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/notebook/page/slots/container.js
function Container(props) {
	const { full } = useDocsPage();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid [grid-area:main]",
		"data-layout-main": "",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
			id: "nd-page",
			"data-layout-content": "",
			"data-full": full,
			...props,
			className: cn$1("flex flex-col min-w-0 px-4 py-6 gap-4 md:px-6 md:pt-8 xl:px-8 xl:pt-14 *:max-w-[900px]", full && "*:max-w-[1285px]", props.className),
			children: props.children
		})
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/notebook/page/index.js
var PageContext = (0, import_react.createContext)(null);
function useDocsPage() {
	const context = (0, import_react.use)(PageContext);
	if (!context) throw new Error("Please use page components under <DocsPage /> (`fumadocs-ui/layouts/notebook/page`).");
	return context;
}
function DocsPage({ full = false, tableOfContent: { enabled: tocEnabled = !full, single, ...tocProps } = {}, tableOfContentPopover: { enabled: tocPopoverEnabled, ...tocPopoverProps } = {}, breadcrumb: { enabled: breadcrumbEnabled = true, ...breadcrumb } = {}, footer: { enabled: footerEnabled = true, ...footer } = {}, toc = [], slots: defaultSlots = {}, children, ...containerProps }) {
	tocPopoverEnabled ??= Boolean(toc.length > 0 || tocPopoverProps.header || tocPopoverProps.footer);
	const slots = {
		breadcrumb: defaultSlots.breadcrumb ?? Breadcrumb,
		footer: defaultSlots.footer ?? Footer,
		toc: defaultSlots.toc ?? {
			provider: TOCProvider,
			main: TOC,
			popover: TOCPopover
		},
		container: defaultSlots.container ?? Container
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageContext, {
		value: {
			full,
			slots
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(slots.toc.provider, {
			single,
			toc: tocEnabled || tocPopoverEnabled ? toc : [],
			children: [
				tocPopoverEnabled && (tocPopoverProps.component ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.toc.popover, { ...tocPopoverProps })),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(slots.container, {
					...containerProps,
					children: [
						breadcrumbEnabled && (breadcrumb.component ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.breadcrumb, { ...breadcrumb })),
						children,
						footerEnabled && (footer.component ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.footer, { ...footer }))
					]
				}),
				tocEnabled && (tocProps.component ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.toc.main, { ...tocProps }))
			]
		})
	});
}
/**
* Add typography styles
*/
function DocsBody({ children, className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		...props,
		className: cn$1("prose flex-1", className),
		children
	});
}
function DocsDescription({ children, className, ...props }) {
	if (children === void 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		...props,
		className: cn$1("mb-8 text-lg text-fd-muted-foreground", className),
		children
	});
}
function DocsTitle({ children, className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
		...props,
		className: cn$1("text-[1.75em] font-semibold", className),
		children
	});
}
function PageLastUpdate({ date: value, ...props }) {
	const t = useTranslations({ note: "page footer" });
	const [date, setDate] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setDate(value.toLocaleDateString());
	}, [value]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		...props,
		className: cn$1("text-sm text-fd-muted-foreground", props.className),
		children: [
			t("Last updated on"),
			" ",
			date
		]
	});
}
//#endregion
//#region node_modules/fumapress/dist/components/blog-panel.js
var panelButtonVariants = cva("inline-flex items-center font-medium gap-2 px-3 py-2 transition-all duration-150 rounded-lg hover:text-fd-accent-foreground hover:bg-fd-accent active:scale-95");
function BlogPanel() {
	const items = useTOCItems();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [isSuccessful, onCopy] = useCopyButton(() => {
		if (navigator.share) return navigator.share({
			title: document.title,
			url: location.href
		});
		else return navigator.clipboard.writeText(location.href);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Collapsible, {
		open,
		onOpenChange: setOpen,
		className: "fixed w-full max-w-[calc(100%---spacing(4))] left-1/2 -translate-x-1/2 bottom-2 border shadow-md text-sm bg-fd-secondary/80 backdrop-blur-sm z-20 p-1 rounded-xl sm:max-w-[400px] sm:bottom-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TOCScrollArea, {
			className: "max-h-[min(600px,calc(100vh---spacing(30)))]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TOCItems, { children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TOCItem$1, {
				item,
				onClick: () => setOpen(false)
			}, item.url)) })
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-row gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CollapsibleTrigger, {
				className: cn(panelButtonVariants(), "min-w-0"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(T, {
						text: "Table of Contents",
						note: "blog panel"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("size-3.5 shrink-0 text-fd-muted-foreground transition-transform", open && "rotate-180") })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: cn(panelButtonVariants(), "ms-auto text-fd-muted-foreground"),
				onClick: onCopy,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share, { className: "size-3.5 shrink-0" }), isSuccessful ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(T, {
					text: "Copied",
					note: "blog panel"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(T, {
					text: "Share",
					note: "blog panel"
				})]
			})]
		})]
	});
}
function BlogProvider({ toc, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TOCProvider$2, {
		toc,
		children
	});
}
//#endregion
//#region \0virtual:vite-rsc/client-references/group/shared:node_modules/@fuma-translate/react/dist/index.mjs
var export_4851f1db4d2a = { T };
var export_becc1a081aff = { Image };
var export_0817f5b3b49f = { default: Link$1 };
var export_9c1899cbc660 = {
	Accordion,
	Accordions
};
var export_5c57a93f55ec = {
	CodeBlock,
	CodeBlockTab,
	CodeBlockTabs,
	CodeBlockTabsList,
	CodeBlockTabsTrigger,
	Pre
};
var export_fbfe50abbf7b = {
	File,
	Files,
	Folder
};
var export_e70dc53bce46 = { Heading };
var export_95bdd8cb34e3 = {
	Tab,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger
};
var export_3bd706baf759 = { GlassLayout };
var export_edf18fee0631 = {
	DocsBody: DocsBody$1,
	DocsDescription: DocsDescription$1,
	DocsPage: DocsPage$1,
	DocsTitle: DocsTitle$1,
	MarkdownCopyButton,
	PageLastUpdate: PageLastUpdate$1,
	ViewOptionsPopover
};
var export_7ce05cec18ef = { HomeLayout };
var export_859200a8131f = { LayoutBody };
var export_4e8efe524788 = {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
	MarkdownCopyButton,
	PageLastUpdate,
	ViewOptionsPopover
};
var export_92754d11c7d6 = {
	BlogPanel,
	BlogProvider
};
var export_47f03de92207 = { Link: Link$1$1 };
//#endregion
export { export_0817f5b3b49f, export_3bd706baf759, export_47f03de92207, export_4851f1db4d2a, export_4e8efe524788, export_5c57a93f55ec, export_7ce05cec18ef, export_859200a8131f, export_92754d11c7d6, export_95bdd8cb34e3, export_9c1899cbc660, export_becc1a081aff, export_e70dc53bce46, export_edf18fee0631, export_fbfe50abbf7b };
