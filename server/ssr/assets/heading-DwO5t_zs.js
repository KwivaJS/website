import { i as __toESM } from "./rolldown-runtime-B4iAMlE-.js";
import { t as require_jsx_runtime } from "./jsx-runtime-BqLYtsoi.js";
import { t as require_react } from "./react-SLAb4Nsi.js";
import { r as cn, t as buttonVariants } from "./button-Cpca6tPg.js";
import { t as useCopyButton } from "./use-copy-button-7PXhh8CI.js";
import { t as mergeRefs } from "./merge-refs-BfwMulAo.js";
import { t as useControlled } from "./useControlled-B0XDiIsy.js";
import { $ as useIsoLayoutEffect, A as createChangeEventDetails, B as missing, K as EMPTY_ARRAY, L as initial, N as disabled, Q as useRefWithInit, V as none, X as formatErrorMessage, Z as useStableCallback, n as useOpenChangeComplete, q as EMPTY_OBJECT, t as useTransitionStatus } from "./useTransitionStatus-CgpR1fP4.js";
import { n as useBaseUiId, r as useRenderElement, s as useMergedRefs, t as transitionStatusMapping } from "./stateAttributesMapping-B8mynGFP.js";
import { _ as isListIndexDisabled, a as ARROW_UP, b as getTarget, c as MODIFIER_KEYS, d as inertValue, f as findNonDisabledListIndex, g as isIndexOutOfListBounds, i as ARROW_RIGHT, l as isNativeInput, m as getMinListIndex, n as ARROW_DOWN, o as COMPOSITE_KEYS, p as getMaxListIndex, r as ARROW_LEFT, u as scrollIntoViewIfNeeded, v as activeElement, x as ownerDocument, y as contains } from "./search-moGbV3Yd.js";
import { n as CompositeRootContext, r as useCompositeRootContext, t as useButton } from "./useButton-CmgotloM.js";
import { n as useDirection } from "./DirectionContext-CCPO2bjM.js";
import { t as createLucideIcon } from "./createLucideIcon-CUS0Rvh9.js";
import { t as Check } from "./check-C0qe87e9.js";
import { c as useTranslations } from "./framework-BVFfi5Qn.js";
//#region node_modules/@base-ui/react/internals/composite/list/CompositeListContext.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var CompositeListContext = /*#__PURE__*/ import_react.createContext({
	register: () => {},
	unregister: () => {},
	subscribeMapChange: () => () => {},
	nextIndexRef: { current: 0 }
});
function useCompositeListContext() {
	return import_react.useContext(CompositeListContext);
}
//#endregion
//#region node_modules/@base-ui/react/internals/composite/list/CompositeList.mjs
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime(), 1);
/**
* Provides context for a list of items in a composite component.
*/
function CompositeList(props) {
	const { children, elementsRef, labelsRef, onMapChange: onMapChangeProp } = props;
	const onMapChange = useStableCallback(onMapChangeProp);
	const [, setMapTick] = import_react.useState(false);
	const listeners = useRefWithInit(createListeners).current;
	const map = useRefWithInit(createMap).current;
	const nextIndexRef = import_react.useRef(0);
	const isDirtyRef = import_react.useRef(true);
	const itemsRef = import_react.useRef(null);
	const mutationObserverRef = import_react.useRef(null);
	const scheduleMapUpdate = useStableCallback(() => {
		if (isDirtyRef.current) return;
		isDirtyRef.current = true;
		setMapTick((tick) => !tick);
	});
	const register = useStableCallback((node, registration) => {
		map.set(node, registration);
		scheduleMapUpdate();
	});
	const unregister = useStableCallback((node) => {
		map.delete(node);
		scheduleMapUpdate();
	});
	const syncRefs = useStableCallback((items) => {
		const nextMap = /* @__PURE__ */ new Map();
		elementsRef.current.length = 0;
		if (labelsRef) labelsRef.current.length = 0;
		items.forEach((item) => {
			nextMap.set(item.element, {
				...item.registration.metadata ?? {},
				index: item.index
			});
			elementsRef.current[item.index] = item.element;
			if (labelsRef) labelsRef.current[item.index] = item.registration.label !== void 0 ? item.registration.label : item.registration.textRef?.current?.textContent ?? item.element.textContent;
		});
		nextIndexRef.current = elementsRef.current.length;
		return nextMap;
	});
	function observe(sortedNodes) {
		mutationObserverRef.current?.disconnect();
		mutationObserverRef.current = null;
		if (typeof MutationObserver !== "function" || sortedNodes.length < 2) return;
		const mutationObserver = new MutationObserver((entries) => {
			if (!hasMovedNode(entries)) return;
			let previousConnectedNode = null;
			for (const node of sortedNodes) {
				if (!node.isConnected) continue;
				if (previousConnectedNode && sortByDocumentPosition(previousConnectedNode, node) > 0) {
					mutationObserver.disconnect();
					scheduleMapUpdate();
					return;
				}
				previousConnectedNode = node;
			}
		});
		mutationObserverRef.current = mutationObserver;
		const roots = /* @__PURE__ */ new Set();
		for (let i = 1; i < sortedNodes.length; i += 1) {
			const root = getCommonAncestor(sortedNodes[i - 1], sortedNodes[i]);
			if (root) roots.add(root);
		}
		roots.forEach((root) => mutationObserver.observe(root, { childList: true }));
	}
	const flush = useStableCallback(() => {
		const [items, automaticNodes] = getCompositeListSnapshot(map);
		const nextMap = syncRefs(items);
		const previousItems = itemsRef.current;
		const changed = !previousItems || previousItems.length !== items.length || items.some((item, index) => {
			const previousItem = previousItems[index];
			return item.index !== previousItem.index || item.element !== previousItem.element || item.registration.index !== previousItem.registration.index || item.registration.metadata !== previousItem.registration.metadata;
		});
		observe(automaticNodes);
		itemsRef.current = items;
		isDirtyRef.current = false;
		if (!changed) return;
		listeners.forEach((listener) => listener(nextMap));
		onMapChange(nextMap);
	});
	useIsoLayoutEffect(() => {
		if (!isDirtyRef.current && itemsRef.current) syncRefs(itemsRef.current);
		return () => {
			elementsRef.current = [];
			if (labelsRef) labelsRef.current = [];
		};
	}, [
		elementsRef,
		labelsRef,
		syncRefs
	]);
	useIsoLayoutEffect(() => {
		if (isDirtyRef.current) flush();
	});
	useIsoLayoutEffect(() => {
		return () => {
			mutationObserverRef.current?.disconnect();
			isDirtyRef.current = true;
		};
	}, []);
	const subscribeMapChange = useStableCallback((fn) => {
		listeners.add(fn);
		return () => {
			listeners.delete(fn);
		};
	});
	const contextValue = import_react.useMemo(() => ({
		register,
		unregister,
		subscribeMapChange,
		nextIndexRef
	}), [
		register,
		unregister,
		subscribeMapChange,
		nextIndexRef
	]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CompositeListContext.Provider, {
		value: contextValue,
		children
	});
}
function createMap() {
	return /* @__PURE__ */ new Map();
}
function createListeners() {
	return /* @__PURE__ */ new Set();
}
function getCompositeListSnapshot(map) {
	const reservedIndices = /* @__PURE__ */ new Set();
	const items = [];
	const automaticItems = [];
	map.forEach((registration, node) => {
		if (!node.isConnected) return;
		const index = registration.index;
		const item = {
			index: index ?? -1,
			element: node,
			registration
		};
		if (index === null) automaticItems.push(item);
		else if (index >= 0) {
			reservedIndices.add(index);
			items.push(item);
		}
	});
	let nextAutomaticIndex = 0;
	automaticItems.sort((a, b) => sortByDocumentPosition(a.element, b.element));
	automaticItems.forEach((item) => {
		while (reservedIndices.has(nextAutomaticIndex)) nextAutomaticIndex += 1;
		item.index = nextAutomaticIndex;
		items.push(item);
		nextAutomaticIndex += 1;
	});
	if (reservedIndices.size > 0) items.sort((a, b) => a.index - b.index);
	return [items, automaticItems.map((item) => item.element)];
}
function getCommonAncestor(firstNode, lastNode) {
	let ancestor = firstNode.parentElement;
	while (ancestor && !ancestor.contains(lastNode)) ancestor = ancestor.parentElement;
	return ancestor;
}
function hasMovedNode(entries) {
	for (const entry of entries) for (let i = 0; i < entry.removedNodes.length; i += 1) if (entry.removedNodes[i].isConnected) return true;
	return false;
}
function sortByDocumentPosition(a, b) {
	return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}
