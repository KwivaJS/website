import { i as __toESM } from "./rolldown-runtime-B4iAMlE-.js";
import { t as require_react } from "./react-SLAb4Nsi.js";
//#region node_modules/@base-ui/react/internals/direction-context/DirectionContext.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var DirectionContext = /*#__PURE__*/ import_react.createContext(void 0);
function useDirection() {
	return import_react.useContext(DirectionContext)?.direction ?? "ltr";
}
//#endregion
export { useDirection as n, DirectionContext as t };
