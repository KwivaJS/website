import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
import { t as require_lib } from "./lib-CmriPkeh.js";
//#region node_modules/fumapress/dist/plugins/rss.js
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var import_lib = require_lib();
function formatDate(value) {
	return (value instanceof Date ? value : new Date(value)).toUTCString();
}
function toTime(value) {
	if (value === void 0) return 0;
	return (value instanceof Date ? value : new Date(value)).getTime();
}
function itemToElement(item) {
	const element = {
		title: { _text: item.title },
		link: { _text: item.link },
		guid: { _text: item.guid ?? item.link }
	};
	if (item.description) element.description = { _text: item.description };
	if (item.pubDate) element.pubDate = { _text: formatDate(item.pubDate) };
	if (item.author) element.author = { _text: item.author };
	if (item.categories?.length) element.category = item.categories.map((category) => ({ _text: category }));
	return element;
}
function buildRSS(channel) {
	const element = {
		title: { _text: channel.title },
		link: { _text: channel.link },
		description: { _text: channel.description }
	};
	if (channel.language) element.language = { _text: channel.language };
	const lastBuild = channel.items.reduce((acc, item) => Math.max(acc, toTime(item.pubDate)), 0);
	if (lastBuild > 0) element.lastBuildDate = { _text: formatDate(new Date(lastBuild)) };
	if (channel.selfUrl) element["atom:link"] = { _attributes: {
		href: channel.selfUrl,
		rel: "self",
		type: "application/rss+xml"
	} };
	element.item = channel.items.map(itemToElement);
	return (0, import_lib.js2xml)({
		_declaration: { _attributes: {
			version: "1.0",
			encoding: "UTF-8"
		} },
		rss: {
			_attributes: {
				version: "2.0",
				"xmlns:atom": "http://www.w3.org/2005/Atom"
			},
			channel: element
		}
	}, {
		compact: true,
		spaces: 0
	});
}
function rssPlugin(options = {}) {
	const { path = "/rss.xml", title, description, language, limit = 20, alternateLink = true, getItem: _getItem = async function getItemDefault(page) {
		const date = await this.getPageCreatedAt(page) ?? await this.getPageLastModified(page);
		if (!date) return;
		return {
			title: page.data.title ?? page.path,
			description: page.data.description,
			link: this.siteConfig.baseUrl ? new URL(page.url, this.siteConfig.baseUrl).href : page.url,
			pubDate: date
		};
	}, additionalItems } = options;
	return {
		name: "core:rss",
		init() {
			if (!alternateLink) return;
			this.interceptRootMeta(({ next }) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("link", {
				rel: "alternate",
				type: "application/rss+xml",
				title: title ?? this.siteConfig.name,
				href: path
			}), next()] }));
		},
		async createPages({ createApiIsomorphic }) {
			const renderMode = this.mode === "default" ? "static" : this.mode;
			const getItem = _getItem.bind(this);
			createApiIsomorphic({
				render: renderMode,
				path,
				handler: async () => {
					const source = await this.getLoader();
					const items = (await Promise.all(source.getPages().map(getItem))).filter((item) => item !== void 0);
					if (additionalItems) items.push(...typeof additionalItems === "function" ? await additionalItems.call(this) : additionalItems);
					items.sort((a, b) => toTime(b.pubDate) - toTime(a.pubDate));
					const channelTitle = title ?? this.siteConfig.name;
					return new Response(buildRSS({
						title: channelTitle,
						link: this.siteConfig.baseUrl ?? "/",
						description: description ?? channelTitle,
						language,
						selfUrl: this.siteConfig.baseUrl ? new URL(path, this.siteConfig.baseUrl).href : void 0,
						items: items.slice(0, limit)
					}), { headers: { "Content-Type": "application/rss+xml" } });
				}
			});
		}
	};
}
//#endregion
export { rssPlugin as n, buildRSS as t };