//#endregion
//#region node_modules/@base-ui/react/tabs/root/TabsRootContext.mjs
/**
* @internal
*/
var TabsRootContext = /*#__PURE__*/ import_react.createContext(void 0);
function useTabsRootContext() {
	const context = import_react.useContext(TabsRootContext);
	if (context === void 0) throw new Error(formatErrorMessage(64));
	return context;
}
//#endregion
//#region node_modules/@base-ui/react/tabs/root/TabsRootDataAttributes.mjs
/**
* Indicates the direction of the activation (based on the previous active tab).
* @type {'left' | 'right' | 'up' | 'down' | 'none'}
*/
var activationDirection = "data-activation-direction";
//#endregion
//#region node_modules/@base-ui/react/tabs/root/stateAttributesMapping.mjs
var tabsStateAttributesMapping = { tabActivationDirection: (dir) => ({ [activationDirection]: dir }) };
//#endregion
//#region node_modules/@base-ui/react/tabs/root/TabsRoot.mjs
/**
* Groups the tabs and the corresponding panels.
* Renders a `<div>` element.
*
* Documentation: [Base UI Tabs](https://base-ui.com/react/components/tabs)
*/
var TabsRoot = /*#__PURE__*/ import_react.forwardRef(function TabsRoot(componentProps, forwardedRef) {
	const { className, defaultValue: defaultValueProp = 0, onValueChange: onValueChangeProp, orientation = "horizontal", render, value: valueProp, style, ...elementProps } = componentProps;
	const hasExplicitDefaultValueProp = componentProps.defaultValue !== void 0;
	const tabPanelRefs = import_react.useRef([]);
	const [mountedTabPanels, setMountedTabPanels] = import_react.useState(() => /* @__PURE__ */ new Map());
	const [value, setValue] = useControlled({
		controlled: valueProp,
		default: defaultValueProp,
		name: "Tabs",
		state: "value"
	});
	const isControlled = valueProp !== void 0;
	const [tabMap, setTabMap] = import_react.useState(() => /* @__PURE__ */ new Map());
	const lastKnownTabElementRef = import_react.useRef(void 0);
	const getTabElementBySelectedValue = import_react.useCallback((selectedValue) => findTabElement(tabMap, selectedValue), [tabMap]);
	const [activationDirectionState, setActivationDirectionState] = import_react.useState(() => ({
		previousValue: value,
		tabActivationDirection: "none"
	}));
	const { previousValue, tabActivationDirection: committedTabActivationDirection } = activationDirectionState;
	let tabActivationDirection = committedTabActivationDirection;
	let directionComputationIncomplete = false;
	if (previousValue !== value) {
		tabActivationDirection = computeActivationDirection(previousValue, value, orientation, tabMap);
		directionComputationIncomplete = previousValue != null && value != null && getTabElementBySelectedValue(value) == null;
	}
	const nextPreviousValue = directionComputationIncomplete ? previousValue : value;
	const shouldSyncActivationDirectionState = previousValue !== nextPreviousValue || committedTabActivationDirection !== tabActivationDirection;
	useIsoLayoutEffect(() => {
		if (!shouldSyncActivationDirectionState) return;
		setActivationDirectionState({
			previousValue: nextPreviousValue,
			tabActivationDirection
		});
	}, [
		nextPreviousValue,
		shouldSyncActivationDirectionState,
		tabActivationDirection
	]);
	const onValueChange = useStableCallback((newValue, eventDetails) => {
		eventDetails.activationDirection = computeActivationDirection(value, newValue, orientation, tabMap);
		onValueChangeProp?.(newValue, eventDetails);
		if (eventDetails.isCanceled) return;
		setValue(newValue);
	});
	const notifyAutomaticValueChange = useStableCallback((nextValue, reason) => {
		onValueChangeProp?.(nextValue, createChangeEventDetails(reason, void 0, void 0, { activationDirection: "none" }));
	});
	const registerMountedTabPanel = useStableCallback((panelValue, panelId) => {
		setMountedTabPanels((prev) => {
			const next = new Map(prev);
			next.set(panelValue, panelId);
			return next;
		});
		return () => {
			setMountedTabPanels((prev) => {
				if (prev.get(panelValue) !== panelId) return prev;
				const next = new Map(prev);
				next.delete(panelValue);
				return next;
			});
		};
	});
	const getTabPanelIdByValue = import_react.useCallback((tabValue) => {
		return mountedTabPanels.get(tabValue);
	}, [mountedTabPanels]);
	const getTabIdByPanelValue = import_react.useCallback((tabPanelValue) => {
		for (const tabMetadata of tabMap.values()) if (tabPanelValue === tabMetadata.value) return tabMetadata.id;
	}, [tabMap]);
	const tabsContextValue = import_react.useMemo(() => ({
		getTabElementBySelectedValue,
		getTabIdByPanelValue,
		getTabPanelIdByValue,
		onValueChange,
		orientation,
		registerMountedTabPanel,
		setTabMap,
		tabActivationDirection,
		value
	}), [
		getTabElementBySelectedValue,
		getTabIdByPanelValue,
		getTabPanelIdByValue,
		onValueChange,
		orientation,
		registerMountedTabPanel,
		setTabMap,
		tabActivationDirection,
		value
	]);
	const selectedTabMetadata = import_react.useMemo(() => {
		for (const tabMetadata of tabMap.values()) if (tabMetadata.value === value) return tabMetadata;
	}, [tabMap, value]);
	const firstEnabledTabValue = import_react.useMemo(() => {
		for (const tabMetadata of tabMap.values()) if (!tabMetadata.disabled) return tabMetadata.value;
	}, [tabMap]);
	const shouldNotifyInitialValueChangeRef = import_react.useRef(!hasExplicitDefaultValueProp);
	const initialDefaultValueRef = import_react.useRef(defaultValueProp);
	const shouldHonorDisabledDefaultValueRef = import_react.useRef(hasExplicitDefaultValueProp);
	const didRegisterTabsRef = import_react.useRef(false);
	useIsoLayoutEffect(() => {
		if (isControlled) return;
		function commitAutomaticValueChange(fallbackValue, fallbackReason) {
			setValue(fallbackValue);
			setActivationDirectionState({
				previousValue: fallbackValue,
				tabActivationDirection: "none"
			});
			notifyAutomaticValueChange(fallbackValue, fallbackReason);
			shouldNotifyInitialValueChangeRef.current = false;
		}
		if (tabMap.size === 0) {
			if (didRegisterTabsRef.current && value !== null && !lastKnownTabElementRef.current?.isConnected) commitAutomaticValueChange(null, missing);
			return;
		}
		didRegisterTabsRef.current = true;
		lastKnownTabElementRef.current = tabMap.keys().next().value;
		const selectionIsDisabled = selectedTabMetadata?.disabled;
		const selectionIsMissing = selectedTabMetadata == null && value !== null;
		if (!selectionIsDisabled && value === initialDefaultValueRef.current) shouldHonorDisabledDefaultValueRef.current = false;
		if (shouldHonorDisabledDefaultValueRef.current && selectionIsDisabled && value === initialDefaultValueRef.current) return;
		const shouldNotifyInitialValueChange = shouldNotifyInitialValueChangeRef.current;
		if (selectionIsDisabled || selectionIsMissing) {
			const fallbackValue = firstEnabledTabValue ?? null;
			if (value === fallbackValue) {
				shouldNotifyInitialValueChangeRef.current = false;
				return;
			}
			let fallbackReason = missing;
			if (shouldNotifyInitialValueChange) fallbackReason = initial;
			else if (selectionIsDisabled) fallbackReason = disabled;
			commitAutomaticValueChange(fallbackValue, fallbackReason);
			return;
		}
		if (shouldNotifyInitialValueChange && selectedTabMetadata != null) {
			notifyAutomaticValueChange(value, initial);
			shouldNotifyInitialValueChangeRef.current = false;
		}
	}, [
		firstEnabledTabValue,
		isControlled,
		notifyAutomaticValueChange,
		selectedTabMetadata,
		setValue,
		tabMap,
		value
	]);
	const element = useRenderElement("div", componentProps, {
		state: {
			orientation,
			tabActivationDirection
		},
		ref: forwardedRef,
		props: elementProps,
		stateAttributesMapping: tabsStateAttributesMapping
	});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(TabsRootContext.Provider, {
		value: tabsContextValue,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CompositeList, {
			elementsRef: tabPanelRefs,
			children: element
		})
	});
});
function findTabElement(tabMap, value) {
	for (const [tabElement, tabMetadata] of tabMap.entries()) if (value === tabMetadata.value) return tabElement;
	return null;
}
function computeActivationDirection(oldValue, newValue, orientation, tabMap) {
	if (oldValue == null || newValue == null) return "none";
	const [positionProp, backward, forward] = orientation === "horizontal" ? [
		"left",
		"left",
		"right"
	] : [
		"top",
		"up",
		"down"
	];
	const oldTab = findTabElement(tabMap, oldValue);
	const newTab = findTabElement(tabMap, newValue);
	if (oldTab == null || newTab == null) {
		if (oldTab !== newTab && (typeof oldValue === "number" || typeof oldValue === "string") && typeof oldValue === typeof newValue) return newValue > oldValue ? forward : backward;
		return "none";
	}
	const oldPosition = oldTab.getBoundingClientRect()[positionProp];
	const newPosition = newTab.getBoundingClientRect()[positionProp];
	if (newPosition < oldPosition) return backward;
	if (newPosition > oldPosition) return forward;
	return "none";
}
//#endregion
//#region node_modules/@base-ui/react/internals/composite/constants.mjs
var ACTIVE_COMPOSITE_ITEM = "data-composite-item-active";
//#endregion
//#region node_modules/@base-ui/react/internals/composite/list/useCompositeListItem.mjs
/**
* Used to register a list item and its index (DOM position) in the `CompositeList`.
*/
function useCompositeListItem(params = {}) {
	const { guess, label, metadata, textRef, index: externalIndex } = params;
	const { register, unregister, subscribeMapChange, nextIndexRef } = useCompositeListContext();
	const indexRef = import_react.useRef(-1);
	const [internalIndex, setInternalIndex] = import_react.useState(externalIndex == null && guess ? () => {
		if (indexRef.current === -1) {
			const newIndex = nextIndexRef.current;
			nextIndexRef.current += 1;
			indexRef.current = newIndex;
		}
		return indexRef.current;
	} : -1);
	const index = externalIndex ?? internalIndex;
	const componentRef = import_react.useRef(null);
	const ref = import_react.useCallback((node) => {
		const previousNode = componentRef.current;
		if (previousNode) unregister(previousNode);
		componentRef.current = node;
		if (node) register(node, {
			metadata: metadata ?? null,
			index: externalIndex ?? null,
			label,
			textRef
		});
	}, [
		externalIndex,
		register,
		unregister,
		metadata,
		label,
		textRef
	]);
	useIsoLayoutEffect(() => {
		if (externalIndex != null) return;
		return subscribeMapChange((map) => {
			const i = componentRef.current ? map.get(componentRef.current)?.index : null;
			if (i != null) setInternalIndex(i);
		});
	}, [externalIndex, subscribeMapChange]);
	return {
		ref,
		index
	};
}
//#endregion
//#region node_modules/@base-ui/react/internals/composite/item/useCompositeItem.mjs
function useCompositeItem(params = {}) {
	const { highlightItemOnHover, highlightedIndex, onHighlightedIndexChange } = useCompositeRootContext();
	const { ref, index } = useCompositeListItem(params);
	const isHighlighted = highlightedIndex === index;
	const itemRef = import_react.useRef(null);
	const mergedRef = useMergedRefs(ref, itemRef);
	return {
		compositeProps: {
			tabIndex: isHighlighted ? 0 : -1,
			onFocus() {
				onHighlightedIndexChange(index);
			},
			onMouseMove() {
				const item = itemRef.current;
				if (!highlightItemOnHover || !item) return;
				const disabled = item.hasAttribute("disabled") || item.ariaDisabled === "true";
				if (!isHighlighted && !disabled) item.focus();
			}
		},
		compositeRef: mergedRef,
		index
	};
}
//#endregion
//#region node_modules/@base-ui/react/tabs/list/TabsListContext.mjs
var TabsListContext = /*#__PURE__*/ import_react.createContext(void 0);
function useTabsListContext() {
	const context = import_react.useContext(TabsListContext);
	if (context === void 0) throw new Error(formatErrorMessage(65));
	return context;
}
//#endregion
//#region node_modules/@base-ui/react/tabs/tab/TabsTab.mjs
/**
* An individual interactive tab button that toggles the corresponding panel.
* Renders a `<button>` element.
*
* Documentation: [Base UI Tabs](https://base-ui.com/react/components/tabs)
*/
var TabsTab = /*#__PURE__*/ import_react.forwardRef(function TabsTab(componentProps, forwardedRef) {
	const { className, disabled = false, render, value, id: idProp, nativeButton = true, style, ...elementProps } = componentProps;
	const { value: activeTabValue, getTabPanelIdByValue, onValueChange, orientation, tabActivationDirection } = useTabsRootContext();
	const { activateOnFocus, registerTabResizeObserverElement, tabsListElement } = useTabsListContext();
	const { highlightedIndex, onHighlightedIndexChange } = useCompositeRootContext();
	const id = useBaseUiId(idProp);
	const { compositeProps, compositeRef, index } = useCompositeItem({ metadata: import_react.useMemo(() => ({
		disabled,
		id,
		value
	}), [
		disabled,
		id,
		value
	]) });
	const active = value === activeTabValue;
	const isNavigatingRef = import_react.useRef(false);
	const unobserveTabElementRef = import_react.useRef(null);
	const observeTabElement = useStableCallback((element) => {
		unobserveTabElementRef.current?.();
		unobserveTabElementRef.current = element ? registerTabResizeObserverElement(element) : null;
	});
	useIsoLayoutEffect(() => {
		if (isNavigatingRef.current) {
			isNavigatingRef.current = false;
			return;
		}
		if (!(active && index > -1 && highlightedIndex !== index)) return;
		const listElement = tabsListElement;
		if (listElement != null) {
			const activeEl = activeElement(ownerDocument(listElement));
			if (activeEl && contains(listElement, activeEl)) return;
		}
		if (!disabled) onHighlightedIndexChange(index);
	}, [
		active,
		index,
		highlightedIndex,
		onHighlightedIndexChange,
		disabled,
		tabsListElement
	]);
	const { getButtonProps, buttonRef } = useButton({
		disabled,
		native: nativeButton,
		focusableWhenDisabled: true
	});
	const tabPanelId = getTabPanelIdByValue(value);
	const isPressingRef = import_react.useRef(false);
	const isMainButtonRef = import_react.useRef(false);
	function activate(event) {
		onValueChange(value, createChangeEventDetails(none, event.nativeEvent, void 0, { activationDirection: "none" }));
	}
	function onClick(event) {
		if (active || disabled) return;
		activate(event);
	}
	function onFocus(event) {
		if (active || disabled) return;
		if (activateOnFocus && (!isPressingRef.current || isMainButtonRef.current)) activate(event);
	}
	function onPointerDown(event) {
		if (active || disabled) return;
		isPressingRef.current = true;
		isMainButtonRef.current = event.button === 0;
		const doc = ownerDocument(event.currentTarget);
		function handlePointerEnd() {
			isPressingRef.current = false;
			isMainButtonRef.current = false;
			doc.removeEventListener("pointerup", handlePointerEnd);
			doc.removeEventListener("pointercancel", handlePointerEnd);
		}
		doc.addEventListener("pointerup", handlePointerEnd);
		doc.addEventListener("pointercancel", handlePointerEnd);
	}
	return useRenderElement("button", componentProps, {
		state: {
			disabled,
			active,
			orientation,
			tabActivationDirection
		},
		ref: [
			forwardedRef,
			buttonRef,
			compositeRef,
			observeTabElement
		],
		props: [
			compositeProps,
			{
				role: "tab",
				"aria-controls": tabPanelId,
				"aria-selected": active,
				id,
				onClick,
				onFocus,
				onPointerDown,
				[ACTIVE_COMPOSITE_ITEM]: active ? "" : void 0,
				onKeyDownCapture() {
					isNavigatingRef.current = true;
				}
			},
			elementProps,
			getButtonProps
		],
		stateAttributesMapping: tabsStateAttributesMapping
	});
});
//#endregion
//#region node_modules/@base-ui/react/tabs/panel/TabsPanelDataAttributes.mjs
/**
* Indicates the index of the tab panel.
*/
var index = "data-index";
//#endregion
//#region node_modules/@base-ui/react/tabs/panel/TabsPanel.mjs
var stateAttributesMapping = {
	...tabsStateAttributesMapping,
	...transitionStatusMapping
};
/**
* A panel displayed when the corresponding tab is active.
* Renders a `<div>` element.
*
* Documentation: [Base UI Tabs](https://base-ui.com/react/components/tabs)
*/
var TabsPanel = /*#__PURE__*/ import_react.forwardRef(function TabsPanel(componentProps, forwardedRef) {
	const { className, value, render, keepMounted = false, style, ...elementProps } = componentProps;
	const { value: selectedValue, getTabIdByPanelValue, orientation, tabActivationDirection, registerMountedTabPanel } = useTabsRootContext();
	const id = useBaseUiId();
	const { ref: listItemRef, index: index$1 } = useCompositeListItem();
	const open = value === selectedValue;
	const { mounted, transitionStatus, setMounted } = useTransitionStatus(open);
	const hidden = !mounted;
	const correspondingTabId = getTabIdByPanelValue(value);
	const state = {
		hidden,
		orientation,
		tabActivationDirection,
		transitionStatus
	};
	const panelRef = import_react.useRef(null);
	const element = useRenderElement("div", componentProps, {
		state,
		ref: [
			forwardedRef,
			listItemRef,
			panelRef
		],
		props: [{
			"aria-labelledby": correspondingTabId,
			hidden,
			id,
			role: "tabpanel",
			tabIndex: open ? 0 : -1,
			inert: inertValue(!open),
			[index]: index$1
		}, elementProps],
		stateAttributesMapping
	});
	useOpenChangeComplete({
		open,
		ref: panelRef,
		onComplete() {
			if (!open) setMounted(false);
		}
	});
	useIsoLayoutEffect(() => {
		if (id == null || hidden && !keepMounted) return;
		return registerMountedTabPanel(value, id);
	}, [
		hidden,
		keepMounted,
		value,
		id,
		registerMountedTabPanel
	]);
	if (!(keepMounted || mounted)) return null;
	return element;
});
//#endregion
//#region node_modules/@base-ui/utils/isElementDisabled.mjs
function isElementDisabled(element) {
	return element == null || element.hasAttribute("disabled") || element.getAttribute("aria-disabled") === "true";
}
//#endregion
//#region node_modules/@base-ui/react/internals/composite/root/useCompositeRoot.mjs
function useCompositeRoot(params) {
	const { loopFocus = true, orientation = "both", grid, onLoop, direction, highlightedIndex: externalHighlightedIndex, onHighlightedIndexChange: externalSetHighlightedIndex, rootRef: externalRef, enableHomeAndEndKeys = false, stopEventPropagation, disabledIndices, modifierKeys = EMPTY_ARRAY } = params;
	const [internalHighlightedIndex, internalSetHighlightedIndex] = import_react.useState(0);
	const isGrid = grid != null;
	const rootRef = import_react.useRef(null);
	const mergedRef = useMergedRefs(rootRef, externalRef);
	const elementsRef = import_react.useRef([]);
	const hasSetDefaultIndexRef = import_react.useRef(false);
	const highlightedElementRef = import_react.useRef(null);
	const highlightedIndex = externalHighlightedIndex ?? internalHighlightedIndex;
	const onHighlightedIndexChange = useStableCallback((index, shouldScrollIntoView = false) => {
		highlightedElementRef.current = elementsRef.current[index] ?? null;
		(externalSetHighlightedIndex ?? internalSetHighlightedIndex)(index);
		if (shouldScrollIntoView) {
			const newActiveItem = elementsRef.current[index];
			scrollIntoViewIfNeeded(rootRef.current, newActiveItem, direction, orientation);
		}
	});
	const onMapChange = useStableCallback((map) => {
		if (map.size === 0) return;
		if (hasSetDefaultIndexRef.current) {
			const elements = elementsRef.current;
			const nextIndex = elements.indexOf(highlightedElementRef.current);
			if (nextIndex === -1) {
				const replacement = elements[highlightedIndex];
				if (!replacement || isListIndexDisabled(elements, highlightedIndex, disabledIndices)) onHighlightedIndexChange(getFallbackIndex(elements, disabledIndices));
				else highlightedElementRef.current = replacement;
			} else if (nextIndex !== highlightedIndex) onHighlightedIndexChange(nextIndex);
			return;
		}
		hasSetDefaultIndexRef.current = true;
		const sortedElements = Array.from(map.keys());
		const activeItem = sortedElements.find((compositeElement) => compositeElement?.hasAttribute("data-composite-item-active")) ?? null;
		const activeIndex = activeItem ? map.get(activeItem)?.index ?? -1 : -1;
		if (activeIndex !== -1) onHighlightedIndexChange(activeIndex);
		else if (isListIndexDisabled(sortedElements, highlightedIndex, disabledIndices)) {
			const firstEnabledIndex = findNonDisabledListIndex(sortedElements, { disabledIndices });
			if (!isIndexOutOfListBounds(sortedElements, firstEnabledIndex)) onHighlightedIndexChange(firstEnabledIndex);
		}
		scrollIntoViewIfNeeded(rootRef.current, activeItem, direction, orientation);
	});
	useIsoLayoutEffect(() => {
		if (disabledIndices == null || externalHighlightedIndex != null || !hasSetDefaultIndexRef.current) return;
		const elements = elementsRef.current;
		if (isListIndexDisabled(elements, highlightedIndex, disabledIndices)) {
			const firstEnabledIndex = findNonDisabledListIndex(elements, { disabledIndices });
			if (!isIndexOutOfListBounds(elements, firstEnabledIndex)) onHighlightedIndexChange(firstEnabledIndex);
		}
	}, [
		disabledIndices,
		externalHighlightedIndex,
		highlightedIndex,
		elementsRef,
		onHighlightedIndexChange
	]);
	const wrappedOnLoop = useStableCallback((event, prevIndex, nextIndex) => {
		if (!onLoop) return nextIndex;
		return onLoop(event, prevIndex, nextIndex, elementsRef);
	});
	const onKeyDown = useStableCallback((event) => {
		const isHomeOrEnd = event.key === "Home" || event.key === "End";
		if (!COMPOSITE_KEYS.has(event.key) || !enableHomeAndEndKeys && isHomeOrEnd) return;
		if (isModifierKeySet(event, modifierKeys)) return;
		if (!rootRef.current) return;
		const isRtl = direction === "rtl";
		const horizontalForwardKey = isRtl ? ARROW_LEFT : ARROW_RIGHT;
		const horizontalBackwardKey = isRtl ? ARROW_RIGHT : ARROW_LEFT;
		const forwardKey = orientation === "vertical" ? ARROW_DOWN : horizontalForwardKey;
		const backwardKey = orientation === "vertical" ? ARROW_UP : horizontalBackwardKey;
		const target = getTarget(event.nativeEvent);
		if (target != null && isNativeInput(target) && !isElementDisabled(target)) {
			const selectionStart = target.selectionStart;
			const selectionEnd = target.selectionEnd;
			const textContent = target.value;
			if (selectionStart == null || event.shiftKey || selectionStart !== selectionEnd) return;
			if (event.key !== backwardKey && selectionStart < textContent.length) return;
			if (event.key !== forwardKey && selectionStart > 0) return;
		}
		let nextIndex = highlightedIndex;
		const minIndex = getMinListIndex(elementsRef, disabledIndices);
		const maxIndex = getMaxListIndex(elementsRef, disabledIndices);
		if (grid != null) nextIndex = grid({
			disabledIndices,
			elementsRef,
			event,
			highlightedIndex,
			loopFocus,
			maxIndex,
			minIndex,
			onLoop: wrappedOnLoop,
			orientation,
			rtl: isRtl
		});
		const isForwardKey = orientation !== "vertical" && event.key === horizontalForwardKey || orientation !== "horizontal" && event.key === "ArrowDown";
		const isBackwardKey = orientation !== "vertical" && event.key === horizontalBackwardKey || orientation !== "horizontal" && event.key === "ArrowUp";
		if (enableHomeAndEndKeys) {
			if (event.key === "Home") nextIndex = minIndex;
			else if (event.key === "End") nextIndex = maxIndex;
		}
		if (nextIndex === highlightedIndex && (isForwardKey || isBackwardKey)) {
			if (loopFocus && nextIndex === maxIndex && isForwardKey) {
				nextIndex = minIndex;
				if (onLoop) nextIndex = onLoop(event, highlightedIndex, nextIndex, elementsRef);
			} else if (loopFocus && nextIndex === minIndex && isBackwardKey) {
				nextIndex = maxIndex;
				if (onLoop) nextIndex = onLoop(event, highlightedIndex, nextIndex, elementsRef);
			} else nextIndex = findNonDisabledListIndex(elementsRef.current, {
				startingIndex: nextIndex,
				decrement: isBackwardKey,
				disabledIndices
			});
		}
		if (nextIndex !== highlightedIndex && !isIndexOutOfListBounds(elementsRef.current, nextIndex)) {
			if (stopEventPropagation) event.stopPropagation();
			if (isGrid || isHomeOrEnd || isForwardKey || isBackwardKey) event.preventDefault();
			onHighlightedIndexChange(nextIndex, true);
			queueMicrotask(() => {
				elementsRef.current[nextIndex]?.focus();
			});
		}
	});
	return {
		props: {
			ref: mergedRef,
			onFocus(event) {
				const element = rootRef.current;
				const target = getTarget(event.nativeEvent);
				if (!element || target == null || !isNativeInput(target)) return;
				target.setSelectionRange(0, target.value.length);
			},
			onKeyDown
		},
		highlightedIndex,
		onHighlightedIndexChange,
		elementsRef,
		onMapChange,
		relayKeyboardEvent: onKeyDown
	};
}
function getFallbackIndex(elements, disabledIndices) {
	let fallbackIndex = -1;
	for (let index = 0; index < elements.length; index += 1) {
		const element = elements[index];
		if (!element || isListIndexDisabled(elements, index, disabledIndices)) continue;
		if (element.hasAttribute("data-composite-item-active")) return index;
		if (fallbackIndex === -1) fallbackIndex = index;
	}
	return Math.max(fallbackIndex, 0);
}
function isModifierKeySet(event, ignoredModifierKeys) {
	for (const key of MODIFIER_KEYS) {
		if (ignoredModifierKeys.includes(key)) continue;
		if (event.getModifierState(key)) return true;
	}
	return false;
}
//#endregion
//#region node_modules/@base-ui/react/internals/composite/root/CompositeRoot.mjs
function CompositeRoot(componentProps) {
	const { render, className, style, refs = EMPTY_ARRAY, props = EMPTY_ARRAY, state = EMPTY_OBJECT, stateAttributesMapping, highlightedIndex: highlightedIndexProp, onHighlightedIndexChange: onHighlightedIndexChangeProp, orientation, grid, loopFocus, onLoop, enableHomeAndEndKeys, onMapChange: onMapChangeProp, stopEventPropagation = true, rootRef, disabledIndices, modifierKeys, highlightItemOnHover = false, tag = "div", ...elementProps } = componentProps;
	const { props: defaultProps, highlightedIndex, onHighlightedIndexChange, elementsRef, onMapChange: onMapChangeUnwrapped, relayKeyboardEvent } = useCompositeRoot({
		grid,
		loopFocus,
		onLoop,
		orientation,
		highlightedIndex: highlightedIndexProp,
		onHighlightedIndexChange: onHighlightedIndexChangeProp,
		rootRef,
		stopEventPropagation,
		enableHomeAndEndKeys,
		direction: useDirection(),
		disabledIndices,
		modifierKeys
	});
	const element = useRenderElement(tag, componentProps, {
		state,
		ref: refs,
		props: [
			defaultProps,
			...props,
			elementProps
		],
		stateAttributesMapping
	});
	const contextValue = import_react.useMemo(() => ({
		highlightedIndex,
		onHighlightedIndexChange,
		highlightItemOnHover,
		relayKeyboardEvent
	}), [
		highlightedIndex,
		onHighlightedIndexChange,
		highlightItemOnHover,
		relayKeyboardEvent
	]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CompositeRootContext.Provider, {
		value: contextValue,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CompositeList, {
			elementsRef,
			onMapChange: (newMap) => {
				onMapChangeProp?.(newMap);
				onMapChangeUnwrapped(newMap);
			},
			children: element
		})
	});
}
//#endregion
//#region node_modules/@base-ui/react/tabs/list/TabsList.mjs
/**
* Groups the individual tab buttons.
* Renders a `<div>` element.
*
* Documentation: [Base UI Tabs](https://base-ui.com/react/components/tabs)
*/
var TabsList$1 = /*#__PURE__*/ import_react.forwardRef(function TabsList(componentProps, forwardedRef) {
	const { activateOnFocus = false, className, loopFocus = true, render, style, ...elementProps } = componentProps;
	const { orientation, setTabMap, tabActivationDirection } = useTabsRootContext();
	const [highlightedTabIndex, setHighlightedTabIndex] = import_react.useState(0);
	const [tabsListElement, setTabsListElement] = import_react.useState(null);
	const indicatorUpdateListenersRef = import_react.useRef(/* @__PURE__ */ new Set());
	const tabResizeObserverElementsRef = import_react.useRef(/* @__PURE__ */ new Set());
	const resizeObserverRef = import_react.useRef(null);
	useIsoLayoutEffect(() => {
		if (typeof ResizeObserver === "undefined") return;
		const resizeObserver = new ResizeObserver(() => {
			indicatorUpdateListenersRef.current.forEach((listener) => {
				listener();
			});
		});
		resizeObserverRef.current = resizeObserver;
		if (tabsListElement) resizeObserver.observe(tabsListElement);
		tabResizeObserverElementsRef.current.forEach((element) => {
			resizeObserver.observe(element);
		});
		return () => {
			resizeObserver.disconnect();
			resizeObserverRef.current = null;
		};
	}, [tabsListElement]);
	const registerIndicatorUpdateListener = useStableCallback((listener) => {
		indicatorUpdateListenersRef.current.add(listener);
		return () => {
			indicatorUpdateListenersRef.current.delete(listener);
		};
	});
	const registerTabResizeObserverElement = useStableCallback((element) => {
		tabResizeObserverElementsRef.current.add(element);
		resizeObserverRef.current?.observe(element);
		return () => {
			tabResizeObserverElementsRef.current.delete(element);
			resizeObserverRef.current?.unobserve(element);
		};
	});
	const state = {
		orientation,
		tabActivationDirection
	};
	const defaultProps = {
		"aria-orientation": orientation === "vertical" ? "vertical" : void 0,
		role: "tablist"
	};
	const tabsListContextValue = import_react.useMemo(() => ({
		activateOnFocus,
		registerIndicatorUpdateListener,
		registerTabResizeObserverElement,
		tabsListElement
	}), [
		activateOnFocus,
		registerIndicatorUpdateListener,
		registerTabResizeObserverElement,
		tabsListElement
	]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(TabsListContext.Provider, {
		value: tabsListContextValue,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CompositeRoot, {
			render,
			className,
			style,
			state,
			refs: [forwardedRef, setTabsListElement],
			props: [defaultProps, elementProps],
			stateAttributesMapping: tabsStateAttributesMapping,
			highlightedIndex: highlightedTabIndex,
			enableHomeAndEndKeys: true,
			loopFocus,
			orientation,
			onHighlightedIndexChange: setHighlightedTabIndex,
			onMapChange: setTabMap,
			disabledIndices: EMPTY_ARRAY
		})
	});
});
//#endregion
//#region node_modules/fumadocs-ui/dist/components/ui/tabs.js
var listeners = /* @__PURE__ */ new Map();
var TabsContext$1 = (0, import_react.createContext)(null);
function useTabContext() {
	const ctx = (0, import_react.use)(TabsContext$1);
	if (!ctx) throw new Error("You must wrap your component in <Tabs>");
	return ctx;
}
var TabsList = TabsList$1;
var TabsTrigger = TabsTab;
function Tabs({ ref, groupId, persist = false, updateAnchor = false, defaultValue, value: _value, onValueChange: _onValueChange, ...props }) {
	const tabsRef = (0, import_react.useRef)(null);
	const valueToIdMap = (0, import_react.useMemo)(() => /* @__PURE__ */ new Map(), []);
	const panels = (0, import_react.useMemo)(() => /* @__PURE__ */ new Map(), []);
	const [value, setValue] = _value === void 0 ? (0, import_react.useState)(defaultValue) : [_value, (0, import_react.useEffectEvent)((v) => _onValueChange?.(v))];
	(0, import_react.useLayoutEffect)(() => {
		if (!groupId) return;
		let previous = sessionStorage.getItem(groupId);
		if (persist) previous ??= localStorage.getItem(groupId);
		if (previous) setValue(previous);
		const groupListeners = listeners.get(groupId) ?? /* @__PURE__ */ new Set();
		groupListeners.add(setValue);
		listeners.set(groupId, groupListeners);
		return () => {
			groupListeners.delete(setValue);
		};
	}, [groupId, persist]);
	(0, import_react.useLayoutEffect)(() => {
		const openFromHash = () => {
			const hash = window.location.hash.slice(1);
			if (!hash) return;
			for (const [value, id] of valueToIdMap.entries()) if (id === hash) {
				setValue(value);
				tabsRef.current?.scrollIntoView();
				return;
			}
			const target = document.getElementById(hash);
			if (!target) return;
			for (const [value, panel] of panels.entries()) {
				if (!panel.contains(target)) continue;
				setValue(value);
				requestAnimationFrame(() => target.scrollIntoView());
				return;
			}
		};
		openFromHash();
		window.addEventListener("hashchange", openFromHash);
		return () => window.removeEventListener("hashchange", openFromHash);
	}, [valueToIdMap, panels]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsRoot, {
		ref: mergeRefs(ref, tabsRef),
		value,
		onValueChange: (v) => {
			if (updateAnchor) {
				const id = valueToIdMap.get(v);
				if (id) window.history.replaceState(null, "", `#${id}`);
			}
			if (groupId) {
				const groupListeners = listeners.get(groupId);
				if (groupListeners) for (const listener of groupListeners) listener(v);
				sessionStorage.setItem(groupId, v);
				if (persist) localStorage.setItem(groupId, v);
			} else setValue(v);
		},
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContext$1, {
			value: (0, import_react.useMemo)(() => ({
				valueToIdMap,
				panels
			}), [valueToIdMap, panels]),
			children: props.children
		})
	});
}
function TabsContent({ value, ref, ...props }) {
	const { valueToIdMap, panels } = useTabContext();
	if (props.id) valueToIdMap.set(value, props.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsPanel, {
		ref: mergeRefs(ref, (element) => {
			if (element) panels.set(value, element);
			else panels.delete(value);
		}),
		value,
		...props,
		children: props.children
	});
}
//#endregion
//#region node_modules/lucide-react/dist/esm/icons/clipboard.mjs
/**
* @license lucide-react v1.43.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var __iconData$4 = {
	name: "clipboard",
	size: 24,
	node: [["rect", {
		width: "8",
		height: "4",
		x: "8",
		y: "2",
		rx: "1",
		ry: "1",
		key: "tgr4d6"
	}], ["path", {
		d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
		key: "116196"
	}]]
};
__iconData$4.node;
var Clipboard = createLucideIcon(__iconData$4);
//#endregion
//#region node_modules/lucide-react/dist/esm/icons/copy-check.mjs
/**
* @license lucide-react v1.43.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var __iconData$3 = {
	name: "copy-check",
	size: 24,
	node: [
		["path", {
			d: "m12 15 2 2 4-4",
			key: "2c609p"
		}],
		["rect", {
			width: "14",
			height: "14",
			x: "8",
			y: "8",
			rx: "2",
			ry: "2",
			key: "17jyea"
		}],
		["path", {
			d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
			key: "zix9uf"
		}]
	]
};
__iconData$3.node;
var CopyCheck = createLucideIcon(__iconData$3);
//#endregion
//#region node_modules/lucide-react/dist/esm/icons/link.mjs
/**
* @license lucide-react v1.43.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var __iconData$2 = {
	name: "link",
	size: 24,
	node: [["path", {
		d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",
		key: "1cjeqo"
	}], ["path", {
		d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
		key: "19qd67"
	}]]
};
__iconData$2.node;
var Link = createLucideIcon(__iconData$2);
//#endregion
//#region node_modules/lucide-react/dist/esm/icons/message-circle.mjs
/**
* @license lucide-react v1.43.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var __iconData$1 = {
	name: "message-circle",
	size: 24,
	node: [["path", {
		d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",
		key: "1sd12s"
	}]]
};
__iconData$1.node;
var MessageCircle = createLucideIcon(__iconData$1);
//#endregion
//#region node_modules/lucide-react/dist/esm/icons/x.mjs
/**
* @license lucide-react v1.43.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var __iconData = {
	name: "x",
	size: 24,
	node: [["path", {
		d: "M18 6 6 18",
		key: "1bl5f8"
	}], ["path", {
		d: "m6 6 12 12",
		key: "d8bk6v"
	}]]
};
__iconData.node;
var X = createLucideIcon(__iconData);
//#endregion
//#region node_modules/fumadocs-ui/dist/components/codeblock.js
var TabsContext = (0, import_react.createContext)(null);
function Pre(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
		...props,
		className: cn("min-w-full w-max *:flex *:flex-col", props.className),
		children: props.children
	});
}
function CodeBlock({ ref, title, allowCopy = true, keepBackground = false, icon, viewportProps = {}, children, Actions = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	...props,
	className: cn("empty:hidden", props.className)
}), ...props }) {
	const inTab = (0, import_react.use)(TabsContext) !== null;
	const areaRef = (0, import_react.useRef)(null);
	if (allowCopy === "true") allowCopy = true;
	else if (allowCopy === "false") allowCopy = false;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		ref,
		dir: "ltr",
		...props,
		tabIndex: -1,
		className: cn(inTab ? "bg-fd-secondary -mx-px -mb-px last:rounded-b-xl" : "my-4 bg-fd-card rounded-xl", keepBackground && "bg-(--shiki-light-bg) dark:bg-(--shiki-dark-bg)", "shiki relative border shadow-sm not-prose overflow-hidden text-sm", props.className),
		children: [title ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex text-fd-muted-foreground items-center gap-2 h-9.5 border-b px-4",
			children: [
				typeof icon === "string" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "[&_svg]:size-3.5",
					dangerouslySetInnerHTML: { __html: icon }
				}) : icon,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", {
					className: "flex-1 truncate",
					children: title
				}),
				Actions({
					className: "-me-2",
					children: allowCopy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyButton, { containerRef: areaRef })
				})
			]
		}) : Actions({
			className: "absolute top-2 right-2 z-2 backdrop-blur-lg rounded-lg text-fd-muted-foreground",
			children: allowCopy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyButton, { containerRef: areaRef })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: areaRef,
			...viewportProps,
			role: "region",
			tabIndex: 0,
			className: cn("text-[0.8125rem] py-3.5 overflow-auto max-h-[600px] fd-scroll-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fd-ring", viewportProps.className),
			style: {
				"--padding-right": !title ? "calc(var(--spacing) * 8)" : void 0,
				counterSet: props["data-line-numbers"] ? `line ${Number(props["data-line-numbers-start"] ?? 1) - 1}` : void 0,
				...viewportProps.style
			},
			children
		})]
	});
}
function CopyButton({ className, containerRef, ...props }) {
	const t = useTranslations({ note: "code block" });
	const [checked, onClick] = useCopyButton(() => {
		const pre = containerRef.current?.getElementsByTagName("pre").item(0);
		if (!pre) return;
		const clone = pre.cloneNode(true);
		clone.querySelectorAll(".nd-copy-ignore").forEach((node) => {
			node.replaceWith("\n");
		});
		navigator.clipboard.writeText(clone.textContent ?? "");
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"data-checked": checked || void 0,
		className: cn(buttonVariants({
			className: "hover:text-fd-accent-foreground data-checked:text-fd-accent-foreground",
			size: "icon-xs"
		}), className),
		"aria-label": checked ? t("Copied Text", { note: "aria-label" }) : t("Copy Text", { note: "aria-label" }),
		onClick,
		...props,
		children: checked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clipboard, {})
	});
}
function CodeBlockTabs({ ref, className, ...props }) {
	const containerRef = (0, import_react.useRef)(null);
	const nested = (0, import_react.use)(TabsContext) !== null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
		ref: mergeRefs(containerRef, ref),
		...props,
		className: (s) => cn("bg-fd-card rounded-xl border", !nested && "my-4", typeof className === "function" ? className(s) : className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContext, {
			value: (0, import_react.useMemo)(() => ({
				containerRef,
				nested
			}), [nested]),
			children: props.children
		})
	});
}
function CodeBlockTabsList({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList, {
		...props,
		className: (s) => cn("flex flex-row px-2 overflow-x-auto text-fd-muted-foreground", typeof className === "function" ? className(s) : className),
		children: props.children
	});
}
function CodeBlockTabsTrigger({ children, className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
		...props,
		className: (s) => cn("relative group inline-flex text-sm font-medium text-nowrap items-center transition-colors gap-2 px-2 py-1.5 [&_svg]:size-3.5", s.active ? "text-fd-primary" : "hover:text-fd-accent-foreground", typeof className === "function" ? className(s) : className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-2 bottom-0 h-px group-data-active:bg-fd-primary" }), children]
	});
}
function CodeBlockTab(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, { ...props });
}
//#endregion
//#region node_modules/fumadocs-ui/dist/components/heading.js
function Heading({ as, ...props }) {
	const As = as ?? "h1";
	const t = useTranslations({ note: "heading anchor" });
	const [isChecked, onCopy] = useCopyButton(() => {
		if (!props.id) return;
		const url = new URL(window.location.href);
		url.hash = props.id;
		return navigator.clipboard.writeText(url.href);
	});
	if (!props.id) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(As, { ...props });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(As, {
		...props,
		className: cn("group/heading flex scroll-m-28 flex-row items-center gap-1", props.className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			"data-card": "",
			href: `#${props.id}`,
			children: props.children
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			"aria-label": t("Copy Anchor Link", { note: "aria-label" }),
			className: cn(buttonVariants({
				variant: "ghost",
				size: "icon-xs"
			}), "not-prose shrink-0 text-fd-muted-foreground opacity-0 transition-opacity group-hover/heading:opacity-100"),
			onClick: onCopy,
			children: isChecked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyCheck, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {})
		})]
	});
}
//#endregion
export { useCompositeListItem as _, CodeBlockTabsList as a, X as c, Tabs as d, TabsContent as f, useCompositeItem as g, CompositeRoot as h, CodeBlockTabs as i, MessageCircle as l, TabsTrigger as m, CodeBlock as n, CodeBlockTabsTrigger as o, TabsList as p, CodeBlockTab as r, Pre as s, Heading as t, Link as u, CompositeList as v };
