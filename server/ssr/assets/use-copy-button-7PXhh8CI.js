import { i as __toESM } from "./rolldown-runtime-B4iAMlE-.js";
import { t as require_react } from "./react-SLAb4Nsi.js";
//#region node_modules/fumadocs-ui/dist/utils/use-copy-button.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function useCopyButton(onCopy) {
	const [checked, setChecked] = (0, import_react.useState)(false);
	const callbackRef = (0, import_react.useRef)(onCopy);
	const timeoutRef = (0, import_react.useRef)(null);
	callbackRef.current = onCopy;
	const onClick = (0, import_react.useCallback)(() => {
		if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
		Promise.resolve(callbackRef.current()).then(() => {
			setChecked(true);
			timeoutRef.current = window.setTimeout(() => {
				setChecked(false);
			}, 1500);
		});
	}, []);
	(0, import_react.useEffect)(() => {
		return () => {
			if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
		};
	}, []);
	return [checked, onClick];
}
//#endregion
export { useCopyButton as t };
