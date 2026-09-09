import { o as __toESM } from "./rolldown-runtime-BMI-E3GI.js";
import { o as require_server_edge, r as createServerManifest, t as createClientManifest } from "./rsc-Vn185Xlk.js";
//#region node_modules/@vitejs/plugin-rsc/dist/react/rsc/server.js
var import_server_edge = /* @__PURE__ */ __toESM(require_server_edge(), 1);
function renderToReadableStream(data, options, extraOptions) {
	return import_server_edge.renderToReadableStream(data, createClientManifest({ onClientReference: extraOptions?.onClientReference }), options);
}
function registerClientReference(proxy, id, name) {
	return import_server_edge.registerClientReference(proxy, id, name);
}
var decodeReply = (body, options) => import_server_edge.decodeReply(body, createServerManifest(), options);
function decodeAction(body) {
	return import_server_edge.decodeAction(body, createServerManifest());
}
function decodeFormState(actionResult, body) {
	return import_server_edge.decodeFormState(actionResult, body, createServerManifest());
}
var createTemporaryReferenceSet = import_server_edge.createTemporaryReferenceSet;
//#endregion
export { registerClientReference as a, decodeReply as i, decodeAction as n, renderToReadableStream as o, decodeFormState as r, createTemporaryReferenceSet as t };
