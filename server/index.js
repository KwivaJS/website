import { r as unstable_setAllEnv, t as server_entry_inner_default } from "./assets/server-entry-BzX-n4L5.js";
//#region node_modules/waku/dist/lib/vite-entries/entry.server.js
async function INTERNAL_runFetch(env, req, ...args) {
	unstable_setAllEnv(env);
	return server_entry_inner_default.fetch(req, ...args);
}
var entry_server_default = server_entry_inner_default.defaultExport;
//#endregion
export { INTERNAL_runFetch, entry_server_default as default, server_entry_inner_default as unstable_serverEntry };
