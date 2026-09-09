import { i as __toESM } from "./rolldown-runtime-B4iAMlE-.js";
import { t as require_react } from "./react-SLAb4Nsi.js";
//#region node_modules/@base-ui/utils/useControlled.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function useControlled({ controlled, default: defaultProp, name, state = "value" }) {
	const { current: isControlled } = import_react.useRef(controlled !== void 0);
	const [valueState, setValue] = import_react.useState(defaultProp);
	return [isControlled && controlled !== void 0 ? controlled : valueState, import_react.useCallback((newValue) => {
		if (!isControlled) setValue(newValue);
	}, [])];
}
//#endregion
export { useControlled as t };
