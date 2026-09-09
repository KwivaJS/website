import { i as __toESM } from "./rolldown-runtime-B4iAMlE-.js";
import { t as require_jsx_runtime } from "./jsx-runtime-BqLYtsoi.js";
import { t as require_react } from "./react-SLAb4Nsi.js";
import { r as cn } from "./button-Cpca6tPg.js";
import { $ as useIsoLayoutEffect, X as formatErrorMessage, Z as useStableCallback } from "./useTransitionStatus-CgpR1fP4.js";
import { n as useBaseUiId, r as useRenderElement } from "./stateAttributesMapping-B8mynGFP.js";
import { b as getTarget, y as contains } from "./search-moGbV3Yd.js";
import { L as webkit, _ as useTimeout } from "./DialogRootContext-DTwNcHms.js";
import { n as useDirection } from "./DirectionContext-CCPO2bjM.js";
import { t as createLucideIcon } from "./createLucideIcon-CUS0Rvh9.js";
import { i as usePathname } from "./framework-BVFfi5Qn.js";
import { i as normalizeUrl } from "./use-on-change-CnLJrKl4.js";
import { n as addEventListener } from "./useValueAsRef-BtxEwGNw.js";
//#region node_modules/@base-ui/react/internals/csp-context/CSPContext.mjs
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime(), 1);
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var CSPContext = /*#__PURE__*/ import_react.createContext(void 0);
var DEFAULT_CSP_CONTEXT_VALUE = { disableStyleElements: false };
function useCSPContext() {
	return import_react.useContext(CSPContext) ?? DEFAULT_CSP_CONTEXT_VALUE;
}
//#endregion
//#region node_modules/lucide-react/dist/esm/icons/chevron-down.mjs
/**
* @license lucide-react v1.43.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var __iconData$3 = {
	name: "chevron-down",
	size: 24,
	node: [["path", {
		d: "m6 9 6 6 6-6",
		key: "qrunsl"
	}]]
};
__iconData$3.node;
var ChevronDown = createLucideIcon(__iconData$3);
//#endregion
//#region node_modules/lucide-react/dist/esm/icons/chevrons-up-down.mjs
/**
* @license lucide-react v1.43.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var __iconData$2 = {
	name: "chevrons-up-down",
	size: 24,
	node: [["path", {
		d: "m7 15 5 5 5-5",
		key: "1hf1tw"
	}], ["path", {
		d: "m7 9 5-5 5 5",
		key: "sgt6xg"
	}]]
};
__iconData$2.node;
var ChevronsUpDown = createLucideIcon(__iconData$2);
//#endregion
//#region node_modules/lucide-react/dist/esm/icons/languages.mjs
/**
* @license lucide-react v1.43.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var __iconData$1 = {
	name: "languages",
	size: 24,
	node: [
		["path", {
			d: "m5 8 6 6",
			key: "1wu5hv"
		}],
		["path", {
			d: "m4 14 6-6 2-3",
			key: "1k1g8d"
		}],
		["path", {
			d: "M2 5h12",
			key: "or177f"
		}],
		["path", {
			d: "M7 2h1",
			key: "1t2jsx"
		}],
		["path", {
			d: "m22 22-5-10-5 10",
			key: "don7ne"
		}],
		["path", {
			d: "M14 18h6",
			key: "1m8k6r"
		}]
	]
};
__iconData$1.node;
var Languages = createLucideIcon(__iconData$1);
//#endregion
//#region node_modules/lucide-react/dist/esm/icons/panel-left.mjs
/**
* @license lucide-react v1.43.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var __iconData = {
	name: "panel-left",
	size: 24,
	node: [["rect", {
		width: "18",
		height: "18",
		x: "3",
		y: "3",
		rx: "2",
		key: "afitv7"
	}], ["path", {
		d: "M9 3v18",
		key: "fh3hqa"
	}]],
	aliases: ["sidebar"]
};
__iconData.node;
var PanelLeft = createLucideIcon(__iconData);
//#endregion
//#region node_modules/fumadocs-core/dist/utils-DEVq3cEC.js
/**
* Search the path of a node in the tree matched by the matcher.
*
* @returns The path to the target node (from starting root), or null if the page doesn't exist
*/
function findPath(nodes, matcher, options = {}) {
	const { includeSeparator = true } = options;
	function run(nodes) {
		let separator;
		for (const node of nodes) {
			if (matcher(node)) {
				const items = [];
				if (separator) items.push(separator);
				items.push(node);
				return items;
			}
			if (node.type === "separator" && includeSeparator) {
				separator = node;
				continue;
			}
			if (node.type === "folder") {
				const items = node.index && matcher(node.index) ? [node.index] : run(node.children);
				if (items) {
					items.unshift(node);
					if (separator) items.unshift(separator);
					return items;
				}
			}
		}
	}
	return run(nodes) ?? null;
}
/**
* Find the structural projection of `page` (under the root folder `from`) in `to`:
* the page at the same file path relative to the root folder.
*/
function findProjection(from, to, page) {
	const prefix = from.$ref && `${from.$ref.folder}/`;
	if (!prefix || !to.$ref || !page.$ref?.startsWith(prefix)) return;
	const target = `${to.$ref.folder}/${page.$ref.slice(prefix.length)}`;
	let result;
	visit(to, (node) => {
		if (node.type === "page" && node.$ref === target) {
			result = node;
			return "break";
		}
	});
	return result;
}
var VisitBreak = Symbol("VisitBreak");
/**
* Perform a depth-first search on page tree visiting every node.
*
* @param root - the root of page tree to visit.
* @param visitor - function to receive nodes, return `skip` to skip the children of current node, `break` to stop the search entirely.
*/
function visit(root, visitor) {
	function onNode(node, parent) {
		const result = visitor(node, parent);
		switch (result) {
			case "skip": return node;
			case "break": throw VisitBreak;
			default: if (result) node = result;
		}
		if ("index" in node && node.index) node.index = onNode(node.index, node);
		if ("fallback" in node && node.fallback) node.fallback = onNode(node.fallback, node);
		if ("children" in node) for (let i = 0; i < node.children.length; i++) node.children[i] = onNode(node.children[i], node);
		return node;
	}
	try {
		return onNode(root);
	} catch (e) {
		if (e === VisitBreak) return root;
		throw e;
	}
}
//#endregion
//#region node_modules/fumadocs-core/dist/breadcrumb.js
function getBreadcrumbItemsFromPath(tree, path, options) {
	const { includePage = false, includeSeparator = false, includeRoot = false } = options;
	let items = [];
	for (let i = 0; i < path.length; i++) {
		const item = path[i];
		switch (item.type) {
			case "page":
				if (includePage) items.push({
					name: item.name,
					url: item.url
				});
				break;
			case "folder":
				if (item.root) {
					items = [];
					if (includeRoot) items.push({
						name: tree.name,
						url: typeof includeRoot === "object" ? includeRoot.url : item.index?.url
					});
					break;
				}
				if (i === path.length - 1 || item.index !== path[i + 1]) items.push({
					name: item.name,
					url: item.index?.url
				});
				break;
			case "separator": if (item.name && includeSeparator) items.push({ name: item.name });
		}
	}
	return items;
}
/**
* Search the path of a node in the tree by a specified url
*
* - When the page doesn't exist, return null
*
* @returns The path to the target node from root
* @internal Don't use this on your own
*/
function searchPath(nodes, url) {
	const normalizedUrl = normalizeUrl(url);
	return findPath(nodes, (node) => node.type === "page" && node.url === normalizedUrl);
}
//#endregion
//#region node_modules/fumadocs-ui/dist/contexts/tree.js
var TreeContext = (0, import_react.createContext)(null);
var PathContext = (0, import_react.createContext)([]);
function TreeContextProvider({ tree: rawTree, children }) {
	const nextIdRef = (0, import_react.useRef)(0);
	const pathname = usePathname();
	const tree = (0, import_react.useMemo)(() => rawTree, [rawTree.$id]);
	const path = (0, import_react.useMemo)(() => {
		return searchPath(tree.children, pathname) ?? (tree.fallback ? searchPath(tree.fallback.children, pathname) : null) ?? [];
	}, [tree, pathname]);
	const root = path.findLast((item) => item.type === "folder" && item.root) ?? tree;
	root.$id ??= String(nextIdRef.current++);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreeContext, {
		value: (0, import_react.useMemo)(() => ({
			root,
			full: tree
		}), [root, tree]),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PathContext, {
			value: path,
			children
		})
	});
}
function useTreePath() {
	return (0, import_react.use)(PathContext);
}
function useTreeContext() {
	const ctx = (0, import_react.use)(TreeContext);
	if (!ctx) throw new Error("You must wrap this component under <DocsLayout />");
	return ctx;
}
/**
* Group tabs by the root folders on the current page's path (outermost first): each tab is
* matched to its root folder, linking to the projection of current page when possible.
*
* Tabs not bound to the page tree are appended to the group of `root: true` folders.
*/
function useTabsGroups(tabs) {
	const { full: tree } = useTreeContext();
	const path = (0, import_react.use)(PathContext);
	return (0, import_react.useMemo)(() => {
		const out = [];
		const last = path[path.length - 1];
		const page = last?.type === "page" ? last : void 0;
		let scope = tree.fallback && !tree.children.includes(path[0]) ? tree.fallback : tree;
		for (const node of path) {
			if (node.type !== "folder" || !node.root) continue;
			const group = {
				active: node,
				options: []
			};
			collectTabs(scope, node, page, tabs, group.options);
			if (group.options.length > 0) out.push(group);
			scope = node;
		}
		const custom = tabs.filter((tab) => !tab.$folder);
		if (custom.length > 0) {
			const group = out.findLast((group) => group.active?.root === true);
			if (group) group.options.push(...custom);
			else out.push({ options: custom });
		}
		return out;
	}, [
		tabs,
		tree,
		path
	]);
}
/** collect the tabs of root folders with the same type as `active` within a scope */
function collectTabs(scope, active, page, tabs, out) {
	for (const node of scope.children) {
		if (node.type !== "folder") continue;
		if (node.root === active.root) {
			const tab = tabs.find((tab) => tab.$folder && (tab.$folder === node || tab.$folder.$id === node.$id));
			if (!tab) continue;
			const projection = page && findProjection(active, node, page);
			out.push(projection ? {
				...tab,
				url: projection.url
			} : tab);
		} else if (!node.root) collectTabs(node, active, page, tabs, out);
	}
}
//#endregion
//#region node_modules/@base-ui/react/scroll-area/root/ScrollAreaRootContext.mjs
var ScrollAreaRootContext = /*#__PURE__*/ import_react.createContext(void 0);
function useScrollAreaRootContext() {
	const context = import_react.useContext(ScrollAreaRootContext);
	if (context === void 0) throw new Error(formatErrorMessage(53));
	return context;
}
//#endregion
//#region node_modules/@base-ui/react/scroll-area/utils/getOffset.mjs
function getOffset(element, prop, axis) {
	if (!element) return 0;
	const styles = getComputedStyle(element);
	const key = `${prop}${axis === "x" ? "Inline" : "Block"}`;
	const start = parseFloat(styles[`${key}Start`]);
	if (axis === "x" && prop === "margin") return start * 2;
	return start + parseFloat(styles[`${key}End`]);
}
//#endregion
//#region node_modules/@base-ui/react/utils/styles.mjs
var DISABLE_SCROLLBAR_CLASS_NAME = "base-ui-disable-scrollbar";
var styleDisableScrollbar = {
	className: DISABLE_SCROLLBAR_CLASS_NAME,
	getElement(nonce) {
		return /*#__PURE__*/ (0, import_jsx_runtime.jsx)("style", {
			nonce,
			href: DISABLE_SCROLLBAR_CLASS_NAME,
			precedence: "base-ui:low",
			children: `.${DISABLE_SCROLLBAR_CLASS_NAME}{scrollbar-width:none}.${DISABLE_SCROLLBAR_CLASS_NAME}::-webkit-scrollbar{display:none}`
		});
	}
};
//#endregion
//#region node_modules/@base-ui/react/scroll-area/root/ScrollAreaRootDataAttributes.mjs
/**
* Present when the scroll area content is wider than the viewport.
*/
var hasOverflowX = "data-has-overflow-x";
/**
* Present when the scroll area content is taller than the viewport.
*/
var hasOverflowY = "data-has-overflow-y";
/**
* Present when there is overflow on the horizontal start side.
*/
var overflowXStart = "data-overflow-x-start";
/**
* Present when there is overflow on the horizontal end side.
*/
var overflowXEnd = "data-overflow-x-end";
/**
* Present when there is overflow on the vertical start side.
*/
var overflowYStart = "data-overflow-y-start";
/**
* Present when there is overflow on the vertical end side.
*/
var overflowYEnd = "data-overflow-y-end";
//#endregion
//#region node_modules/@base-ui/react/scroll-area/root/stateAttributes.mjs
var attr = (name) => (value) => value ? { [name]: "" } : null;
var scrollAreaStateAttributesMapping = {
	hasOverflowX: attr(hasOverflowX),
	hasOverflowY: attr(hasOverflowY),
	overflowXStart: attr(overflowXStart),
	overflowXEnd: attr(overflowXEnd),
	overflowYStart: attr(overflowYStart),
	overflowYEnd: attr(overflowYEnd),
	cornerHidden: () => null
};
//#endregion
//#region node_modules/@base-ui/react/scroll-area/root/ScrollAreaRootCssVars.mjs
/**
* The scroll area's corner height.
* @type {number}
*/
var scrollAreaCornerHeight = "--scroll-area-corner-height";
/**
* The scroll area's corner width.
* @type {number}
*/
var scrollAreaCornerWidth = "--scroll-area-corner-width";
//#endregion
//#region node_modules/@base-ui/react/scroll-area/scrollbar/ScrollAreaScrollbarDataAttributes.mjs
/**
* Indicates the orientation of the scrollbar.
* @type {'horizontal' | 'vertical'}
*/
var orientation = "data-orientation";
//#endregion
//#region node_modules/@base-ui/react/scroll-area/root/ScrollAreaRoot.mjs
var DEFAULT_COORDS = {
	x: 0,
	y: 0
};
var DEFAULT_SIZE = {
	width: 0,
	height: 0
};
var DEFAULT_OVERFLOW_EDGES = {
	xStart: false,
	xEnd: false,
	yStart: false,
	yEnd: false
};
var DEFAULT_HIDDEN_STATE = {
	x: true,
	y: true,
	corner: true
};
/**
* Groups all parts of the scroll area.
* Renders a `<div>` element.
*
* Documentation: [Base UI Scroll Area](https://base-ui.com/react/components/scroll-area)
*/
var ScrollAreaRoot = /*#__PURE__*/ import_react.forwardRef(function ScrollAreaRoot(componentProps, forwardedRef) {
	const { render, className, overflowEdgeThreshold: overflowEdgeThresholdProp, style, ...elementProps } = componentProps;
	const { xStart, xEnd, yStart, yEnd } = normalizeOverflowEdgeThreshold(overflowEdgeThresholdProp);
	const rootId = useBaseUiId();
	const scrollYTimeout = useTimeout();
	const scrollXTimeout = useTimeout();
	const { nonce, disableStyleElements } = useCSPContext();
	const [hovering, setHovering] = import_react.useState(false);
	const [scrollingX, setScrollingX] = import_react.useState(false);
	const [scrollingY, setScrollingY] = import_react.useState(false);
	const [touchModality, setTouchModality] = import_react.useState(false);
	const [hasMeasuredScrollbar, setHasMeasuredScrollbar] = import_react.useState(false);
	const [cornerSize, setCornerSize] = import_react.useState(DEFAULT_SIZE);
	const [thumbSize, setThumbSize] = import_react.useState(DEFAULT_SIZE);
	const [overflowEdges, setOverflowEdges] = import_react.useState(DEFAULT_OVERFLOW_EDGES);
	const [hiddenState, setHiddenState] = import_react.useState(DEFAULT_HIDDEN_STATE);
	const rootRef = import_react.useRef(null);
	const viewportRef = import_react.useRef(null);
	const scrollbarYRef = import_react.useRef(null);
	const scrollbarXRef = import_react.useRef(null);
	const thumbYRef = import_react.useRef(null);
	const thumbXRef = import_react.useRef(null);
	const cornerRef = import_react.useRef(null);
	const activePointerIdRef = import_react.useRef(null);
	const startYRef = import_react.useRef(0);
	const startXRef = import_react.useRef(0);
	const startScrollTopRef = import_react.useRef(0);
	const startScrollLeftRef = import_react.useRef(0);
	const currentOrientationRef = import_react.useRef("vertical");
	const scrollPositionRef = import_react.useRef(DEFAULT_COORDS);
	const savedSnapTypeRef = import_react.useRef(null);
	function startScrolling(vertical) {
		const setScrolling = vertical ? setScrollingY : setScrollingX;
		const timeout = vertical ? scrollYTimeout : scrollXTimeout;
		setScrolling(true);
		timeout.start(500, () => {
			setScrolling(false);
		});
	}
	const handleScroll = useStableCallback((scrollPosition) => {
		const offsetX = scrollPosition.x - scrollPositionRef.current.x;
		const offsetY = scrollPosition.y - scrollPositionRef.current.y;
		scrollPositionRef.current = scrollPosition;
		if (offsetY !== 0) startScrolling(true);
		if (offsetX !== 0) startScrolling(false);
	});
	const disableViewportSnap = useStableCallback(() => {
		const viewportEl = viewportRef.current;
		if (viewportEl && savedSnapTypeRef.current === null) {
			savedSnapTypeRef.current = viewportEl.style.scrollSnapType;
			viewportEl.style.scrollSnapType = "none";
		}
	});
	const handlePointerDown = useStableCallback((event) => {
		if (event.button !== 0) return;
		if (activePointerIdRef.current !== null) {
			if ((currentOrientationRef.current === "vertical" ? thumbYRef.current : thumbXRef.current)?.hasPointerCapture(activePointerIdRef.current)) return;
		}
		activePointerIdRef.current = event.pointerId;
		startYRef.current = event.clientY;
		startXRef.current = event.clientX;
		currentOrientationRef.current = event.currentTarget.getAttribute(orientation);
		const viewportEl = viewportRef.current;
		if (viewportEl) {
			startScrollTopRef.current = viewportEl.scrollTop;
			startScrollLeftRef.current = viewportEl.scrollLeft;
			disableViewportSnap();
		}
		(currentOrientationRef.current === "vertical" ? thumbYRef.current : thumbXRef.current)?.setPointerCapture(event.pointerId);
	});
	const handlePointerUp = useStableCallback((event) => {
		if (event.pointerId !== activePointerIdRef.current) return;
		activePointerIdRef.current = null;
		(currentOrientationRef.current === "vertical" ? setScrollingY : setScrollingX)(false);
		if (savedSnapTypeRef.current !== null) {
			if (viewportRef.current) viewportRef.current.style.scrollSnapType = savedSnapTypeRef.current;
			savedSnapTypeRef.current = null;
		}
		const thumb = currentOrientationRef.current === "vertical" ? thumbYRef.current : thumbXRef.current;
		if (thumb?.hasPointerCapture(event.pointerId)) thumb.releasePointerCapture(event.pointerId);
	});
	const handlePointerMove = useStableCallback((event) => {
		if (event.pointerId !== activePointerIdRef.current) return;
		if (event.buttons % 2 === 0) {
			handlePointerUp(event);
			return;
		}
		const viewportEl = viewportRef.current;
		if (!viewportEl) return;
		const vertical = currentOrientationRef.current === "vertical";
		const thumbEl = vertical ? thumbYRef.current : thumbXRef.current;
		const scrollbarEl = vertical ? scrollbarYRef.current : scrollbarXRef.current;
		if (!thumbEl || !scrollbarEl) return;
		const axis = vertical ? "y" : "x";
		const scrollbarOffset = getOffset(scrollbarEl, "padding", axis);
		const thumbOffset = getOffset(thumbEl, "margin", axis);
		const thumbSizePx = vertical ? thumbEl.offsetHeight : thumbEl.offsetWidth;
		const maxThumbOffset = (vertical ? scrollbarEl.offsetHeight : scrollbarEl.offsetWidth) - thumbSizePx - scrollbarOffset - thumbOffset;
		const delta = vertical ? event.clientY - startYRef.current : event.clientX - startXRef.current;
		const scrollRatio = maxThumbOffset <= 0 ? 0 : delta / maxThumbOffset;
		const scrollableSize = vertical ? viewportEl.scrollHeight : viewportEl.scrollWidth;
		const viewportSize = vertical ? viewportEl.clientHeight : viewportEl.clientWidth;
		const nextScroll = (vertical ? startScrollTopRef.current : startScrollLeftRef.current) + scrollRatio * (scrollableSize - viewportSize);
		if (vertical) viewportEl.scrollTop = nextScroll;
		else viewportEl.scrollLeft = nextScroll;
		event.preventDefault();
		startScrolling(vertical);
	});
	function handleTouchModalityChange(event) {
		setTouchModality(event.pointerType === "touch");
	}
	function handlePointerEnterOrMove(event) {
		handleTouchModalityChange(event);
		if (event.pointerType !== "touch") {
			const isTargetRootChild = contains(rootRef.current, event.target);
			setHovering(isTargetRootChild);
		}
	}
	const state = import_react.useMemo(() => ({
		scrolling: scrollingX || scrollingY,
		hasOverflowX: !hiddenState.x,
		hasOverflowY: !hiddenState.y,
		overflowXStart: overflowEdges.xStart,
		overflowXEnd: overflowEdges.xEnd,
		overflowYStart: overflowEdges.yStart,
		overflowYEnd: overflowEdges.yEnd,
		cornerHidden: hiddenState.corner
	}), [
		scrollingX,
		scrollingY,
		hiddenState.x,
		hiddenState.y,
		hiddenState.corner,
		overflowEdges
	]);
	const props = {
		role: "presentation",
		onPointerEnter: handlePointerEnterOrMove,
		onPointerMove: handlePointerEnterOrMove,
		onPointerDown: handleTouchModalityChange,
		onPointerLeave() {
			setHovering(false);
		},
		style: {
			position: "relative",
			[scrollAreaCornerHeight]: `${cornerSize.height}px`,
			[scrollAreaCornerWidth]: `${cornerSize.width}px`
		}
	};
	const element = useRenderElement("div", componentProps, {
		state,
		ref: [forwardedRef, rootRef],
		props: [props, elementProps],
		stateAttributesMapping: scrollAreaStateAttributesMapping
	});
	const contextValue = import_react.useMemo(() => ({
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		handleScroll,
		disableViewportSnap,
		cornerSize,
		setCornerSize,
		thumbSize,
		setThumbSize,
		hasMeasuredScrollbar,
		setHasMeasuredScrollbar,
		touchModality,
		cornerRef,
		scrollingX,
		scrollingY,
		hovering,
		setHovering,
		viewportRef,
		scrollbarYRef,
		scrollbarXRef,
		thumbYRef,
		thumbXRef,
		rootId,
		hiddenState,
		setHiddenState,
		overflowEdges,
		setOverflowEdges,
		viewportState: state,
		overflowEdgeThreshold: {
			xStart,
			xEnd,
			yStart,
			yEnd
		}
	}), [
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		handleScroll,
		disableViewportSnap,
		cornerSize,
		thumbSize,
		hasMeasuredScrollbar,
		touchModality,
		scrollingX,
		scrollingY,
		hovering,
		rootId,
		hiddenState,
		overflowEdges,
		state,
		xStart,
		xEnd,
		yStart,
		yEnd
	]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(ScrollAreaRootContext.Provider, {
		value: contextValue,
		children: [!disableStyleElements && styleDisableScrollbar.getElement(nonce), element]
	});
});
function normalizeOverflowEdgeThreshold(threshold) {
	const thresholds = typeof threshold === "number" ? {
		xStart: threshold,
		xEnd: threshold,
		yStart: threshold,
		yEnd: threshold
	} : threshold;
	return {
		xStart: Math.max(0, thresholds?.xStart || 0),
		xEnd: Math.max(0, thresholds?.xEnd || 0),
		yStart: Math.max(0, thresholds?.yStart || 0),
		yEnd: Math.max(0, thresholds?.yEnd || 0)
	};
}
//#endregion
//#region node_modules/@base-ui/utils/clamp.mjs
function clamp(val, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
	return Math.max(min, Math.min(val, max));
}
//#endregion
//#region node_modules/@base-ui/react/scroll-area/viewport/ScrollAreaViewportContext.mjs
var ScrollAreaViewportContext = /*#__PURE__*/ import_react.createContext(void 0);
function normalizeScrollOffset(value, max) {
	if (max <= 0) return 0;
	const clamped = clamp(value, 0, max);
	const startDistance = clamped;
	const endDistance = max - clamped;
	const withinStartTolerance = startDistance <= 1;
	const withinEndTolerance = endDistance <= 1;
	if (withinStartTolerance && withinEndTolerance) return startDistance <= endDistance ? 0 : max;
	if (withinStartTolerance) return 0;
	if (withinEndTolerance) return max;
	return clamped;
}
//#endregion
//#region node_modules/@base-ui/react/scroll-area/viewport/ScrollAreaViewportCssVars.mjs
/**
* The distance from the horizontal start edge in pixels.
* @type {number}
*/
var scrollAreaOverflowXStart = "--scroll-area-overflow-x-start";
/**
* The distance from the horizontal end edge in pixels.
* @type {number}
*/
var scrollAreaOverflowXEnd = "--scroll-area-overflow-x-end";
/**
* The distance from the vertical start edge in pixels.
* @type {number}
*/
var scrollAreaOverflowYStart = "--scroll-area-overflow-y-start";
/**
* The distance from the vertical end edge in pixels.
* @type {number}
*/
var scrollAreaOverflowYEnd = "--scroll-area-overflow-y-end";
//#endregion
//#region node_modules/@base-ui/react/scroll-area/scrollbar/ScrollAreaScrollbarCssVars.mjs
/**
* The scroll area thumb's height.
* @type {number}
*/
var scrollAreaThumbHeight = "--scroll-area-thumb-height";
/**
* The scroll area thumb's width.
* @type {number}
*/
var scrollAreaThumbWidth = "--scroll-area-thumb-width";
//#endregion
//#region node_modules/@base-ui/react/scroll-area/viewport/ScrollAreaViewport.mjs
var OVERFLOW_EDGE_VARS = [
	scrollAreaOverflowXStart,
	scrollAreaOverflowXEnd,
	scrollAreaOverflowYStart,
	scrollAreaOverflowYEnd
];
var scrollAreaOverflowVarsRegistered = false;
/**
* Removes inheritance of the scroll area overflow CSS variables, which
* improves rendering performance in complex scroll areas with deep subtrees.
* Instead, each child must manually opt-in to using these properties by
* specifying `inherit`.
* See https://motion.dev/blog/web-animation-performance-tier-list
* under the "Improving CSS variable performance" section.
*/
function removeCSSVariableInheritance() {
	if (scrollAreaOverflowVarsRegistered || webkit) return;
	if (typeof CSS !== "undefined" && "registerProperty" in CSS) OVERFLOW_EDGE_VARS.forEach((name) => {
		try {
			CSS.registerProperty({
				name,
				syntax: "<length>",
				inherits: false,
				initialValue: "0px"
			});
		} catch {}
	});
	scrollAreaOverflowVarsRegistered = true;
}
/**
* The actual scrollable container of the scroll area.
* Renders a `<div>` element.
*
* Documentation: [Base UI Scroll Area](https://base-ui.com/react/components/scroll-area)
*/
var ScrollAreaViewport = /*#__PURE__*/ import_react.forwardRef(function ScrollAreaViewport(componentProps, forwardedRef) {
	const { render, className, style, ...elementProps } = componentProps;
	const { viewportRef, scrollbarYRef, scrollbarXRef, thumbYRef, thumbXRef, cornerRef, cornerSize, setCornerSize, setThumbSize, rootId, setHiddenState, hiddenState, setHasMeasuredScrollbar, handleScroll, touchModality, setHovering, setOverflowEdges, overflowEdgeThreshold, viewportState } = useScrollAreaRootContext();
	const direction = useDirection();
	const programmaticScrollRef = import_react.useRef(true);
	const lastMeasuredViewportMetricsRef = import_react.useRef([
		NaN,
		NaN,
		NaN,
		NaN
	]);
	const scrollEndTimeout = useTimeout();
	const waitForAnimationsTimeout = useTimeout();
	const computeThumbPosition = useStableCallback(() => {
		const viewportEl = viewportRef.current;
		const scrollbarYEl = scrollbarYRef.current;
		const scrollbarXEl = scrollbarXRef.current;
		const thumbYEl = thumbYRef.current;
		const thumbXEl = thumbXRef.current;
		const cornerEl = cornerRef.current;
		if (!viewportEl) return;
		const scrollableContentHeight = viewportEl.scrollHeight;
		const scrollableContentWidth = viewportEl.scrollWidth;
		const viewportHeight = viewportEl.clientHeight;
		const viewportWidth = viewportEl.clientWidth;
		const scrollTop = viewportEl.scrollTop;
		const scrollLeft = viewportEl.scrollLeft;
		const lastMeasuredViewportMetrics = lastMeasuredViewportMetricsRef.current;
		const isFirstMeasurement = Number.isNaN(lastMeasuredViewportMetrics[0]);
		lastMeasuredViewportMetrics[0] = viewportHeight;
		lastMeasuredViewportMetrics[1] = scrollableContentHeight;
		lastMeasuredViewportMetrics[2] = viewportWidth;
		lastMeasuredViewportMetrics[3] = scrollableContentWidth;
		if (isFirstMeasurement) setHasMeasuredScrollbar(true);
		if (scrollableContentHeight === 0 || scrollableContentWidth === 0) return;
		const nextHiddenState = getHiddenState(viewportEl);
		const scrollbarYHidden = nextHiddenState.y;
		const scrollbarXHidden = nextHiddenState.x;
		const ratioX = viewportWidth / scrollableContentWidth;
		const ratioY = viewportHeight / scrollableContentHeight;
		const maxScrollLeft = Math.max(0, scrollableContentWidth - viewportWidth);
		const maxScrollTop = Math.max(0, scrollableContentHeight - viewportHeight);
		let scrollLeftFromStart = 0;
		let scrollLeftFromEnd = 0;
		if (!scrollbarXHidden) {
			scrollLeftFromStart = normalizeScrollOffset(direction === "rtl" ? -scrollLeft : scrollLeft, maxScrollLeft);
			scrollLeftFromEnd = maxScrollLeft - scrollLeftFromStart;
		}
		const scrollTopFromStart = scrollbarYHidden ? 0 : normalizeScrollOffset(scrollTop, maxScrollTop);
		const scrollTopFromEnd = scrollbarYHidden ? 0 : maxScrollTop - scrollTopFromStart;
		const nextWidth = scrollbarXHidden ? 0 : viewportWidth;
		const nextHeight = scrollbarYHidden ? 0 : viewportHeight;
		let nextCornerWidth = 0;
		let nextCornerHeight = 0;
		if (!scrollbarXHidden && !scrollbarYHidden) {
			nextCornerWidth = scrollbarYEl?.offsetWidth || 0;
			nextCornerHeight = scrollbarXEl?.offsetHeight || 0;
		}
		const cornerNotYetSized = cornerSize.width === 0 && cornerSize.height === 0;
		const cornerWidthOffset = cornerNotYetSized ? nextCornerWidth : 0;
		const cornerHeightOffset = cornerNotYetSized ? nextCornerHeight : 0;
		const scrollbarXOffset = getOffset(scrollbarXEl, "padding", "x");
		const scrollbarYOffset = getOffset(scrollbarYEl, "padding", "y");
		const thumbXOffset = getOffset(thumbXEl, "margin", "x");
		const thumbYOffset = getOffset(thumbYEl, "margin", "y");
		const idealNextWidth = nextWidth - scrollbarXOffset - thumbXOffset;
		const idealNextHeight = nextHeight - scrollbarYOffset - thumbYOffset;
		const maxNextWidth = scrollbarXEl ? Math.min(scrollbarXEl.offsetWidth - cornerWidthOffset, idealNextWidth) : idealNextWidth;
		const maxNextHeight = scrollbarYEl ? Math.min(scrollbarYEl.offsetHeight - cornerHeightOffset, idealNextHeight) : idealNextHeight;
		const clampedNextWidth = Math.max(16, maxNextWidth * ratioX);
		const clampedNextHeight = Math.max(16, maxNextHeight * ratioY);
		setThumbSize((prevSize) => pickState(prevSize, {
			width: clampedNextWidth,
			height: clampedNextHeight
		}));
		if (scrollbarYEl && thumbYEl) {
			const thumbOffsetY = applyOverscrollThumb(thumbYEl, scrollAreaThumbHeight, scrollTop, maxScrollTop, scrollableContentHeight, clampedNextHeight, scrollbarYEl.offsetHeight - clampedNextHeight - scrollbarYOffset - thumbYOffset);
			thumbYEl.style.transform = `translate3d(0,${thumbOffsetY}px,0)`;
		}
		if (scrollbarXEl && thumbXEl) {
			const maxThumbOffsetX = scrollbarXEl.offsetWidth - clampedNextWidth - scrollbarXOffset - thumbXOffset;
			const offsetX = applyOverscrollThumb(thumbXEl, scrollAreaThumbWidth, direction === "rtl" ? -scrollLeft : scrollLeft, maxScrollLeft, scrollableContentWidth, clampedNextWidth, maxThumbOffsetX);
			thumbXEl.style.transform = `translate3d(${direction === "rtl" ? -offsetX : offsetX}px,0,0)`;
		}
		const overflowMetricsPx = [
			scrollLeftFromStart,
			scrollLeftFromEnd,
			scrollTopFromStart,
			scrollTopFromEnd
		];
		OVERFLOW_EDGE_VARS.forEach((cssVar, index) => {
			viewportEl.style.setProperty(cssVar, `${overflowMetricsPx[index]}px`);
		});
		if (cornerEl) setCornerSize((prevSize) => pickState(prevSize, {
			width: nextCornerWidth,
			height: nextCornerHeight
		}));
		setHiddenState((prevState) => pickState(prevState, nextHiddenState));
		const nextOverflowEdges = {
			xStart: !scrollbarXHidden && scrollLeftFromStart > overflowEdgeThreshold.xStart,
			xEnd: !scrollbarXHidden && scrollLeftFromEnd > overflowEdgeThreshold.xEnd,
			yStart: !scrollbarYHidden && scrollTopFromStart > overflowEdgeThreshold.yStart,
			yEnd: !scrollbarYHidden && scrollTopFromEnd > overflowEdgeThreshold.yEnd
		};
		setOverflowEdges((prev) => pickState(prev, nextOverflowEdges));
	});
	useIsoLayoutEffect(() => {
		removeCSSVariableInheritance();
	}, []);
	useIsoLayoutEffect(() => {
		queueMicrotask(computeThumbPosition);
	}, [
		computeThumbPosition,
		hiddenState,
		direction,
		overflowEdgeThreshold.xStart,
		overflowEdgeThreshold.xEnd,
		overflowEdgeThreshold.yStart,
		overflowEdgeThreshold.yEnd
	]);
	useIsoLayoutEffect(() => {
		if (viewportRef.current?.matches(":hover")) setHovering(true);
	}, [viewportRef, setHovering]);
	useIsoLayoutEffect(() => {
		const viewport = viewportRef.current;
		if (typeof ResizeObserver === "undefined" || !viewport) return;
		let hasInitialized = false;
		const resizeObserver = new ResizeObserver(() => {
			if (!hasInitialized) {
				hasInitialized = true;
				const lastMeasuredViewportMetrics = lastMeasuredViewportMetricsRef.current;
				if (lastMeasuredViewportMetrics[0] === viewport.clientHeight && lastMeasuredViewportMetrics[1] === viewport.scrollHeight && lastMeasuredViewportMetrics[2] === viewport.clientWidth && lastMeasuredViewportMetrics[3] === viewport.scrollWidth) return;
			}
			computeThumbPosition();
		});
		resizeObserver.observe(viewport);
		waitForAnimationsTimeout.start(0, () => {
			const animations = viewport.getAnimations({ subtree: true });
			if (animations.length === 0) return;
			Promise.allSettled(animations.map((animation) => animation.finished)).then(computeThumbPosition).catch(() => {});
		});
		return () => {
			resizeObserver.disconnect();
			waitForAnimationsTimeout.clear();
		};
	}, [
		computeThumbPosition,
		viewportRef,
		waitForAnimationsTimeout
	]);
	function handleUserInteraction() {
		programmaticScrollRef.current = false;
	}
	const props = {
		role: "presentation",
		...rootId && { "data-id": `${rootId}-viewport` },
		tabIndex: hiddenState.x && hiddenState.y ? -1 : 0,
		className: styleDisableScrollbar.className,
		style: { overflow: "scroll" },
		onScroll() {
			if (!viewportRef.current) return;
			computeThumbPosition();
			if (touchModality || !programmaticScrollRef.current) handleScroll({
				x: viewportRef.current.scrollLeft,
				y: viewportRef.current.scrollTop
			});
			scrollEndTimeout.start(100, () => {
				programmaticScrollRef.current = true;
			});
		},
		onWheel: handleUserInteraction,
		onPointerMove: handleUserInteraction,
		onPointerEnter: handleUserInteraction,
		onKeyDown: handleUserInteraction
	};
	const element = useRenderElement("div", componentProps, {
		ref: [forwardedRef, viewportRef],
		state: viewportState,
		props: [props, elementProps],
		stateAttributesMapping: scrollAreaStateAttributesMapping
	});
	const contextValue = import_react.useMemo(() => ({ computeThumbPosition }), [computeThumbPosition]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ScrollAreaViewportContext.Provider, {
		value: contextValue,
		children: element
	});
});
function getHiddenState(viewport) {
	const y = viewport.clientHeight >= viewport.scrollHeight;
	const x = viewport.clientWidth >= viewport.scrollWidth;
	return {
		y,
		x,
		corner: y || x
	};
}
/**
* Returns `prev` when `next` is shallow-equal to it so setState bails out and
* scroll-frame updates don't rebuild the root context.
*/
function pickState(prev, next) {
	for (const key in next) if (prev[key] !== next[key]) return next;
	return prev;
}
/**
* Sizes the thumb and returns its axis offset. On overscroll (Safari rubber-band only) it shrinks
* against the pinned edge, damped by `content / (content + overscroll)` to match native feedback;
* the size flows through the thumb-size variable so the resting `var(...)` still applies.
*/
function applyOverscrollThumb(thumbEl, sizeVar, scrollFromStart, maxScroll, content, size, maxThumbOffset) {
	const clamped = clamp(scrollFromStart, 0, maxScroll);
	const overscroll = scrollFromStart - clamped;
	const nextSize = Math.max(16, size * content / (content + Math.abs(overscroll)));
	thumbEl.style.setProperty(sizeVar, overscroll ? `${nextSize}px` : "");
	return (maxScroll ? clamped / maxScroll * maxThumbOffset : 0) + (overscroll > 0 ? size - nextSize : 0);
}
//#endregion
//#region node_modules/@base-ui/react/scroll-area/scrollbar/ScrollAreaScrollbarContext.mjs
var ScrollAreaScrollbarContext = /*#__PURE__*/ import_react.createContext(void 0);
function useScrollAreaScrollbarContext() {
	const context = import_react.useContext(ScrollAreaScrollbarContext);
	if (context === void 0) throw new Error(formatErrorMessage(54));
	return context;
}
//#endregion
//#region node_modules/@base-ui/react/scroll-area/scrollbar/ScrollAreaScrollbar.mjs
/**
* A vertical or horizontal scrollbar for the scroll area.
* Renders a `<div>` element.
*
* Documentation: [Base UI Scroll Area](https://base-ui.com/react/components/scroll-area)
*/
var ScrollAreaScrollbar = /*#__PURE__*/ import_react.forwardRef(function ScrollAreaScrollbar(componentProps, forwardedRef) {
	const { render, className, orientation = "vertical", keepMounted = false, style, ...elementProps } = componentProps;
	const { hovering, scrollingX, scrollingY, hiddenState, scrollbarYRef, scrollbarXRef, viewportRef, thumbYRef, thumbXRef, handlePointerDown, handlePointerUp, handleScroll, disableViewportSnap, rootId, thumbSize, hasMeasuredScrollbar, viewportState } = useScrollAreaRootContext();
	const vertical = orientation === "vertical";
	const state = {
		...viewportState,
		hovering,
		scrolling: vertical ? scrollingY : scrollingX,
		orientation
	};
	const direction = useDirection();
	const hideTrackUntilMeasured = !hasMeasuredScrollbar && !keepMounted;
	const isHidden = vertical ? hiddenState.y : hiddenState.x;
	const shouldRender = keepMounted || !isHidden;
	import_react.useEffect(() => {
		if (!shouldRender) return;
		const viewportEl = viewportRef.current;
		const scrollbarEl = vertical ? scrollbarYRef.current : scrollbarXRef.current;
		if (!scrollbarEl) return;
		function handleWheel(event) {
			if (!viewportEl || event.ctrlKey) return;
			const horizontal = !vertical;
			const scrollProperty = horizontal ? "scrollLeft" : "scrollTop";
			const delta = horizontal ? event.deltaX : event.deltaY;
			if (delta === 0) return;
			const maxScroll = horizontal ? viewportEl.scrollWidth - viewportEl.clientWidth : viewportEl.scrollHeight - viewportEl.clientHeight;
			const minScroll = horizontal && direction === "rtl" ? -maxScroll : 0;
			const maxScrollValue = horizontal && direction === "rtl" ? 0 : maxScroll;
			const scrollValue = viewportEl[scrollProperty];
			if (scrollValue <= minScroll && delta < 0 || scrollValue >= maxScrollValue && delta > 0) return;
			event.preventDefault();
			viewportEl[scrollProperty] = Math.min(maxScrollValue, Math.max(minScroll, scrollValue + delta));
			handleScroll({
				x: viewportEl.scrollLeft,
				y: viewportEl.scrollTop
			});
		}
		return addEventListener(scrollbarEl, "wheel", handleWheel, { passive: false });
	}, [
		direction,
		handleScroll,
		vertical,
		scrollbarXRef,
		scrollbarYRef,
		shouldRender,
		viewportRef
	]);
	const props = {
		...rootId && { "data-id": `${rootId}-scrollbar` },
		"aria-hidden": true,
		onPointerDown(event) {
			if (event.button !== 0) return;
			const target = getTarget(event.nativeEvent);
			const thumbEl = vertical ? thumbYRef.current : thumbXRef.current;
			if (thumbEl && contains(thumbEl, target)) return;
			const viewportEl = viewportRef.current;
			if (!viewportEl) return;
			const scrollbarEl = vertical ? scrollbarYRef.current : scrollbarXRef.current;
			if (!thumbEl || !scrollbarEl) return;
			const axis = vertical ? "y" : "x";
			const thumbOffset = getOffset(thumbEl, "margin", axis);
			const scrollbarOffset = getOffset(scrollbarEl, "padding", axis);
			const thumbSizePx = vertical ? thumbEl.offsetHeight : thumbEl.offsetWidth;
			const trackRect = scrollbarEl.getBoundingClientRect();
			const clickPosition = vertical ? event.clientY - trackRect.top - thumbSizePx / 2 - scrollbarOffset + thumbOffset / 2 : event.clientX - trackRect.left - thumbSizePx / 2 - scrollbarOffset + thumbOffset / 2;
			const scrollableSize = vertical ? viewportEl.scrollHeight : viewportEl.scrollWidth;
			const viewportSize = vertical ? viewportEl.clientHeight : viewportEl.clientWidth;
			const maxThumbOffset = (vertical ? scrollbarEl.offsetHeight : scrollbarEl.offsetWidth) - thumbSizePx - scrollbarOffset - thumbOffset;
			if (maxThumbOffset <= 0) return;
			const scrollRatio = clickPosition / maxThumbOffset;
			const maxScrollDistance = scrollableSize - viewportSize;
			disableViewportSnap();
			if (vertical) viewportEl.scrollTop = scrollRatio * maxScrollDistance;
			else if (direction === "rtl") viewportEl.scrollLeft = -(1 - scrollRatio) * maxScrollDistance;
			else viewportEl.scrollLeft = scrollRatio * maxScrollDistance;
			handleScroll({
				x: viewportEl.scrollLeft,
				y: viewportEl.scrollTop
			});
			handlePointerDown(event);
		},
		onMouseDown(event) {
			event.preventDefault();
		},
		onPointerUp: handlePointerUp,
		onPointerCancel: handlePointerUp,
		style: {
			position: "absolute",
			touchAction: "none",
			WebkitUserSelect: "none",
			userSelect: "none",
			visibility: hideTrackUntilMeasured ? "hidden" : void 0,
			...vertical ? {
				top: 0,
				bottom: `var(${scrollAreaCornerHeight})`,
				insetInlineEnd: 0,
				[scrollAreaThumbHeight]: `${thumbSize.height}px`
			} : {
				insetInlineStart: 0,
				insetInlineEnd: `var(${scrollAreaCornerWidth})`,
				bottom: 0,
				[scrollAreaThumbWidth]: `${thumbSize.width}px`
			}
		}
	};
	const element = useRenderElement("div", componentProps, {
		ref: [forwardedRef, vertical ? scrollbarYRef : scrollbarXRef],
		state,
		props: [props, elementProps],
		stateAttributesMapping: scrollAreaStateAttributesMapping
	});
	if (!shouldRender) return null;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ScrollAreaScrollbarContext.Provider, {
		value: orientation,
		children: element
	});
});
//#endregion
//#region node_modules/@base-ui/react/scroll-area/thumb/ScrollAreaThumb.mjs
/**
* The draggable part of the scrollbar that indicates the current scroll position.
* Renders a `<div>` element.
*
* Documentation: [Base UI Scroll Area](https://base-ui.com/react/components/scroll-area)
*/
var ScrollAreaThumb = /*#__PURE__*/ import_react.forwardRef(function ScrollAreaThumb(componentProps, forwardedRef) {
	const { render, className, style, ...elementProps } = componentProps;
	const { thumbYRef, thumbXRef, handlePointerDown, handlePointerMove, handlePointerUp, scrollingX, scrollingY, hasMeasuredScrollbar } = useScrollAreaRootContext();
	const orientation = useScrollAreaScrollbarContext();
	const vertical = orientation === "vertical";
	return useRenderElement("div", componentProps, {
		ref: [forwardedRef, vertical ? thumbYRef : thumbXRef],
		state: {
			scrolling: vertical ? scrollingY : scrollingX,
			orientation
		},
		props: [{
			onPointerDown: handlePointerDown,
			onPointerMove: handlePointerMove,
			onPointerUp: handlePointerUp,
			onPointerCancel: handlePointerUp,
			style: {
				visibility: hasMeasuredScrollbar ? void 0 : "hidden",
				...vertical ? { height: "var(--scroll-area-thumb-height)" } : { width: "var(--scroll-area-thumb-width)" }
			}
		}, elementProps]
	});
});
//#endregion
//#region node_modules/@base-ui/react/scroll-area/corner/ScrollAreaCorner.mjs
/**
* A small rectangular area that appears at the intersection of horizontal and vertical scrollbars.
* Renders a `<div>` element.
*
* Documentation: [Base UI Scroll Area](https://base-ui.com/react/components/scroll-area)
*/
var ScrollAreaCorner = /*#__PURE__*/ import_react.forwardRef(function ScrollAreaCorner(componentProps, forwardedRef) {
	const { render, className, style, ...elementProps } = componentProps;
	const { cornerRef, cornerSize, hiddenState } = useScrollAreaRootContext();
	const element = useRenderElement("div", componentProps, {
		ref: [forwardedRef, cornerRef],
		props: [{
			"aria-hidden": true,
			style: {
				position: "absolute",
				bottom: 0,
				insetInlineEnd: 0,
				width: cornerSize.width,
				height: cornerSize.height
			}
		}, elementProps]
	});
	if (hiddenState.corner) return null;
	return element;
});
//#endregion
//#region node_modules/fumadocs-ui/dist/components/ui/scroll-area.js
function ScrollArea({ children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrollAreaRoot, {
		...props,
		children: [
			children,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaCorner, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollBar, { orientation: "vertical" })
		]
	});
}
function ScrollViewport({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaViewport, {
		className: (s) => cn("size-full rounded-[inherit]", typeof className === "function" ? className(s) : className),
		...props,
		children
	});
}
function ScrollBar({ className, orientation = "vertical", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaScrollbar, {
		orientation,
		className: (s) => cn("flex select-none transition-opacity", !s.hovering && "opacity-0", orientation === "vertical" && "h-full w-1.5", orientation === "horizontal" && "h-1.5 flex-col", typeof className === "function" ? className(s) : className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-fd-border" })
	});
}
//#endregion
export { useTabsGroups as a, getBreadcrumbItemsFromPath as c, ChevronsUpDown as d, ChevronDown as f, TreeContextProvider as i, PanelLeft as l, ScrollViewport as n, useTreeContext as o, clamp as r, useTreePath as s, ScrollArea as t, Languages as u };
