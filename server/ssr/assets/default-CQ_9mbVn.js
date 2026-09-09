import { i as __toESM } from "./rolldown-runtime-B4iAMlE-.js";
import { t as require_jsx_runtime } from "./jsx-runtime-BqLYtsoi.js";
import { t as cn } from "./dist-UQZjX_nd.js";
import { t as buttonVariants } from "./button-Cpca6tPg.js";
import { l as MessageCircle } from "./heading-DwO5t_zs.js";
import { n as AISearchPanel, r as AISearchTrigger, t as AISearch } from "./search-Dy3peVZx.js";
import { c as useTranslations } from "./framework-BVFfi5Qn.js";
//#region node_modules/@fumapress/ai/dist/components/default.mjs
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime(), 1);
function DefaultComponent() {
	const t = useTranslations({ note: "AI chat trigger" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AISearch, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AISearchPanel, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AISearchTrigger, {
		position: "float",
		className: cn(buttonVariants({
			variant: "secondary",
			className: "text-fd-muted-foreground rounded-2xl"
		})),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4.5" }), t("Ask AI")]
	})] });
}
//#endregion
//#region \0virtual:vite-rsc/client-references/group/facade:node_modules/@fumapress/ai/dist/components/default.mjs
var export_62ec5df3f7b4 = { DefaultComponent };
//#endregion
export { export_62ec5df3f7b4 };
