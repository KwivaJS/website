import { i as __toESM } from "./rolldown-runtime-B4iAMlE-.js";
import { t as require_jsx_runtime } from "./jsx-runtime-BqLYtsoi.js";
import { t as require_react } from "./react-SLAb4Nsi.js";
import { a as useRouter, i as usePathname, s as TranslationProvider } from "./framework-BVFfi5Qn.js";
//#region node_modules/fumadocs-ui/dist/contexts/i18n.js
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime(), 1);
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var LocaleContext = (0, import_react.createContext)({});
function useI18n() {
	return (0, import_react.use)(LocaleContext);
}
var Empty = {};
function I18nProvider({ locales = [], locale, onLocaleChange, children, translations = Empty }) {
	const router = useRouter();
	const pathname = usePathname();
	const onChange = (value) => {
		if (onLocaleChange) return onLocaleChange(value);
		const segments = pathname.split("/").filter((v) => v.length > 0);
		if (segments.length === 0 || segments[0] !== locale) segments.unshift(value);
		else segments[0] = value;
		router.push(`/${segments.join("/")}`);
	};
	const onChangeRef = (0, import_react.useRef)(onChange);
	onChangeRef.current = onChange;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocaleContext, {
		value: (0, import_react.useMemo)(() => ({
			locale,
			locales,
			onChange: (v) => onChangeRef.current(v)
		}), [locale, locales]),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TranslationProvider, {
			translations,
			children
		})
	});
}
//#endregion
export { useI18n as n, I18nProvider as t };
