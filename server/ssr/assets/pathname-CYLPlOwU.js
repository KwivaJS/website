//#region node_modules/fumapress/dist/lib/pathname.js
/** add base URL to pathname */
function resolveBaseUrl(base, pathname) {
	if (base.endsWith("/")) base = base.slice(0, -1);
	if (pathname.startsWith("/")) pathname = pathname.slice(1);
	return `${base}/${pathname}`;
}
//#endregion
export { resolveBaseUrl as t };
