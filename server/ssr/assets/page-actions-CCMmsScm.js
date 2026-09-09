import { i as __toESM, n as __exportAll$1 } from "./rolldown-runtime-B4iAMlE-.js";
import { t as require_jsx_runtime } from "./jsx-runtime-BqLYtsoi.js";
import { t as require_react } from "./react-SLAb4Nsi.js";
import { r as require_react_dom } from "../index.js";
import { r as cn, t as buttonVariants } from "./button-Cpca6tPg.js";
import { t as useCopyButton } from "./use-copy-button-7PXhh8CI.js";
import { t as mergeRefs$1 } from "./merge-refs-BfwMulAo.js";
import { a as useTabsGroups, d as ChevronsUpDown, f as ChevronDown, n as ScrollViewport, o as useTreeContext, s as useTreePath, t as ScrollArea } from "./scroll-area-DW5uZXgq.js";
import { t as createLucideIcon } from "./createLucideIcon-CUS0Rvh9.js";
import { a as isLinkItemActive, d as PopoverContent, f as PopoverTrigger, i as isLayoutTabActive, s as isActive, u as Popover } from "./client-BU1Fmnr9.js";
import { t as Check } from "./check-C0qe87e9.js";
import { t as e } from "./dist-D3b8pzgn.js";
import { t as Copy } from "./copy-DYT4UPuF.js";
import { c as useTranslations, i as usePathname } from "./framework-BVFfi5Qn.js";
import { t as Link } from "./link-BUqPnhxi.js";
import { n as isEqualShallow, t as useOnChange } from "./use-on-change-CnLJrKl4.js";
import { n as CollapsibleContent, r as CollapsibleTrigger, t as Collapsible } from "./collapsible-BTQIwl1c.js";
//#region node_modules/lucide-react/dist/esm/icons/chevron-left.mjs
/**
* @license lucide-react v1.43.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var __iconData$2 = {
	name: "chevron-left",
	size: 24,
	node: [["path", {
		d: "m15 18-6-6 6-6",
		key: "1wnfg3"
	}]]
};
__iconData$2.node;
var ChevronLeft = createLucideIcon(__iconData$2);
//#endregion
//#region node_modules/lucide-react/dist/esm/icons/external-link.mjs
/**
* @license lucide-react v1.43.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var __iconData$1 = {
	name: "external-link",
	size: 24,
	node: [
		["path", {
			d: "M15 3h6v6",
			key: "1q9fwt"
		}],
		["path", {
			d: "M10 14 21 3",
			key: "gplh6r"
		}],
		["path", {
			d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
			key: "a6xqqp"
		}]
	]
};
__iconData$1.node;
var ExternalLink = createLucideIcon(__iconData$1);
//#endregion
//#region node_modules/lucide-react/dist/esm/icons/text-align-start.mjs
/**
* @license lucide-react v1.43.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var __iconData = {
	name: "text-align-start",
	size: 24,
	node: [
		["path", {
			d: "M21 5H3",
			key: "1fi0y6"
		}],
		["path", {
			d: "M15 12H3",
			key: "6jk70r"
		}],
		["path", {
			d: "M17 19H3",
			key: "z6ezky"
		}]
	],
	aliases: ["text", "align-left"]
};
__iconData.node;
var TextAlignStart = createLucideIcon(__iconData);
//#endregion
//#region node_modules/fumadocs-ui/dist/utils/use-is-scroll-top.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function useIsScrollTop({ enabled = true }) {
	const [isTop, setIsTop] = (0, import_react.useState)();
	(0, import_react.useEffect)(() => {
		if (!enabled) return;
		const listener = () => {
			setIsTop(window.scrollY < 10);
		};
		listener();
		window.addEventListener("scroll", listener);
		return () => {
			window.removeEventListener("scroll", listener);
		};
	}, [enabled]);
	return isTop;
}
//#endregion
//#region node_modules/fumadocs-ui/dist/_virtual/_rolldown/runtime.js
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime(), 1);
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region node_modules/fumadocs-core/dist/utils/use-media-query.js
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom(), 1);
function useMediaQuery(query, disabled = false) {
	const [isMatch, setMatch] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (disabled) return;
		const mediaQueryList = window.matchMedia(query);
		const handleChange = () => {
			setMatch(mediaQueryList.matches);
		};
		handleChange();
		mediaQueryList.addEventListener("change", handleChange);
		return () => {
			mediaQueryList.removeEventListener("change", handleChange);
		};
	}, [disabled, query]);
	return isMatch;
}
//#endregion
//#region node_modules/fumadocs-ui/dist/components/sidebar/base.js
var base_exports = /* @__PURE__ */ __exportAll({
	SidebarCollapseTrigger: () => SidebarCollapseTrigger,
	SidebarContent: () => SidebarContent,
	SidebarDrawerContent: () => SidebarDrawerContent,
	SidebarDrawerOverlay: () => SidebarDrawerOverlay,
	SidebarFolder: () => SidebarFolder,
	SidebarFolderContent: () => SidebarFolderContent,
	SidebarFolderLink: () => SidebarFolderLink,
	SidebarFolderTrigger: () => SidebarFolderTrigger,
	SidebarItem: () => SidebarItem,
	SidebarProvider: () => SidebarProvider,
	SidebarSeparator: () => SidebarSeparator,
	SidebarTrigger: () => SidebarTrigger,
	SidebarViewport: () => SidebarViewport,
	useAutoScroll: () => useAutoScroll,
	useFolder: () => useFolder,
	useFolderDepth: () => useFolderDepth,
	useSidebar: () => useSidebar
});
var SidebarContext = (0, import_react.createContext)(null);
var FolderContext = (0, import_react.createContext)(null);
function SidebarProvider({ defaultOpenLevel = 0, prefetch, children }) {
	const closeOnRedirect = (0, import_react.useRef)(true);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [collapsed, setCollapsed] = (0, import_react.useState)(false);
	const pathname = usePathname();
	const mode = useMediaQuery("(width < 768px)") ? "drawer" : "full";
	useOnChange(pathname, () => {
		if (closeOnRedirect.current) setOpen(false);
		closeOnRedirect.current = true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarContext, {
		value: (0, import_react.useMemo)(() => ({
			open,
			setOpen,
			collapsed,
			setCollapsed,
			closeOnRedirect,
			defaultOpenLevel,
			prefetch,
			mode
		}), [
			open,
			collapsed,
			defaultOpenLevel,
			prefetch,
			mode
		]),
		children
	});
}
function useSidebar() {
	const ctx = (0, import_react.use)(SidebarContext);
	if (!ctx) throw new Error("Missing SidebarContext, make sure you have wrapped the component in <DocsLayout /> and the context is available.");
	return ctx;
}
function useFolder() {
	return (0, import_react.use)(FolderContext);
}
function useFolderDepth() {
	return (0, import_react.use)(FolderContext)?.depth ?? 0;
}
function SidebarContent({ children }) {
	const { collapsed, mode } = useSidebar();
	const [hover, setHover] = (0, import_react.useState)(false);
	const ref = (0, import_react.useRef)(null);
	const timerRef = (0, import_react.useRef)(0);
	useOnChange(collapsed, () => {
		if (collapsed) setHover(false);
	});
	if (mode !== "full") return;
	function shouldIgnoreHover(e) {
		const element = ref.current;
		if (!element) return true;
		return !collapsed || e.pointerType === "touch" || element.getAnimations().length > 0;
	}
	return children({
		ref,
		collapsed,
		hovered: hover,
		onPointerEnter(e) {
			if (shouldIgnoreHover(e)) return;
			window.clearTimeout(timerRef.current);
			setHover(true);
		},
		onPointerLeave(e) {
			if (shouldIgnoreHover(e)) return;
			window.clearTimeout(timerRef.current);
			timerRef.current = window.setTimeout(() => setHover(false), Math.min(e.clientX, document.body.clientWidth - e.clientX) > 100 ? 0 : 500);
		}
	});
}
function SidebarDrawerOverlay(props) {
	const { open, setOpen, mode } = useSidebar();
	const [hidden, setHidden] = (0, import_react.useState)(!open);
	if (open && hidden) setHidden(false);
	if (mode !== "drawer" || hidden) return;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-state": open ? "open" : "closed",
		onClick: () => setOpen(false),
		onAnimationEnd: () => {
			if (!open) import_react_dom.flushSync(() => setHidden(true));
		},
		...props
	});
}
function SidebarDrawerContent({ className, children, ...props }) {
	const { open, mode } = useSidebar();
	const [hidden, setHidden] = (0, import_react.useState)(!open);
	if (open && hidden) setHidden(false);
	if (mode !== "drawer") return;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
		id: "nd-sidebar-mobile",
		"data-state": open ? "open" : "closed",
		className: cn(hidden && "invisible", className),
		onAnimationEnd: () => {
			if (!open) import_react_dom.flushSync(() => setHidden(true));
		},
		...props,
		children
	});
}
function SidebarViewport({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
		className: (s) => cn("min-h-0 flex-1", typeof className === "function" ? className(s) : className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollViewport, {
			className: "p-4 overscroll-contain mask-[linear-gradient(to_bottom,transparent,white_12px,white_calc(100%-12px),transparent)]",
			children: props.children
		})
	});
}
function SidebarSeparator(props) {
	const depth = useFolderDepth();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		...props,
		className: cn("inline-flex items-center gap-2 mb-1.5 px-2 mt-6 empty:mb-0", depth === 0 && "first:mt-0", props.className),
		children: props.children
	});
}
function SidebarItem({ icon, active = false, children, ...props }) {
	const ref = (0, import_react.useRef)(null);
	const { prefetch } = useSidebar();
	useAutoScroll(active, ref);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		ref,
		"data-active": active,
		prefetch,
		...props,
		children: [icon ?? (props.external ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {}) : null), children]
	});
}
function SidebarFolder({ defaultOpen: defaultOpenProp, collapsible = true, active = false, children, ...props }) {
	const { defaultOpenLevel } = useSidebar();
	const depth = useFolderDepth() + 1;
	const defaultOpen = collapsible === false || active || (defaultOpenProp ?? defaultOpenLevel >= depth);
	const [open, setOpen] = (0, import_react.useState)(defaultOpen);
	useOnChange(defaultOpen, (v) => {
		if (v) setOpen(v);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Collapsible, {
		open,
		onOpenChange: setOpen,
		disabled: !collapsible,
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderContext, {
			value: (0, import_react.useMemo)(() => ({
				open,
				setOpen,
				depth,
				collapsible
			}), [
				collapsible,
				depth,
				open
			]),
			children
		})
	});
}
function SidebarFolderTrigger({ children, ...props }) {
	const { open, collapsible } = (0, import_react.use)(FolderContext);
	if (collapsible) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CollapsibleTrigger, {
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
			"data-icon": true,
			className: cn("ms-auto transition-transform", !open && "-rotate-90 rtl:rotate-90")
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		...props,
		children
	});
}
function SidebarFolderLink({ children, active = false, ...props }) {
	const ref = (0, import_react.useRef)(null);
	const { open, setOpen, collapsible } = (0, import_react.use)(FolderContext);
	const { prefetch } = useSidebar();
	useAutoScroll(active, ref);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		ref,
		"data-active": active,
		onClick: (e) => {
			if (!collapsible) return;
			if (e.target instanceof Element && e.target.matches("[data-icon], [data-icon] *")) {
				setOpen(!open);
				e.preventDefault();
			} else setOpen(active ? !open : true);
		},
		prefetch,
		...props,
		children: [children, collapsible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
			"data-icon": true,
			className: cn("ms-auto transition-transform", !open && "-rotate-90 rtl:rotate-90")
		})]
	});
}
function SidebarFolderContent(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleContent, {
		...props,
		children: props.children
	});
}
function SidebarTrigger({ children, ...props }) {
	const { open, setOpen } = useSidebar();
	const t = useTranslations({ note: "sidebar" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": open ? t("Close Sidebar", { note: "aria-label" }) : t("Open Sidebar", { note: "aria-label" }),
		"aria-expanded": open,
		"aria-controls": "nd-sidebar-mobile",
		onClick: () => setOpen((prev) => !prev),
		...props,
		children
	});
}
function SidebarCollapseTrigger(props) {
	const { collapsed, setCollapsed } = useSidebar();
	const t = useTranslations({ note: "sidebar" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": t("Collapse Sidebar", { note: "aria-label" }),
		"data-collapsed": collapsed,
		onClick: () => {
			setCollapsed((prev) => !prev);
		},
		...props,
		children: props.children
	});
}
/**
* scroll to the element if `active` is true
*/
function useAutoScroll(active, ref) {
	const { mode } = useSidebar();
	(0, import_react.useEffect)(() => {
		if (active && ref.current) e(ref.current, {
			boundary: document.getElementById(mode === "drawer" ? "nd-sidebar-mobile" : "nd-sidebar"),
			scrollMode: "if-needed"
		});
	}, [
		active,
		mode,
		ref
	]);
}
//#endregion
//#region node_modules/fumadocs-ui/dist/components/sidebar/page-tree.js
var RendererContext = (0, import_react.createContext)(null);
function createPageTreeRenderer({ SidebarFolder, SidebarFolderContent, SidebarFolderLink, SidebarFolderTrigger, SidebarSeparator, SidebarItem }) {
	function renderList(nodes) {
		return nodes.map((node, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTreeNode, { node }, i));
	}
	function PageTreeNode({ node }) {
		const { Separator, Item, Folder, pathname } = (0, import_react.use)(RendererContext);
		if (node.type === "separator") {
			if (Separator) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { item: node });
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarSeparator, { children: [node.icon, node.name] });
		}
		if (node.type === "folder") {
			const path = useTreePath();
			if (Folder) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Folder, {
				item: node,
				children: renderList(node.children)
			});
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarFolder, {
				collapsible: node.collapsible,
				active: path.includes(node),
				defaultOpen: node.defaultOpen,
				children: [node.index ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarFolderLink, {
					href: node.index.url,
					active: isActive(node.index.url, pathname),
					external: node.index.external,
					children: [node.icon, node.name]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarFolderTrigger, { children: [node.icon, node.name] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarFolderContent, { children: renderList(node.children) })]
			});
		}
		if (Item) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, { item: node });
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarItem, {
			href: node.url,
			external: node.external,
			active: isActive(node.url, pathname),
			icon: node.icon,
			children: node.name
		});
	}
	/**
	* Render sidebar items from page tree
	*/
	return function SidebarPageTree(components) {
		const { Folder, Item, Separator } = components;
		const { root } = useTreeContext();
		const pathname = usePathname();
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RendererContext, {
			value: (0, import_react.useMemo)(() => ({
				Folder,
				Item,
				Separator,
				pathname
			}), [
				Folder,
				Item,
				Separator,
				pathname
			]),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: renderList(root.children) }, root.$id)
		});
	};
}
//#endregion
//#region node_modules/fumadocs-ui/dist/components/sidebar/link-item.js
function createLinkItemRenderer({ SidebarFolder, SidebarFolderContent, SidebarFolderLink, SidebarFolderTrigger, SidebarItem }) {
	/**
	* Render sidebar items from page tree
	*/
	return function SidebarLinkItem({ item, ...props }) {
		const pathname = usePathname();
		const active = isLinkItemActive(item, pathname);
		if (item.type === "custom") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			...props,
			children: item.children
		});
		if (item.type === "menu") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarFolder, {
			...props,
			children: [item.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarFolderLink, {
				href: item.url,
				active,
				external: item.external,
				children: [item.icon, item.text]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarFolderTrigger, { children: [item.icon, item.text] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarFolderContent, { children: item.items.map((child, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarLinkItem, { item: child }, i)) })]
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarItem, {
			href: item.url,
			icon: item.icon,
			external: item.external,
			active,
			...props,
			children: item.text
		});
	};
}
//#endregion
//#region node_modules/fumadocs-ui/dist/components/sidebar/tabs/dropdown.js
/**
* Renders the given tabs as a dropdown per tabs group, one for each root folder on the
* current page's path, letting users switch between root folders of the same type.
*/
function SidebarTabsDropdown({ options, placeholder, ...props }) {
	return useTabsGroups(options).map((group, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dropdown, {
		options: group.options,
		placeholder,
		...props
	}, i));
}
function Dropdown({ options, placeholder, ...props }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const { closeOnRedirect } = useSidebar();
	const pathname = usePathname();
	const path = useTreePath();
	const selected = (0, import_react.useMemo)(() => {
		return options.findLast((item) => isLayoutTabActive(item, path, pathname));
	}, [
		options,
		path,
		pathname
	]);
	const onClick = () => {
		closeOnRedirect.current = false;
		setOpen(false);
	};
	const item = selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "size-9 shrink-0 empty:hidden md:size-5",
		children: selected.icon
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm font-medium",
		children: selected.title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-fd-muted-foreground empty:hidden md:hidden",
		children: selected.description
	})] })] }) : placeholder;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
		open,
		onOpenChange: setOpen,
		children: [item && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverTrigger, {
			...props,
			className: cn("flex items-center gap-2 rounded-lg p-2 border bg-fd-secondary/50 text-start text-fd-secondary-foreground transition-colors hover:bg-fd-accent data-[popup-open]:bg-fd-accent data-[popup-open]:text-fd-accent-foreground", props.className),
			children: [item, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsUpDown, { className: "shrink-0 ms-auto size-4 text-fd-muted-foreground" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
			className: "flex flex-col gap-1 w-(--anchor-width) p-1 fd-scroll-container",
			children: options.map((item) => {
				const isActive = selected && item.url === selected.url;
				if (!isActive && item.unlisted) return;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					href: item.url,
					onClick,
					...item.props,
					className: cn("flex items-center gap-2 rounded-lg p-1.5 hover:bg-fd-accent hover:text-fd-accent-foreground", item.props?.className),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "shrink-0 size-9 md:mb-auto md:size-5 empty:hidden",
							children: item.icon
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium leading-none",
							children: item.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[0.8125rem] text-fd-muted-foreground mt-1 empty:hidden",
							children: item.description
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: cn("shrink-0 ms-auto size-3.5 text-fd-primary", !isActive && "invisible") })
					]
				}, item.url);
			})
		})]
	});
}
//#endregion
//#region node_modules/fumadocs-core/dist/toc.js
var toc_exports = /* @__PURE__ */ __exportAll$1({
	AnchorProvider: () => AnchorProvider,
	ScrollProvider: () => ScrollProvider,
	TOCItem: () => TOCItem$2,
	useActiveAnchor: () => useActiveAnchor$1,
	useActiveAnchors: () => useActiveAnchors$1,
	useItems: () => useItems$1,
	useTOC: () => useTOC,
	useTOCListener: () => useTOCListener,
	useTOCSelector: () => useTOCSelector
});
function mergeRefs(...refs) {
	return (value) => {
		refs.forEach((ref) => {
			if (typeof ref === "function") ref(value);
			else if (ref != null) ref.current = value;
		});
	};
}
var ObserverContext = (0, import_react.createContext)(null);
var ScrollContext = (0, import_react.createContext)(null);
/** Optional: add auto-scroll to TOC items. */
function ScrollProvider({ containerRef, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollContext, {
		value: containerRef,
		children
	});
}
function AnchorProvider({ toc, single = false, children }) {
	const observer = (0, import_react.useMemo)(() => new Observer(), []);
	observer.single = single;
	(0, import_react.useEffect)(() => {
		observer.setItems(toc);
	}, [observer, toc]);
	(0, import_react.useEffect)(() => {
		observer.watch({ threshold: .9 });
		return () => observer.unwatch();
	}, [observer]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObserverContext, {
		value: observer,
		children
	});
}
function TOCItem$2({ ref, onActiveChange = () => null, autoScroll = true, ...props }) {
	const id = props.href ? getItemId(props.href) : null;
	const containerRef = (0, import_react.use)(ScrollContext);
	const anchorRef = (0, import_react.useRef)(null);
	const isInitialRef = (0, import_react.useRef)(true);
	const observer = useObserver();
	const [active, setActive] = (0, import_react.useState)(() => observer.items.some((item) => item.id === id && item.active));
	const onUpdate = (0, import_react.useEffectEvent)((items, initial) => {
		const itemData = id ? items.find((item) => item.id === id) : null;
		if (!itemData) return;
		if (itemData.active !== active) {
			setActive(itemData.active);
			onActiveChange(itemData.active);
		}
		const anchor = anchorRef.current;
		const container = containerRef?.current;
		if (!autoScroll || !anchor || !container) return;
		let lastActive;
		for (const item of items) {
			if (!item.active) continue;
			if (!lastActive || lastActive.t < item.t) lastActive = item;
		}
		if (lastActive?.id === id) e(anchor, {
			behavior: initial ? "instant" : "smooth",
			block: "center",
			inline: "center",
			scrollMode: "always",
			boundary: container
		});
	});
	(0, import_react.useEffect)(() => {
		if (autoScroll) onUpdate(observer.items, isInitialRef.current);
		isInitialRef.current = false;
	}, [observer, autoScroll]);
	(0, import_react.useEffect)(() => {
		const listener = (items) => onUpdate(items, false);
		observer.listen(listener);
		return () => observer.unlisten(listener);
	}, [observer]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		ref: mergeRefs(anchorRef, ref),
		"data-active": active,
		...props
	});
}
function useObserver() {
	const observer = (0, import_react.use)(ObserverContext);
	if (!observer) throw new Error(`Component must be used under the <AnchorProvider /> component.`);
	return observer;
}
/** @returns static info object, useful for custom rendering logic */
function useTOC() {
	const observer = useObserver();
	return (0, import_react.useMemo)(() => ({
		get() {
			return observer.items;
		},
		listen: observer.listen.bind(observer),
		unlisten: observer.unlisten.bind(observer)
	}), [observer]);
}
function useTOCListener(listener) {
	const observer = useObserver();
	const callback = (0, import_react.useEffectEvent)(listener);
	(0, import_react.useEffect)(() => {
		observer.listen(callback);
		return () => observer.unlisten(callback);
	}, [observer]);
}
function useTOCSelector(select, isEqual = isEqualShallow) {
	const observer = useObserver();
	const [value, setValue] = (0, import_react.useState)(() => select(observer.items));
	useTOCListener((items) => {
		const next = select(items);
		if (!isEqual(value, next)) setValue(next);
	});
	return value;
}
/**
* The estimated active heading ID
*/
function useActiveAnchor$1() {
	return useTOCSelector((items) => {
		let out;
		for (const item of items) {
			if (!item.active) continue;
			if (!out || item.t > out.t) out = item;
		}
		return out?.id;
	});
}
/**
* The id of visible anchors
*/
function useActiveAnchors$1() {
	return useTOCSelector((items) => {
		const out = [];
		for (const item of items) if (item.active) out.push(item.id);
		return out;
	});
}
function useItems$1() {
	return useTOCSelector((items) => items);
}
function getItemId(url) {
	if (url.startsWith("#")) return url.slice(1);
	return null;
}
var Observer = class {
	constructor() {
		this.items = [];
		this.single = false;
		this.observer = null;
		this.listeners = /* @__PURE__ */ new Set();
	}
	listen(listener) {
		this.listeners.add(listener);
	}
	unlisten(listener) {
		this.listeners.delete(listener);
	}
	setItems(newItems) {
		const observer = this.observer;
		if (observer) for (const item of this.items) {
			const element = document.getElementById(item.id);
			if (!element) continue;
			observer.unobserve(element);
		}
		const next = [];
		for (const item of newItems) {
			const id = getItemId(item.url);
			if (!id) continue;
			next.push({
				id,
				active: false,
				fallback: false,
				t: 0,
				original: item
			});
		}
		this.update(next);
		this.observeItems();
	}
	watch(options) {
		if (this.observer) return;
		this.observer = new IntersectionObserver(this.callback.bind(this), options);
		this.observeItems();
	}
	unwatch() {
		this.observer?.disconnect();
		this.observer = null;
	}
	callback(entries) {
		if (entries.length === 0) return;
		let hasActive = false;
		const updated = this.items.map((item) => {
			const entry = entries.find((entry) => entry.target.id === item.id);
			let active = entry ? entry.isIntersecting : item.active && !item.fallback;
			if (this.single && hasActive) active = false;
			if (item.active !== active) item = {
				...item,
				t: Date.now(),
				active,
				fallback: false
			};
			if (active) hasActive = true;
			return item;
		});
		if (!hasActive && entries[0].rootBounds) {
			const viewTop = entries[0].rootBounds.top;
			let min = Number.MAX_VALUE;
			let fallbackIdx = -1;
			for (let i = 0; i < updated.length; i++) {
				const element = document.getElementById(updated[i].id);
				if (!element) continue;
				const d = Math.abs(viewTop - element.getBoundingClientRect().top);
				if (d < min) {
					fallbackIdx = i;
					min = d;
				}
			}
			if (fallbackIdx !== -1) updated[fallbackIdx] = {
				...updated[fallbackIdx],
				active: true,
				fallback: true,
				t: Date.now()
			};
		}
		this.update(updated);
	}
	observeItems() {
		if (!this.observer) return;
		for (const item of this.items) {
			const element = document.getElementById(item.id);
			if (!element) continue;
			this.observer.observe(element);
		}
	}
	update(next) {
		this.items = next;
		for (const listener of this.listeners) listener(next);
	}
};
//#endregion
//#region node_modules/fumadocs-ui/dist/components/toc/index.js
var TOCContext = (0, import_react.createContext)([]);
function useTOCItems() {
	return (0, import_react.use)(TOCContext);
}
var { useActiveAnchor, useActiveAnchors, useItems } = toc_exports;
function TOCProvider({ toc, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TOCContext, {
		value: toc,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnchorProvider, {
			toc,
			...props,
			children
		})
	});
}
function TOCScrollArea({ ref, className, ...props }) {
	const viewRef = (0, import_react.useRef)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: mergeRefs$1(viewRef, ref),
		className: cn("relative min-h-0 text-sm overflow-x-clip overflow-y-auto overscroll-contain [scrollbar-width:none] mask-[linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] py-3", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollProvider, {
			containerRef: viewRef,
			children: props.children
		})
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/components/toc/default.js
var default_exports = /* @__PURE__ */ __exportAll({
	TOCEmpty: () => TOCEmpty$1,
	TOCItem: () => TOCItem$1,
	TOCItems: () => TOCItems$1
});
function TOCItems$1({ ref, className, thumbBox = true, children, ...props }) {
	const containerRef = (0, import_react.useRef)(null);
	const items = useTOCItems();
	const [svg, setSvg] = (0, import_react.useState)(null);
	const onPrint = (0, import_react.useCallback)(() => {
		const container = containerRef.current;
		if (!container || container.clientHeight === 0) return;
		if (items.length === 0) {
			setSvg(null);
			return;
		}
		let w = 0;
		let h = 0;
		let d = "";
		const positions = [];
		const output = [];
		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			const element = container.querySelector(`a[href="${item.url}"]`);
			if (!element) continue;
			const styles = getComputedStyle(element);
			const x = getLineOffset$1(item.depth) + .5;
			const top = element.offsetTop + parseFloat(styles.paddingTop);
			const bottom = element.offsetTop + element.clientHeight - parseFloat(styles.paddingBottom);
			w = Math.max(x + 8, w);
			h = Math.max(h, bottom);
			if (i === 0) d += ` M${x} ${top} L${x} ${bottom}`;
			else {
				const [, upperBottom, upperX] = i > 0 ? positions[i - 1] : [
					0,
					0,
					0
				];
				d += ` C ${upperX} ${top - 4} ${x} ${upperBottom + 4} ${x} ${top} L${x} ${bottom}`;
			}
			if (item._step !== void 0) output.push(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				transform: `translate(${x}, ${(top + bottom) / 2})`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "0",
					cy: "0",
					r: "8",
					className: "fill-fd-primary"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					cx: "0",
					cy: "0",
					textAnchor: "middle",
					alignmentBaseline: "central",
					dominantBaseline: "middle",
					className: "fill-fd-primary-foreground font-medium text-xs leading-none font-mono rtl:-scale-x-100",
					children: item._step
				})]
			}, i));
			positions.push([
				top,
				bottom,
				x
			]);
		}
		output.unshift(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d,
			className: "stroke-fd-primary",
			strokeWidth: "1",
			fill: "none"
		}, "path"));
		const itemLineLengths = [];
		if (thumbBox) {
			const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path.setAttribute("d", d);
			const n = path.getTotalLength();
			for (let i = 0; i < positions.length; i++) {
				const [top, bottom] = positions[i];
				let l = i > 0 ? itemLineLengths[i - 1][1] + (top - positions[i - 1][1]) : top;
				while (l < n && path.getPointAtLength(l).y < top) l++;
				itemLineLengths.push([l, l + bottom - top]);
			}
		}
		setSvg({
			content: output,
			width: w,
			height: h,
			d,
			itemLineLengths,
			positions
		});
	}, [items, thumbBox]);
	(0, import_react.useEffect)(() => {
		const container = containerRef.current;
		if (!container) return;
		const observer = new ResizeObserver(onPrint);
		observer.observe(container);
		onPrint();
		return () => {
			observer.unobserve(container);
		};
	}, [onPrint]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: mergeRefs$1(containerRef, ref),
		className: cn("relative flex flex-col", className),
		...props,
		children: [svg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbTrack$1, {
			computed: svg,
			thumbBox
		}), children]
	});
}
function TOCEmpty$1() {
	const t = useTranslations({ note: "table of contents" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-lg border bg-fd-card p-3 text-xs text-fd-muted-foreground",
		children: t("No Headings")
	});
}
function ThumbTrack$1({ computed, thumbBox }) {
	const ref = (0, import_react.useRef)(null);
	const previousRef = (0, import_react.useRef)(null);
	const tocInfo = useTOC();
	function calculate(items) {
		const out = {};
		const startIdx = items.findIndex((item) => item.active);
		if (startIdx === -1) return out;
		const endIdx = items.findLastIndex((item) => item.active);
		out["--track-top"] = `${computed.positions[startIdx][0]}px`;
		out["--track-bottom"] = `${computed.positions[endIdx][1]}px`;
		if (thumbBox) {
			let isUp = false;
			if (previousRef.current) {
				const prev = previousRef.current;
				isUp = prev.startIdx > startIdx || prev.endIdx > endIdx || prev.startIdx === startIdx && prev.endIdx === endIdx && prev.isUp;
			}
			previousRef.current = {
				startIdx,
				endIdx,
				isUp
			};
			out["--offset-distance"] = isUp ? `${computed.itemLineLengths[startIdx][0]}px` : `${computed.itemLineLengths[endIdx][1]}px`;
			out["--opacity"] = items[isUp ? startIdx : endIdx].original._step !== void 0 ? "0" : "1";
		}
		return out;
	}
	useTOCListener((items) => {
		const element = ref.current;
		if (!element) return;
		for (const [k, v] of Object.entries(calculate(items))) element.style.setProperty(k, v);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		className: "absolute top-0 inset-s-0 origin-center rtl:-scale-x-100",
		style: {
			width: computed.width,
			height: computed.height,
			...calculate(tocInfo.get())
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			xmlns: "http://www.w3.org/2000/svg",
			viewBox: `0 0 ${computed.width} ${computed.height}`,
			className: "absolute transition-[clip-path]",
			style: {
				width: computed.width,
				height: computed.height,
				clipPath: `polygon(0 var(--track-top,0), 100% var(--track-top,0), 100% var(--track-bottom,0), 0 var(--track-bottom,0))`
			},
			children: computed.content
		}), thumbBox && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute left-0 size-1 bg-fd-primary rounded-full [offset-distance:var(--offset-distance,0)] opacity-(--opacity,0) transition-[opacity,offset-distance]",
			style: { offsetPath: `path("${computed.d}")` }
		})]
	});
}
var BASE$1 = 8;
function getItemOffset$1(depth) {
	if (depth <= 2) return 20;
	if (depth === 3) return 32;
	return 44;
}
function getLineOffset$1(depth) {
	if (depth <= 2) return BASE$1;
	if (depth === 3) return 16;
	return 24;
}
function TOCItem$1({ item, ...props }) {
	const items = useTOCItems();
	const { isFirst, isLast, svg } = (0, import_react.useMemo)(() => {
		const index = items.indexOf(item);
		const isFirst = index === 0;
		const isLast = index === items.length - 1;
		const l1 = getLineOffset$1(item.depth);
		const l0 = isFirst ? l1 : getLineOffset$1(items[index - 1].depth);
		const l2 = isLast ? l1 : getLineOffset$1(items[index + 1].depth);
		return {
			isFirst,
			isLast,
			svg: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				xmlns: "http://www.w3.org/2000/svg",
				className: cn("absolute -top-1.5 inset-s-0 bottom-0 h-[calc(100%+--spacing(1.5))] -z-1 rtl:-scale-x-100", l1 !== l2 && "h-full bottom-1.5"),
				style: { width: Math.max(l0, l1) + 9 },
				children: [
					l0 !== l1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: `M ${l0 + .5} 0 C ${l0 + .5} 8 ${l1 + .5} 4 ${l1 + .5} 12`,
						stroke: "black",
						strokeWidth: "1",
						fill: "none",
						className: "stroke-fd-foreground/10"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: l1 + .5,
						y1: l0 === l1 ? "6" : "12",
						x2: l1 + .5,
						y2: "100%",
						strokeWidth: "1",
						className: "stroke-fd-foreground/10"
					}),
					item._step !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						transform: `translate(${l1 + .5}, ${l1 === l2 ? "3" : "6"})`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "0",
							cy: "50%",
							r: "8",
							className: "fill-fd-muted"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
							x: "0",
							y: "50%",
							textAnchor: "middle",
							alignmentBaseline: "central",
							dominantBaseline: "middle",
							className: "fill-fd-muted-foreground font-medium text-xs leading-none font-mono rtl:-scale-x-100",
							children: item._step
						})]
					})
				]
			})
		};
	}, [items, item]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TOCItem$2, {
		href: item.url,
		...props,
		className: cn("prose relative py-1.5 text-sm scroll-m-4 text-fd-muted-foreground hover:text-fd-accent-foreground transition-colors wrap-anywhere data-[active=true]:text-fd-primary", isFirst && "pt-0", isLast && "pb-0", props.className),
		style: {
			paddingInlineStart: getItemOffset$1(item.depth),
			...props.style
		},
		children: [svg, item.title]
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/components/toc/clerk.js
var clerk_exports = /* @__PURE__ */ __exportAll({
	TOCEmpty: () => TOCEmpty,
	TOCItem: () => TOCItem,
	TOCItems: () => TOCItems
});
function TOCItems({ ref, className, children, ...props }) {
	const containerRef = (0, import_react.useRef)(null);
	const items = useTOCItems();
	const [svg, setSvg] = (0, import_react.useState)(null);
	const onPrint = (0, import_react.useCallback)(() => {
		const container = containerRef.current;
		if (!container || container.clientHeight === 0) return;
		if (items.length === 0) {
			setSvg(null);
			return;
		}
		let w = 0;
		let h = 0;
		let d = "";
		const positions = [];
		const output = [];
		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			const element = container.querySelector(`a[href="${item.url}"]`);
			if (!element) continue;
			const styles = getComputedStyle(element);
			const x = getLineOffset(item.depth) + .5;
			const top = element.offsetTop + parseFloat(styles.paddingTop);
			const bottom = element.offsetTop + element.clientHeight - parseFloat(styles.paddingBottom);
			w = Math.max(x + 8, w);
			h = Math.max(h, bottom);
			if (i === 0) d += ` M${x} ${top} L${x} ${bottom}`;
			else {
				const [, upperBottom, upperX] = i > 0 ? positions[i - 1] : [
					0,
					0,
					0
				];
				d += ` L ${upperX} ${upperBottom} ${x} ${top} L${x} ${bottom}`;
			}
			if (item._step !== void 0) output.push(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				transform: `translate(${x}, ${(top + bottom) / 2})`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "0",
					cy: "0",
					r: "8",
					className: "fill-fd-primary"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					cx: "0",
					cy: "0",
					textAnchor: "middle",
					alignmentBaseline: "central",
					dominantBaseline: "middle",
					className: "fill-fd-primary-foreground font-medium text-xs leading-none font-mono rtl:-scale-x-100",
					children: item._step
				})]
			}, i));
			positions.push([
				top,
				bottom,
				x
			]);
		}
		output.unshift(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d,
			className: "stroke-fd-primary",
			strokeWidth: "1",
			fill: "none"
		}, "path"));
		setSvg({
			content: output,
			width: w,
			height: h,
			d,
			itemLineLengths: [],
			positions
		});
	}, [items]);
	(0, import_react.useEffect)(() => {
		const container = containerRef.current;
		if (!container) return;
		const observer = new ResizeObserver(onPrint);
		observer.observe(container);
		onPrint();
		return () => {
			observer.unobserve(container);
		};
	}, [onPrint]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: mergeRefs$1(containerRef, ref),
		className: cn("relative flex flex-col", className),
		...props,
		children: [svg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbTrack, { computed: svg }), children]
	});
}
function TOCEmpty() {
	const t = useTranslations({ note: "table of contents" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-lg border bg-fd-card p-3 text-xs text-fd-muted-foreground",
		children: t("No Headings")
	});
}
function ThumbTrack({ computed }) {
	const ref = (0, import_react.useRef)(null);
	const tocInfo = useTOC();
	function calculate(items) {
		const out = {};
		const startIdx = items.findIndex((item) => item.active);
		if (startIdx === -1) return out;
		const endIdx = items.findLastIndex((item) => item.active);
		out["--track-top"] = `${computed.positions[startIdx][0]}px`;
		out["--track-bottom"] = `${computed.positions[endIdx][1]}px`;
		return out;
	}
	useTOCListener((items) => {
		const element = ref.current;
		if (!element) return;
		for (const [k, v] of Object.entries(calculate(items))) element.style.setProperty(k, v);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		className: "absolute top-0 inset-s-0 origin-center rtl:-scale-x-100",
		style: {
			width: computed.width,
			height: computed.height,
			...calculate(tocInfo.get())
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			xmlns: "http://www.w3.org/2000/svg",
			viewBox: `0 0 ${computed.width} ${computed.height}`,
			className: "absolute transition-[clip-path]",
			style: {
				width: computed.width,
				height: computed.height,
				clipPath: `polygon(0 var(--track-top,0), 100% var(--track-top,0), 100% var(--track-bottom,0), 0 var(--track-bottom,0))`
			},
			children: computed.content
		})
	});
}
var BASE = 8;
function getItemOffset(depth) {
	if (depth <= 2) return 20;
	if (depth === 3) return 32;
	return 44;
}
function getLineOffset(depth) {
	if (depth <= 2) return BASE;
	if (depth === 3) return 20;
	return 32;
}
function TOCItem({ item, ...props }) {
	const items = useTOCItems();
	const { isFirst, isLast, svg } = (0, import_react.useMemo)(() => {
		const index = items.indexOf(item);
		const isFirst = index === 0;
		const isLast = index === items.length - 1;
		const l1 = getLineOffset(item.depth);
		const l0 = isFirst ? l1 : getLineOffset(items[index - 1].depth);
		const l2 = isLast ? l1 : getLineOffset(items[index + 1].depth);
		return {
			isFirst,
			isLast,
			svg: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				xmlns: "http://www.w3.org/2000/svg",
				className: cn("absolute -top-1.5 inset-s-0 bottom-0 h-[calc(100%+--spacing(1.5))] -z-1 rtl:-scale-x-100", l1 !== l2 && "h-full bottom-1.5"),
				style: { width: Math.max(l0, l1) + 9 },
				children: [
					l0 !== l1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: `M ${l0 + .5} 0 L ${l0 + .5} 0 ${l1 + .5} 12`,
						stroke: "black",
						strokeWidth: "1",
						fill: "none",
						className: "stroke-fd-foreground/10"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: l1 + .5,
						y1: l0 === l1 ? "6" : "12",
						x2: l1 + .5,
						y2: "100%",
						strokeWidth: "1",
						className: "stroke-fd-foreground/10"
					}),
					item._step !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						transform: `translate(${l1 + .5}, ${l1 === l2 ? "3" : "6"})`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "0",
							cy: "50%",
							r: "8",
							className: "fill-fd-muted"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
							x: "0",
							y: "50%",
							textAnchor: "middle",
							alignmentBaseline: "central",
							dominantBaseline: "middle",
							className: "fill-fd-muted-foreground font-medium text-xs leading-none font-mono rtl:-scale-x-100",
							children: item._step
						})]
					})
				]
			})
		};
	}, [items, item]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TOCItem$2, {
		href: item.url,
		...props,
		className: cn("prose relative py-1.5 text-sm scroll-m-4 text-fd-muted-foreground hover:text-fd-accent-foreground transition-colors wrap-anywhere data-[active=true]:text-fd-primary", isFirst && "pt-0", isLast && "pb-0", props.className),
		style: {
			paddingInlineStart: getItemOffset(item.depth),
			...props.style
		},
		children: [svg, item.title]
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/utils/use-footer-items.js
var footerCache = /* @__PURE__ */ new WeakMap();
/**
* @returns a list of page tree items (linear), that you can obtain footer items
*/
function useFooterItems() {
	const { root } = useTreeContext();
	const cached = footerCache.get(root);
	if (cached) return cached;
	const list = [];
	function onNode(node) {
		if (node.type === "folder") {
			if (node.index) onNode(node.index);
			for (const child of node.children) onNode(child);
		} else if (node.type === "page" && !node.external) list.push(node);
	}
	for (const child of root.children) onNode(child);
	footerCache.set(root, list);
	return list;
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/shared/page-actions.js
var cache = /* @__PURE__ */ new Map();
/**
* see https://fumadocs.dev/docs/integrations/llms#page-actions to customize.
*/
function MarkdownCopyButton({ markdownUrl, ...props }) {
	const t = useTranslations({ note: "page actions" });
	const [isLoading, setLoading] = (0, import_react.useState)(false);
	const [checked, onClick] = useCopyButton(async () => {
		const cached = cache.get(markdownUrl);
		if (cached) return navigator.clipboard.writeText(await cached);
		setLoading(true);
		try {
			const promise = fetch(withBasePath(markdownUrl)).then((res) => res.text());
			cache.set(markdownUrl, promise);
			await navigator.clipboard.write([new ClipboardItem({ "text/plain": promise })]);
		} finally {
			setLoading(false);
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		disabled: isLoading,
		onClick,
		...props,
		className: cn(buttonVariants({
			color: "secondary",
			size: "sm",
			className: "gap-2 [&_svg]:size-3.5 [&_svg]:text-fd-muted-foreground"
		}), props.className),
		children: [checked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {}), props.children ?? t("Copy Markdown")]
	});
}
/**
* see https://fumadocs.dev/docs/integrations/llms#page-actions to customize.
*/
function ViewOptionsPopover({ markdownUrl, githubUrl, ...props }) {
	const pathname = usePathname();
	const t = useTranslations({ note: "page actions" });
	const items = (0, import_react.useMemo)(() => {
		const pageUrl = typeof window === "undefined" ? pathname : new URL(pathname, window.location.origin);
		const q = t("Read {url}, I want to ask questions about it.", { variables: { url: String(pageUrl) } });
		return [
			githubUrl && {
				title: t("Open in GitHub"),
				href: githubUrl,
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					fill: "currentColor",
					role: "img",
					viewBox: "0 0 24 24",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: "GitHub" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" })]
				})
			},
			markdownUrl && {
				title: t("View as Markdown"),
				href: withBasePath(markdownUrl),
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextAlignStart, {})
			},
			{
				title: t("Open in Scira AI"),
				href: `https://scira.ai/?${new URLSearchParams({ q })}`,
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					width: "910",
					height: "934",
					viewBox: "0 0 910 934",
					fill: "none",
					xmlns: "http://www.w3.org/2000/svg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: "Scira AI" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M647.664 197.775C569.13 189.049 525.5 145.419 516.774 66.8849C508.048 145.419 464.418 189.049 385.884 197.775C464.418 206.501 508.048 250.131 516.774 328.665C525.5 250.131 569.13 206.501 647.664 197.775Z",
							fill: "currentColor",
							stroke: "currentColor",
							strokeWidth: "8",
							strokeLinejoin: "round"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M516.774 304.217C510.299 275.491 498.208 252.087 480.335 234.214C462.462 216.341 439.058 204.251 410.333 197.775C439.059 191.3 462.462 179.209 480.335 161.336C498.208 143.463 510.299 120.06 516.774 91.334C523.25 120.059 535.34 143.463 553.213 161.336C571.086 179.209 594.49 191.3 623.216 197.775C594.49 204.251 571.086 216.341 553.213 234.214C535.34 252.087 523.25 275.491 516.774 304.217Z",
							fill: "currentColor",
							stroke: "currentColor",
							strokeWidth: "8",
							strokeLinejoin: "round"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M857.5 508.116C763.259 497.644 710.903 445.288 700.432 351.047C689.961 445.288 637.605 497.644 543.364 508.116C637.605 518.587 689.961 570.943 700.432 665.184C710.903 570.943 763.259 518.587 857.5 508.116Z",
							stroke: "currentColor",
							strokeWidth: "20",
							strokeLinejoin: "round"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M700.432 615.957C691.848 589.05 678.575 566.357 660.383 548.165C642.191 529.973 619.499 516.7 592.593 508.116C619.499 499.533 642.191 486.258 660.383 468.066C678.575 449.874 691.848 427.181 700.432 400.274C709.015 427.181 722.289 449.874 740.481 468.066C758.673 486.258 781.365 499.533 808.271 508.116C781.365 516.7 758.673 529.973 740.481 548.165C722.289 566.357 709.015 589.05 700.432 615.957Z",
							stroke: "currentColor",
							strokeWidth: "20",
							strokeLinejoin: "round"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M889.949 121.237C831.049 114.692 798.326 81.9698 791.782 23.0692C785.237 81.9698 752.515 114.692 693.614 121.237C752.515 127.781 785.237 160.504 791.782 219.404C798.326 160.504 831.049 127.781 889.949 121.237Z",
							fill: "currentColor",
							stroke: "currentColor",
							strokeWidth: "8",
							strokeLinejoin: "round"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M791.782 196.795C786.697 176.937 777.869 160.567 765.16 147.858C752.452 135.15 736.082 126.322 716.226 121.237C736.082 116.152 752.452 107.324 765.16 94.6152C777.869 81.9065 786.697 65.5368 791.782 45.6797C796.867 65.5367 805.695 81.9066 818.403 94.6152C831.112 107.324 847.481 116.152 867.338 121.237C847.481 126.322 831.112 135.15 818.403 147.858C805.694 160.567 796.867 176.937 791.782 196.795Z",
							fill: "currentColor",
							stroke: "currentColor",
							strokeWidth: "8",
							strokeLinejoin: "round"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M760.632 764.337C720.719 814.616 669.835 855.1 611.872 882.692C553.91 910.285 490.404 924.255 426.213 923.533C362.022 922.812 298.846 907.419 241.518 878.531C184.19 849.643 134.228 808.026 95.4548 756.863C56.6815 705.7 30.1238 646.346 17.8129 583.343C5.50207 520.339 7.76433 455.354 24.4266 393.359C41.089 331.364 71.7099 274.001 113.947 225.658C156.184 177.315 208.919 139.273 268.117 114.442",
							stroke: "currentColor",
							strokeWidth: "30",
							strokeLinecap: "round",
							strokeLinejoin: "round"
						})
					]
				})
			},
			{
				title: t("Open in ChatGPT"),
				href: `https://chatgpt.com/?${new URLSearchParams({
					prompt: q,
					hints: "search"
				})}`,
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					role: "img",
					viewBox: "0 0 24 24",
					fill: "currentColor",
					xmlns: "http://www.w3.org/2000/svg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: "OpenAI" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" })]
				})
			},
			{
				title: t("Open in Claude"),
				href: `https://claude.ai/new?${new URLSearchParams({ q })}`,
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					fill: "currentColor",
					role: "img",
					viewBox: "0 0 24 24",
					xmlns: "http://www.w3.org/2000/svg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: "Anthropic" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z" })]
				})
			},
			{
				title: t("Open in Cursor"),
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					fill: "currentColor",
					role: "img",
					viewBox: "0 0 24 24",
					xmlns: "http://www.w3.org/2000/svg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: "Cursor" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23" })]
				}),
				href: `https://cursor.com/link/prompt?${new URLSearchParams({ text: q })}`
			}
		].filter((v) => !!v);
	}, [
		githubUrl,
		markdownUrl,
		pathname,
		t
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverTrigger, {
		...props,
		className: (state) => cn(buttonVariants({
			color: "secondary",
			size: "sm"
		}), "gap-2 data-[popup-open]:bg-fd-accent data-[popup-open]:text-fd-accent-foreground", typeof props.className === "function" ? props.className(state) : props.className),
		children: [props.children ?? t("Open"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3.5 text-fd-muted-foreground" })]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
		className: "flex flex-col",
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
			href: item.href,
			rel: "noreferrer noopener",
			target: "_blank",
			className: "text-sm p-2 rounded-lg inline-flex items-center gap-2 hover:text-fd-accent-foreground hover:bg-fd-accent [&_svg]:size-4",
			children: [
				item.icon,
				item.title,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "text-fd-muted-foreground size-3.5 ms-auto" })
			]
		}, item.href))
	})] });
}
function withBasePath(href) {
	if (href.match(/^\w+:/) || href.startsWith("//")) return href;
	return "/".replace(/\/$/, "") + href;
}
//#endregion
export { useFolder as A, SidebarFolderTrigger as C, SidebarTrigger as D, SidebarSeparator as E, useIsScrollTop as M, TextAlignStart as N, SidebarViewport as O, ChevronLeft as P, SidebarFolderLink as S, SidebarProvider as T, SidebarContent as _, TOCItem$1 as a, SidebarFolder as b, TOCProvider as c, useTOCItems as d, TOCItem$2 as f, SidebarCollapseTrigger as g, createPageTreeRenderer as h, clerk_exports as i, useFolderDepth as j, base_exports as k, TOCScrollArea as l, createLinkItemRenderer as m, ViewOptionsPopover as n, TOCItems$1 as o, SidebarTabsDropdown as p, useFooterItems as r, default_exports as s, MarkdownCopyButton as t, useItems as u, SidebarDrawerContent as v, SidebarItem as w, SidebarFolderContent as x, SidebarDrawerOverlay as y };
