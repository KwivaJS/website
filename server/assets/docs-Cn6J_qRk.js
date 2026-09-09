import { t as require_react_react_server } from "./react.react-server-BSR27ksj.js";
import { a as registerClientReference } from "./server-Ccqw4whX.js";
import { n as deepmerge, r as getPressContext } from "./context-B725id1P.js";
import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
import { t as renderWithInterceptors } from "./interceptors-BnjFUYp3.js";
import { t as getLayoutTabs } from "./shared-DPbL5wbz.js";
//#region node_modules/fumadocs-ui/dist/layouts/docs/client.js
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var LayoutBody = /* #__PURE__ */ registerClientReference((() => {
	throw new Error("It is not possible to invoke a client function from the server: \"LayoutBody\"");
}), "c1a625c0fb46", "LayoutBody");
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/docs/index.js
var import_react_react_server = require_react_react_server();
function DocsLayout({ tree, sidebar: { tabs: _tabs, tabMode: _tabMode, ...sidebarProps } = {}, tabs: layoutTabs = _tabs, tabMode = _tabMode, children, ...props }) {
	const tabs = (0, import_react_react_server.useMemo)(() => {
		if (Array.isArray(layoutTabs)) return layoutTabs;
		if (typeof layoutTabs === "object") return getLayoutTabs(tree, layoutTabs);
		if (layoutTabs !== false) return getLayoutTabs(tree);
		return [];
	}, [tree, layoutTabs]);
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(LayoutBody, {
		tree,
		tabs,
		tabMode,
		sidebar: sidebarProps,
		...props,
		children
	});
}
//#endregion
//#region node_modules/fumadocs-ui/dist/layouts/docs/page/index.js
/**
* Add typography styles
*/
var DocsBody = /* #__PURE__ */ registerClientReference((() => {
	throw new Error("It is not possible to invoke a client function from the server: \"DocsBody\"");
}), "40036365f8f4", "DocsBody");
var DocsDescription = /* #__PURE__ */ registerClientReference((() => {
	throw new Error("It is not possible to invoke a client function from the server: \"DocsDescription\"");
}), "40036365f8f4", "DocsDescription");
var DocsPage = /* #__PURE__ */ registerClientReference((() => {
	throw new Error("It is not possible to invoke a client function from the server: \"DocsPage\"");
}), "40036365f8f4", "DocsPage");
var DocsTitle = /* #__PURE__ */ registerClientReference((() => {
	throw new Error("It is not possible to invoke a client function from the server: \"DocsTitle\"");
}), "40036365f8f4", "DocsTitle");
var MarkdownCopyButton = /* #__PURE__ */ registerClientReference((() => {
	throw new Error("It is not possible to invoke a client function from the server: \"MarkdownCopyButton\"");
}), "40036365f8f4", "MarkdownCopyButton");
var PageLastUpdate = /* #__PURE__ */ registerClientReference((() => {
	throw new Error("It is not possible to invoke a client function from the server: \"PageLastUpdate\"");
}), "40036365f8f4", "PageLastUpdate");
var ViewOptionsPopover = /* #__PURE__ */ registerClientReference((() => {
	throw new Error("It is not possible to invoke a client function from the server: \"ViewOptionsPopover\"");
}), "40036365f8f4", "ViewOptionsPopover");
//#endregion
//#region node_modules/fumapress/dist/layouts/docs.js
function createDocsLayoutPage({ render, renderLayout, renderPage, renderBody, inherit: { layoutProps: inheritLayoutProps = true } = {} } = {}) {
	return async function Layout({ lang, page }) {
		const ctx = getPressContext();
		const { bodyInterceptors, layoutInterceptors, pageInterceptors, transformers } = ctx.data["core:docs-layout"] ?? {};
		const source = await ctx.getLoader();
		const _raw = await render?.call(ctx, page);
		const layoutProps = {
			tree: source.getPageTree(lang),
			...deepmerge(inheritLayoutProps ? await ctx.defaultLayoutProps({ lang }) : void 0, _raw?.layoutProps)
		};
		const body = _raw?.body ?? (await ctx.getPageBody(page))?.node;
		if (body == null) throw new Error("[Fumapress] Please specify the `render` option in createDocsLayoutPage()");
		let result = {
			..._raw,
			lastModified: _raw?.lastModified ?? await ctx.getPageLastModified(page),
			pageProps: {
				..._raw?.pageProps,
				toc: _raw?.pageProps?.toc ?? await ctx.getPageToc(page)
			},
			body,
			layoutProps
		};
		if (transformers) for (const r of transformers) result = await r({
			data: result,
			page
		});
		const Layout = renderWithInterceptors(ctx, {
			lang,
			page
		}, (props) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(DocsLayout, { ...props }), [...layoutInterceptors ?? [], renderLayout]);
		const Page = renderWithInterceptors(ctx, {
			lang,
			page
		}, (props) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(DocsPage, { ...props }), [...pageInterceptors ?? [], renderPage]);
		const Body = renderWithInterceptors(ctx, {
			lang,
			page
		}, (props) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(DocsBody, { ...props }), [...bodyInterceptors ?? [], renderBody]);
		return Layout({
			...result.layoutProps,
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [ctx.renderPageMeta(page), Page({
				...result.pageProps,
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(DocsTitle, { children: page.data.title }),
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(DocsDescription, {
						className: "mb-0",
						children: page.data.description
					}),
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "flex flex-row gap-2 items-center border-b pt-2 pb-6",
						children: [result.markdownUrl && /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(MarkdownCopyButton, { markdownUrl: result.markdownUrl }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ViewOptionsPopover, {
							markdownUrl: result.markdownUrl,
							githubUrl: page.absolutePath ? await ctx.getFileUrl(page.absolutePath) : void 0
						})]
					}),
					Body({ children: result.body }),
					result.lastModified && /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageLastUpdate, { date: result.lastModified })
				] })
			})] })
		});
	};
}
//#endregion
export { createDocsLayoutPage };
