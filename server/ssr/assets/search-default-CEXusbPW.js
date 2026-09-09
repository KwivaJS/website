import { i as __toESM } from "./rolldown-runtime-B4iAMlE-.js";
import { t as require_jsx_runtime } from "./jsx-runtime-BqLYtsoi.js";
import { t as require_react } from "./react-SLAb4Nsi.js";
import { a as SearchDialogFooter, c as SearchDialogInput, d as TagsList, f as TagsListItem, i as SearchDialogContent, l as SearchDialogList, n as SearchDialog, o as SearchDialogHeader, r as SearchDialogClose, s as SearchDialogIcon, t as useDocsSearch, u as SearchDialogOverlay } from "./client-CAOIt50h.js";
import { n as useI18n } from "./i18n-BUDVpFLw.js";
import { t as useOnChange } from "./use-on-change-CnLJrKl4.js";
import { fetchClient } from "./fetch-w0kAi-84.js";
//#region node_modules/fumadocs-ui/dist/components/dialog/search-default.js
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime(), 1);
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var STATIC;
function DefaultSearchDialog({ type, defaultTag, tags = [], api, delayMs, allowClear = false, links = [], footer, ...props }) {
	const { locale } = useI18n();
	const [tag, setTag] = (0, import_react.useState)(defaultTag);
	let client;
	if (type === "static") client = (0, import_react.use)(STATIC ??= import("./orama-static-CnJpRiZ9.js")).staticClient({
		from: api,
		locale,
		tag
	});
	else client = fetchClient({
		api,
		locale,
		tag
	});
	const { search, setSearch, query } = useDocsSearch({
		client,
		delayMs
	});
	const defaultItems = (0, import_react.useMemo)(() => {
		if (links.length === 0) return null;
		return links.map(([name, link]) => ({
			type: "page",
			id: name,
			content: name,
			url: link
		}));
	}, [links]);
	useOnChange(defaultTag, (v) => {
		setTag(v);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SearchDialog, {
		search,
		onSearchChange: setSearch,
		isLoading: query.isLoading,
		...props,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchDialogOverlay, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SearchDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SearchDialogHeader, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchDialogIcon, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchDialogInput, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchDialogClose, {})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchDialogList, { items: query.data !== "empty" ? query.data : defaultItems })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SearchDialogFooter, { children: [tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagsList, {
				tag,
				onTagChange: setTag,
				allowClear,
				children: tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagsListItem, {
					value: tag.value,
					children: tag.name
				}, tag.value))
			}), footer] })
		]
	});
}
//#endregion
export { DefaultSearchDialog as default };
