import { i as __toESM } from "./rolldown-runtime-B4iAMlE-.js";
import { t as require_jsx_runtime } from "./jsx-runtime-BqLYtsoi.js";
import { t as require_react } from "./react-SLAb4Nsi.js";
import { n as cva, r as cn, t as buttonVariants } from "./button-Cpca6tPg.js";
import { t as mergeRefs } from "./merge-refs-BfwMulAo.js";
import { a as useTabsGroups, c as getBreadcrumbItemsFromPath, f as ChevronDown, i as TreeContextProvider, l as PanelLeft, o as useTreeContext, s as useTreePath, u as Languages } from "./scroll-area-DW5uZXgq.js";
import { c as SearchTrigger, i as isLayoutTabActive, n as baseSlots, o as useLinkItems, s as isActive, t as LinkItem } from "./client-BU1Fmnr9.js";
import { A as useFolder, C as SidebarFolderTrigger$1, D as SidebarTrigger$1, E as SidebarSeparator$1, M as useIsScrollTop, N as TextAlignStart, O as SidebarViewport, P as ChevronLeft, S as SidebarFolderLink$1, T as SidebarProvider$1, _ as SidebarContent$1, b as SidebarFolder$1, c as TOCProvider$1, d as useTOCItems, g as SidebarCollapseTrigger$1, h as createPageTreeRenderer, i as clerk_exports, j as useFolderDepth, k as base_exports, l as TOCScrollArea, m as createLinkItemRenderer, n as ViewOptionsPopover, p as SidebarTabsDropdown, r as useFooterItems, s as default_exports, t as MarkdownCopyButton, u as useItems, v as SidebarDrawerContent, w as SidebarItem$1, x as SidebarFolderContent$1, y as SidebarDrawerOverlay } from "./page-actions-CCMmsScm.js";
import { n as ChevronRight } from "./dist-D3b8pzgn.js";
import { c as useTranslations, i as usePathname } from "./framework-BVFfi5Qn.js";
import { t as Link } from "./link-BUqPnhxi.js";
import { n as CollapsibleContent, r as CollapsibleTrigger, t as Collapsible } from "./collapsible-BTQIwl1c.js";
//#region node_modules/fumadocs-ui/dist/layouts/docs/slots/sidebar.js
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime(), 1);
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var itemVariants = cva("relative flex flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground wrap-anywhere [&_svg]:size-4 [&_svg]:shrink-0", { variants: {
	variant: {
		link: "transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary data-[active=true]:hover:transition-colors",
		button: "transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none"
	},
	highlight: { true: "data-[active=true]:before:content-[''] data-[active=true]:before:bg-fd-primary data-[active=true]:before:absolute data-[active=true]:before:w-px data-[active=true]:before:inset-y-2.5 data-[active=true]:before:inset-s-2.5" }
} });
var { useSidebar } = base_exports;
function SidebarProvider(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarProvider$1, { ...props });
}
function Sidebar({ footer, banner, collapsible = true, components, ...rest }) {
	const { menuItems, slots, props: { tabs, nav, tabMode } } = useDocsLayout();
	const iconLinks = menuItems.filter((item) => item.type === "icon");
	const viewport = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarViewport, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-0.5",
		children: [menuItems.filter((v) => v.type !== "icon").map((item, i, list) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarLinkItem, {
			item,
			className: cn(i === list.length - 1 && "mb-4")
		}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarPageTree, { ...components })]
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarContent, {
		...rest,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 p-4 pb-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex",
						children: [
							slots.navTitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.navTitle, { className: "inline-flex text-[0.9375rem] items-center gap-2.5 font-medium me-auto" }),
							nav?.children,
							collapsible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarCollapseTrigger, {
								className: cn(buttonVariants({
									color: "ghost",
									size: "icon-sm",
									className: "mb-auto text-fd-muted-foreground"
								})),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, {})
							})
						]
					}),
					slots.searchTrigger && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.searchTrigger.full, { hideIfDisabled: true }),
					tabs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarTabsDropdown, { options: tabMode === "auto" ? tabs : tabs.filter((tab) => typeof tab.$folder?.root === "string") }),
					banner
				]
			}),
			viewport,
			(slots.languageSelect || iconLinks.length > 0 || slots.themeSwitch || footer) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col p-4 pt-2",
				children: [
					slots.languageSelect && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(slots.languageSelect.root, {
						variant: "secondary",
						className: "text-fd-muted-foreground text-start justify-start bg-fd-secondary/50 mb-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Languages, { className: "size-4.5" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.languageSelect.text, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "ms-auto size-3.5" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex text-fd-muted-foreground items-center border bg-fd-secondary/50 p-0.5 pe-0 rounded-lg empty:hidden",
						children: [iconLinks.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkItem, {
							item,
							className: cn(buttonVariants({
								size: "icon-sm",
								color: "ghost"
							})),
							"aria-label": item.label,
							children: item.icon
						}, i)), slots.themeSwitch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.themeSwitch, { className: "px-1 py-0 border-y-0 border-e-0 rounded-none ms-auto *:rounded-md" })]
					}),
					footer
				]
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarDrawer, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 p-4 pb-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex text-fd-muted-foreground items-center gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-1",
							children: iconLinks.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkItem, {
								item,
								className: cn(buttonVariants({
									size: "icon-sm",
									color: "ghost",
									className: "p-2"
								})),
								"aria-label": item.label,
								children: item.icon
							}, i))
						}),
						slots.languageSelect && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(slots.languageSelect.root, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Languages, { className: "size-4.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.languageSelect.text, {})] }),
						slots.themeSwitch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.themeSwitch, { className: "p-0" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarTrigger, {
							className: cn(buttonVariants({
								color: "ghost",
								size: "icon-sm",
								className: "p-2"
							})),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, {})
						})
					]
				}),
				tabs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarTabsDropdown, { options: tabs }),
				banner
			]
		}),
		viewport,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col border-t p-4 pt-2 empty:hidden",
			children: footer
		})
	] })] });
}
function SidebarFolder(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarFolder$1, { ...props });
}
function SidebarCollapseTrigger(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarCollapseTrigger$1, { ...props });
}
function SidebarTrigger(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarTrigger$1, { ...props });
}
function SidebarContent({ ref: refProp, className, children, ...props }) {
	const ref = (0, import_react.useRef)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarContent$1, { children: ({ collapsed, hovered, ref: asideRef, ...rest }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-sidebar-placeholder": "",
		className: "sticky top-(--fd-docs-row-1) z-20 [grid-area:sidebar] pointer-events-none *:pointer-events-auto h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] md:layout:[--fd-sidebar-width:268px] max-md:hidden",
		children: [collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-s-0 inset-y-0 w-4",
			...rest
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
			id: "nd-sidebar",
			ref: mergeRefs(ref, refProp, asideRef),
			"data-collapsed": collapsed,
			"data-hovered": collapsed && hovered,
			className: cn("absolute flex flex-col w-full inset-s-0 inset-y-0 items-end bg-fd-card text-sm border-e duration-250 *:w-(--fd-sidebar-width)", collapsed && ["inset-y-2 rounded-xl transition-transform border w-(--fd-sidebar-width)", hovered ? "shadow-lg translate-x-2 rtl:-translate-x-2" : "-translate-x-(--fd-sidebar-width) rtl:translate-x-full"], ref.current && ref.current.getAttribute("data-collapsed") === "true" !== collapsed && "transition-[width,inset-block,translate,background-color]", className),
			...props,
			...rest,
			children
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-sidebar-panel": "",
		className: cn("fixed flex top-[calc(--spacing(4)+var(--fd-docs-row-3))] inset-s-4 shadow-lg transition-opacity rounded-xl p-0.5 border bg-fd-muted text-fd-muted-foreground z-10", (!collapsed || hovered) && "pointer-events-none opacity-0"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarCollapseTrigger$1, {
			className: cn(buttonVariants({
				color: "ghost",
				size: "icon-sm",
				className: "rounded-lg"
			})),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, {})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchTrigger, {
			className: "rounded-lg",
			hideIfDisabled: true
		})]
	})] }) });
}
function SidebarDrawer({ children, className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarDrawerOverlay, { className: "fixed z-40 inset-0 backdrop-blur-xs data-[state=open]:animate-fd-fade-in data-[state=closed]:animate-fd-fade-out" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarDrawerContent, {
		className: cn("fixed text-[0.9375rem] flex flex-col shadow-lg border-s inset-e-0 inset-y-0 w-[85%] max-w-[380px] z-40 bg-fd-background data-[state=open]:animate-fd-sidebar-in data-[state=closed]:animate-fd-sidebar-out", className),
		...props,
		children
	})] });
}
function SidebarSeparator({ className, style, children, ...props }) {
	const depth = useFolderDepth();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarSeparator$1, {
		className: cn("inline-flex items-center gap-2 mb-1 px-2 mt-6 empty:mb-0 [&_svg]:size-4 [&_svg]:shrink-0", depth === 0 && "first:mt-0", className),
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
		className: cn(itemVariants({
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
		className: (state) => cn(itemVariants({ variant: collapsible ? "button" : null }), "w-full", typeof className === "function" ? className(state) : className),
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
		className: cn(itemVariants({
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
		className: (state) => cn("relative flex flex-col gap-0.5 pt-0.5", depth === 1 && "before:content-[''] before:absolute before:w-px before:inset-y-1 before:bg-fd-border before:inset-s-2.5", typeof className === "function" ? className(state) : className),
		...props,
		children
	});
}
function getItemOffset(depth) {
	return `calc(${2 + 3 * depth} * var(--spacing))`;
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
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/docs/slots/header.js
function Header(props) {
	const { isNavTransparent, slots, props: { nav } } = useDocsLayout();
	if (nav?.component) return nav.component;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		id: "nd-subnav",
		"data-transparent": isNavTransparent,
		...props,
		className: cn("[grid-area:header] sticky top-(--fd-docs-row-1) z-30 flex items-center ps-4 pe-2.5 border-b transition-colors backdrop-blur-sm h-(--fd-header-height) md:hidden max-md:layout:[--fd-header-height:--spacing(14)] data-[transparent=false]:bg-fd-background/80", props.className),
		children: [
			slots.navTitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.navTitle, { className: "inline-flex items-center gap-2.5 font-semibold" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1",
				children: nav?.children
			}),
			slots.searchTrigger && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.searchTrigger.sm, {
				hideIfDisabled: true,
				className: "p-2"
			}),
			slots.sidebar && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.sidebar.trigger, {
				className: cn(buttonVariants({
					color: "ghost",
					size: "icon-sm",
					className: "p-2"
				})),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, {})
			})
		]
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/docs/slots/container.js
function Container$1(props) {
	const { slots } = useDocsLayout();
	const { collapsed } = slots.sidebar?.useSidebar?.() ?? {};
	const [previousCollapsed, setPreviousCollapsed] = (0, import_react.useState)(collapsed);
	const isCollapseChanged = previousCollapsed !== collapsed;
	(0, import_react.useEffect)(() => {
		if (isCollapseChanged) setPreviousCollapsed(collapsed);
	}, [collapsed, isCollapseChanged]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		id: "nd-docs-layout",
		"data-sidebar-collapsed": collapsed,
		"data-column-changed": isCollapseChanged,
		...props,
		style: {
			gridTemplate: `"sidebar sidebar header toc toc"
"sidebar sidebar toc-popover toc toc"
"sidebar sidebar main toc toc" 1fr / minmax(min-content, 1fr) var(--fd-sidebar-col) minmax(0, calc(var(--fd-layout-width,97rem) - var(--fd-sidebar-width) - var(--fd-toc-width))) var(--fd-toc-width) minmax(min-content, 1fr)`,
			"--fd-docs-row-1": "var(--fd-banner-height, 0px)",
			"--fd-docs-row-2": "calc(var(--fd-docs-row-1) + var(--fd-header-height))",
			"--fd-docs-row-3": "calc(var(--fd-docs-row-2) + var(--fd-toc-popover-height))",
			"--fd-sidebar-col": collapsed ? "0px" : "var(--fd-sidebar-width)",
			...props.style
		},
		className: cn("grid overflow-x-clip min-h-(--fd-docs-height) [--fd-docs-height:100dvh] [--fd-header-height:0px] [--fd-toc-popover-height:0px] [--fd-sidebar-width:0px] [--fd-toc-width:0px] data-[column-changed=true]:transition-[grid-template-columns]", props.className),
		children: props.children
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/docs/client.js
var { useBaseSlots } = baseSlots({ useProps() {
	return useDocsLayout().props;
} });
var LayoutContext = (0, import_react.createContext)(null);
function useDocsLayout() {
	const context = (0, import_react.use)(LayoutContext);
	if (!context) throw new Error("Please use <DocsPage /> (`fumadocs-ui/layouts/docs/page`) under <DocsLayout /> (`fumadocs-ui/layouts/docs`).");
	return context;
}
function LayoutBody(props) {
	const { nav: { enabled: navEnabled = true, transparentMode: navTransparentMode = "none" } = {}, sidebar: { enabled: sidebarEnabled = true, defaultOpenLevel, prefetch, ...sidebarProps } = {}, slots: defaultSlots, tabs, tabMode = "auto", tree, containerProps, children } = props;
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
			useSidebar
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreeContextProvider, {
		tree,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutContext, {
			value: {
				props: {
					tabMode,
					tabs,
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
						sidebarEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(slots.sidebar.root, { ...sidebarProps }),
						tabMode === "top" && tabs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutTabs, {
							tabs,
							className: "z-10 bg-fd-background border-b px-6 pt-3 xl:px-8 max-md:hidden"
						}),
						children
					]
				})
			})
		})
	});
}
function LayoutTabs({ tabs: allTabs, ...props }) {
	const pathname = usePathname();
	const path = useTreePath();
	const group = useTabsGroups(allTabs).findLast((group) => typeof group.active?.root !== "string");
	const selected = (0, import_react.useMemo)(() => {
		return group?.options.findLast((option) => isLayoutTabActive(option, path, pathname));
	}, [
		group,
		path,
		pathname
	]);
	if (!group) return;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		...props,
		className: cn("flex flex-row items-end gap-6 overflow-auto [grid-area:main]", props.className),
		children: group.options.map((tab, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			href: tab.url,
			className: cn("inline-flex border-b-2 border-transparent transition-colors items-center pb-1.5 font-medium gap-2 text-fd-muted-foreground text-sm text-nowrap hover:text-fd-accent-foreground", tab.unlisted && selected !== tab && "hidden", selected === tab && "border-fd-primary text-fd-primary"),
			children: tab.title
		}, i))
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/docs/page/slots/toc.js
function TOCProvider(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TOCProvider$1, { ...props });
}
function TOC({ container, header, footer, style = "normal", list }) {
	const t = useTranslations({ note: "table of contents" });
	const items = useTOCItems();
	const { TOCItems, TOCEmpty, TOCItem } = style === "clerk" ? clerk_exports : default_exports;
	if (items.length === 0 && !header && !footer) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		id: "nd-toc-placeholder",
		className: "hidden xl:layout:[--fd-toc-width:268px]"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		id: "nd-toc",
		...container,
		className: cn("sticky top-(--fd-docs-row-1) h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] flex flex-col [grid-area:toc] w-(--fd-toc-width) pt-12 pe-4 pb-2 xl:layout:[--fd-toc-width:268px] max-xl:hidden", container?.className),
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
	const { isNavTransparent } = useDocsLayout();
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
			className: cn("sticky top-(--fd-docs-row-2) z-10 [grid-area:toc-popover] h-(--fd-toc-popover-height) xl:hidden max-xl:layout:[--fd-toc-popover-height:--spacing(10)]", container?.className),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				ref,
				className: cn("border-b backdrop-blur-sm transition-colors", (!isNavTransparent || open) && "bg-fd-background/80", open && "shadow-lg"),
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
		className: cn("flex w-full h-10 items-center text-sm text-fd-muted-foreground gap-2.5 px-4 py-2.5 text-start focus-visible:outline-none [&_svg]:size-4 md:px-6", className),
		"data-toc-popover-trigger": "",
		...props,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressCircle, {
				value: (items.findLastIndex((item) => item.active) + 1) / Math.max(1, items.length),
				max: 1,
				className: cn("shrink-0", open && "text-fd-primary")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "grid flex-1 *:my-auto *:row-start-1 *:col-start-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("truncate transition-[opacity,translate,color]", open && "text-fd-foreground", showItem && "opacity-0 -translate-y-full pointer-events-none"),
					children: path?.name ?? t("On this page")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("truncate transition-[opacity,translate]", !showItem && "opacity-0 translate-y-full pointer-events-none"),
					children: items[selectedIdx]?.original.title
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("shrink-0 transition-transform mx-0.5", open && "rotate-180") })
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
//#region node_modules/fumadocs-ui/dist/layouts/docs/page/slots/footer.js
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
		className: cn("@container grid gap-4", previous && next ? "grid-cols-2" : "grid-cols-1", className),
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		href: item.url,
		className: cn("flex flex-col gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground @max-lg:col-span-full", index === 1 && "text-end"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("inline-flex items-center gap-1.5 font-medium", index === 1 && "flex-row-reverse"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "-mx-1 size-4 shrink-0 rtl:rotate-180" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: item.name })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-fd-muted-foreground truncate",
			children: item.description ?? (index === 0 ? t("Previous Page") : t("Next Page"))
		})]
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/docs/page/slots/breadcrumb.js
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
		className: cn("flex items-center gap-1.5 text-sm text-fd-muted-foreground", props.className),
		children: items.map((item, i) => {
			const className = cn("truncate", i === items.length - 1 && "text-fd-primary font-medium");
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [i !== 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3.5 shrink-0" }), item.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				href: item.url,
				className: cn(className, "transition-opacity hover:opacity-80"),
				children: item.name
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className,
				children: item.name
			})] }, i);
		})
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/docs/page/slots/container.js
function Container(props) {
	const { full } = useDocsPage();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid [grid-area:main] justify-items-center",
		"data-layout-main": "",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
			id: "nd-page",
			"data-layout-content": "",
			"data-full": full,
			...props,
			className: cn("flex flex-col min-w-0 w-full max-w-[900px] px-4 py-6 gap-4 md:px-6 md:pt-8 xl:px-8 xl:pt-14", full && "max-w-[1168px]", props.className),
			children: props.children
		})
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/docs/page/index.js
var PageContext = (0, import_react.createContext)(null);
function useDocsPage() {
	const context = (0, import_react.use)(PageContext);
	if (!context) throw new Error("Please use page components under <DocsPage /> (`fumadocs-ui/layouts/docs/page`).");
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
		className: cn("prose flex-1", className),
		children
	});
}
function DocsDescription({ children, className, ...props }) {
	if (children === void 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		...props,
		className: cn("mb-8 text-lg text-fd-muted-foreground", className),
		children
	});
}
function DocsTitle({ children, className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
		...props,
		className: cn("text-[1.75em] font-semibold", className),
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
		className: cn("text-sm text-fd-muted-foreground", props.className),
		children: [
			t("Last updated on"),
			" ",
			date
		]
	});
}
//#endregion
//#region \0virtual:vite-rsc/client-references/group/facade:node_modules/fumapress/dist/layouts/docs.js
var export_c1a625c0fb46 = { LayoutBody };
var export_40036365f8f4 = {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
	MarkdownCopyButton,
	PageLastUpdate,
	ViewOptionsPopover
};
//#endregion
export { export_40036365f8f4, export_c1a625c0fb46 };
