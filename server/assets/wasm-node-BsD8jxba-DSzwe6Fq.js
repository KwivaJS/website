import { i as initSync, r as __wbg_init, t as initWasm } from "./wasm-init-DzwbPAKW-BLM6oWra.js";
import { readFileSync } from "node:fs";
//#region node_modules/@takumi-rs/wasm/bundlers/node.mjs
var wasmBytes = readFileSync(new URL("../pkg/takumi_wasm_bg.wasm", import.meta.url));
initSync({ module: wasmBytes });
var node_default = __wbg_init;
//#endregion
//#region node_modules/takumi-js/dist/wasm-node-BsD8jxba.mjs
var loadBackend = (module) => initWasm(module, node_default);
//#endregion
export { loadBackend };
