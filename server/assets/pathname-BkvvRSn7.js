//#region node_modules/fumapress/dist/lib/pathname.js
/** Join multiple (full) pathnames */
function joinPathname(...paths) {
	const segs = [];
	for (let p of paths) {
		if (p.startsWith("/")) p = p.slice(1);
		if (p.endsWith("/")) p = p.slice(0, -1);
		if (p.length > 0) segs.push(p);
	}
	return "/" + segs.join("/");
}
var PATHNAME_SEGMENT_REGEX = /^[A-Za-z0-9\-._~!$&'()*+,;=:@]+$/;
/** Check if the string is a full pathname (one that does not include `.` or `..`) */
function isFullPathname(s) {
	return s.startsWith("/") && s.slice(1).split("/").every((seg) => seg !== "." && seg !== ".." && PATHNAME_SEGMENT_REGEX.test(seg));
}
//#endregion
export { joinPathname as n, isFullPathname as t };
