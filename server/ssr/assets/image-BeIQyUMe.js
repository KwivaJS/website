import { i as __toESM } from "./rolldown-runtime-B4iAMlE-.js";
import { t as require_jsx_runtime } from "./jsx-runtime-BqLYtsoi.js";
import { t as require_react } from "./react-SLAb4Nsi.js";
import { i as useRouter } from "./client-4Up-pvSm.js";
import { r as require_react_dom } from "../index.js";
//#region node_modules/waku/dist/main.js
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime(), 1);
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom(), 1);
//#endregion
//#region node_modules/fumapress/dist/components/image.js
function parseLength(v) {
	if (typeof v !== "string") return v;
	const parsed = parseInt(v, 10);
	if (Number.isNaN(parsed)) throw new Error(`[Fumapress] <Image /> only accepts integer values of width/height, received: "${v}"`);
	return parsed;
}
/**
* resolve src to a full pathname with base URL included (or keep absolute URLs as-is)
*/
function normalizeSrc(src, basePathname) {
	if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) return src;
	const base = new URL(basePathname, "http://localhost");
	const resolved = new URL(src, base);
	if (resolved.hostname !== base.hostname) throw new Error(`The src attribute "${src}" is not a valid relative path`);
	return resolved.pathname;
}
var ImageContext = (0, import_react.createContext)(null);
function ImageProvider({ provider, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageContext, {
		value: (0, import_react.useMemo)(() => ({ provider }), [provider]),
		children
	});
}
/** generate widths (ascending order) */
function getWidths(provider, width, sizes) {
	if (sizes) {
		const allSizes = provider.sizes ?? provider.deviceSizes;
		const viewportWidthRe = /(^|\s)(1?\d?\d)vw/g;
		const percentSizes = [];
		for (let match; match = viewportWidthRe.exec(sizes);) percentSizes.push(parseInt(match[2]));
		if (percentSizes.length !== 0) {
			const minRatio = Math.min(...percentSizes) * .01;
			const minSize = provider.deviceSizes[0] * minRatio;
			const minIndex = allSizes.findLastIndex((s) => s < minSize);
			return {
				widths: minIndex === -1 ? allSizes : allSizes.slice(minIndex + 1),
				kind: "w"
			};
		}
		return {
			widths: allSizes,
			kind: "w"
		};
	}
	if (typeof width !== "number") return {
		widths: provider.deviceSizes,
		kind: "w"
	};
	if (provider.sizes) {
		const widths = /* @__PURE__ */ new Set();
		const sizes = provider.sizes;
		const defaultWidth = sizes.at(-1);
		widths.add(sizes.find((p) => p >= width) ?? defaultWidth);
		widths.add(sizes.find((p) => p >= width * 2) ?? defaultWidth);
		return {
			widths: Array.from(widths),
			kind: "x"
		};
	}
	return {
		widths: [width, width * 2],
		kind: "x"
	};
}
function generateImageAttributes(provider, src, quality = provider.defaultQuality, width, sizes) {
	const { widths, kind } = getWidths(provider, width, sizes);
	return {
		sizes: !sizes && kind === "w" ? "100vw" : sizes,
		srcSet: widths.map((w, i) => `${provider.buildImageUrl({
			src,
			width: w,
			quality
		})} ${kind === "w" ? w : i + 1}${kind}`).join(", "),
		src: provider.buildImageUrl({
			src,
			width: widths.at(-1),
			quality
		})
	};
}
function Image({ src: _src, width: _width, height: _height, sizes, quality, unoptimized = false, preload = true, ...rest }) {
	const ctx = (0, import_react.use)(ImageContext);
	const pathname = useRouter().path;
	const { src, width, height } = (0, import_react.useMemo)(() => {
		if (typeof _src === "object") return {
			src: normalizeSrc(_src.src, pathname),
			width: parseLength(_width ?? _src.width),
			height: parseLength(_height ?? _src.height)
		};
		return {
			src: _src ? normalizeSrc(_src, pathname) : void 0,
			width: parseLength(_width),
			height: parseLength(_height)
		};
	}, [
		_src,
		_width,
		_height,
		pathname
	]);
	if (src && (src.startsWith("data:") || ctx?.provider.canOptimize?.(src) === false)) unoptimized = true;
	if (!src || !ctx || unoptimized) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		...rest,
		width,
		height,
		sizes,
		src
	});
	const { provider } = ctx;
	provider.validate?.(src);
	const generatedProps = generateImageAttributes(provider, src, quality, width, sizes);
	let preloadElement;
	if (preload) {
		const preloadOptions = {
			as: "image",
			imageSrcSet: generatedProps.srcSet,
			imageSizes: generatedProps.sizes,
			crossOrigin: rest.crossOrigin,
			referrerPolicy: rest.referrerPolicy,
			fetchPriority: rest.fetchPriority
		};
		if (import_react_dom.preload) import_react_dom.preload(generatedProps.src, preloadOptions);
		else preloadElement = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("link", {
			rel: "preload",
			href: generatedProps.srcSet ? void 0 : generatedProps.src,
			...preloadOptions
		}, "press-img-" + generatedProps.src + generatedProps.srcSet + generatedProps.sizes);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [preloadElement, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		...rest,
		width,
		height,
		...generatedProps
	})] });
}
//#endregion
export { ImageProvider as n, Image as t };
