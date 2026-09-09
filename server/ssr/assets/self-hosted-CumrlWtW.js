import { i as __toESM } from "./rolldown-runtime-B4iAMlE-.js";
import { t as require_jsx_runtime } from "./jsx-runtime-BqLYtsoi.js";
import { t as require_react } from "./react-SLAb4Nsi.js";
import { t as resolveBaseUrl } from "./pathname-CYLPlOwU.js";
import { n as ImageProvider } from "./image-BeIQyUMe.js";
//#region node_modules/fumapress/dist/plugins/image/self-hosted.client.js
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime(), 1);
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function createProvider(config) {
	return {
		name: "self-hosted",
		defaultQuality: config.quality,
		deviceSizes: config.deviceSizes,
		sizes: [...config.imageSizes, ...config.deviceSizes].sort((a, b) => a - b),
		buildImageUrl({ src, width, quality }) {
			const params = new URLSearchParams({
				src,
				width: String(width),
				quality: String(quality)
			});
			return `${resolveBaseUrl("/", config.path)}?${params.toString()}`;
		},
		validate(src) {},
		canOptimize(src) {
			if (src.split("?", 1)[0].endsWith(".svg")) return false;
			return true;
		}
	};
}
function SelfHostedImageProvider({ config, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageProvider, {
		provider: (0, import_react.useMemo)(() => createProvider(config), [config]),
		children
	});
}
//#endregion
//#region \0virtual:vite-rsc/client-references/group/facade:node_modules/fumapress/dist/plugins/image/self-hosted.js
var export_fe45b661386f = { SelfHostedImageProvider };
//#endregion
export { export_fe45b661386f };
