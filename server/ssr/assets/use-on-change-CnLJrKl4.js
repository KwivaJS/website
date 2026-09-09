import { i as __toESM } from "./rolldown-runtime-B4iAMlE-.js";
import { t as require_react } from "./react-SLAb4Nsi.js";
//#region node_modules/fumadocs-core/dist/url-BVHvi3_K.js
function join(...paths) {
	let out = "";
	for (let p of paths) {
		if (out.length > 0) {
			if (p.startsWith("/")) p = p.slice(1);
			if (!out.endsWith("/")) out += "/";
		}
		out += p;
	}
	return out;
}
/**
* normalize URL into the Fumadocs standard form (`/slug-1/slug-2`).
*
* This includes URLs with trailing slashes.
*/
function normalizeUrl(url) {
	if (url.startsWith("http://") || url.startsWith("https://")) return url;
	if (!url.startsWith("/")) url = "/" + url;
	if (url.length > 1 && url.endsWith("/")) url = url.slice(0, -1);
	return url;
}
//#endregion
//#region node_modules/fumadocs-core/dist/is-equal-LdLqRs0o.js
function isEqualShallow(a, b) {
	if (a === b) return true;
	if (Array.isArray(a) && Array.isArray(b)) return b.length === a.length && a.every((v, i) => isEqualShallow(v, b[i]));
	return false;
}
//#endregion
//#region node_modules/fumadocs-core/dist/utils/use-on-change.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/**
* @param value - state to watch
* @param onChange - when the state changed
* @param isUpdated - a function that determines if the state is updated
*/
function useOnChange(value, onChange, isUpdated = (a, b) => !isEqualShallow(a, b)) {
	const [prev, setPrev] = (0, import_react.useState)(value);
	if (isUpdated(prev, value)) {
		onChange(value, prev);
		setPrev(value);
	}
}
//#endregion
export { normalizeUrl as i, isEqualShallow as n, join as r, useOnChange as t };
