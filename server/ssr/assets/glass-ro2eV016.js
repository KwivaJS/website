import { i as __toESM } from "./rolldown-runtime-B4iAMlE-.js";
import { t as require_jsx_runtime } from "./jsx-runtime-BqLYtsoi.js";
import { t as GlassLayout } from "./glass-7oYOX_Yt.js";
import { i as useAISearchContext, n as AISearchPanel, t as AISearch } from "./search-Dy3peVZx.js";
//#region node_modules/@fumapress/ai/dist/components/glass.mjs
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime(), 1);
function Layout({ children, ...props }) {
	const { open, setOpen } = useAISearchContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GlassLayout, {
		...props,
		aiChat: {
			open,
			onOpenChange: setOpen
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AISearchPanel, {}), children]
	});
}
function GlassAILayout(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AISearch, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layout, { ...props }) });
}
//#endregion
//#region \0virtual:vite-rsc/client-references/group/facade:node_modules/@fumapress/ai/dist/components/glass.mjs
var export_565c9086adf4 = { GlassAILayout };
//#endregion
export { export_565c9086adf4 };
