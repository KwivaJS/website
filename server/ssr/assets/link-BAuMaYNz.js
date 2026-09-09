import { i as __toESM } from "./rolldown-runtime-B4iAMlE-.js";
import { t as require_jsx_runtime } from "./jsx-runtime-BqLYtsoi.js";
import { i as useRouter$1, r as Link } from "./client-4Up-pvSm.js";
//#region node_modules/fumapress/dist/client.js
/** tiny wrapper of `waku` */
function useRouter() {
	return useRouter$1();
}
//#endregion
//#region node_modules/fumapress/dist/components/link.js
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime(), 1);
function Link$1({ href = "#", children, unstable_prefetchOnEnter, unstable_prefetchOnView, ...props }) {
	if (typeof global !== "undefined" && global.LINK_SSG_CONTEXT) global.LINK_SSG_CONTEXT.links.push({
		href,
		fromPathname: useRouter().path
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: href,
		unstable_prefetchOnView: unstable_prefetchOnView ? unstable_prefetchOnView === true ? {} : unstable_prefetchOnView : void 0,
		unstable_prefetchOnEnter: unstable_prefetchOnEnter ? unstable_prefetchOnEnter === true ? {} : unstable_prefetchOnEnter : void 0,
		...props,
		children
	});
}
//#endregion
export { useRouter as n, Link$1 as t };
