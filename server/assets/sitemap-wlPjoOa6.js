import { t as require_lib } from "./lib-CmriPkeh.js";
//#region node_modules/fumapress/dist/plugins/sitemap.js
var import_lib = require_lib();
function formatLastmod(value) {
	return (value instanceof Date ? value : new Date(value)).toISOString();
}
function imageToElement(image) {
	const element = { "image:loc": { _text: image.loc } };
	if (image.caption) element["image:caption"] = { _text: image.caption };
	if (image.geo_location) element["image:geo_location"] = { _text: image.geo_location };
	if (image.title) element["image:title"] = { _text: image.title };
	if (image.license) element["image:license"] = { _text: image.license };
	return element;
}
function yesNo(value) {
	return { _text: value ? "yes" : "no" };
}
function videoToElement(video) {
	const element = {
		"video:thumbnail_loc": { _text: video.thumbnail_loc },
		"video:title": { _text: video.title },
		"video:description": { _text: video.description }
	};
	if (video.content_loc) element["video:content_loc"] = { _text: video.content_loc };
	if (typeof video.player_loc === "string") element["video:player_loc"] = { _text: video.player_loc };
	else if (video.player_loc) element["video:player_loc"] = {
		...video.player_loc.allow_embed !== void 0 && { _attributes: { allow_embed: video.player_loc.allow_embed ? "yes" : "no" } },
		_text: video.player_loc.loc
	};
	if (video.duration !== void 0) element["video:duration"] = { _text: String(video.duration) };
	if (video.expiration_date) element["video:expiration_date"] = { _text: formatLastmod(video.expiration_date) };
	if (video.rating !== void 0) element["video:rating"] = { _text: String(video.rating) };
	if (video.view_count !== void 0) element["video:view_count"] = { _text: String(video.view_count) };
	if (video.publication_date) element["video:publication_date"] = { _text: formatLastmod(video.publication_date) };
	if (video.family_friendly !== void 0) element["video:family_friendly"] = yesNo(video.family_friendly);
	if (video.restriction) element["video:restriction"] = {
		_attributes: { relationship: video.restriction.relationship },
		_text: video.restriction.countries.join(" ")
	};
	if (video.platform) element["video:platform"] = {
		_attributes: { relationship: video.platform.relationship },
		_text: video.platform.platforms.join(" ")
	};
	if (video.price) element["video:price"] = {
		_attributes: {
			currency: video.price.currency,
			...video.price.type && { type: video.price.type }
		},
		_text: String(video.price.value)
	};
	if (video.requires_subscription !== void 0) element["video:requires_subscription"] = yesNo(video.requires_subscription);
	if (typeof video.uploader === "string") element["video:uploader"] = { _text: video.uploader };
	else if (video.uploader) element["video:uploader"] = {
		...video.uploader.info && { _attributes: { info: video.uploader.info } },
		_text: video.uploader.name
	};
	if (video.live !== void 0) element["video:live"] = yesNo(video.live);
	if (video.tag) element["video:tag"] = (typeof video.tag === "string" ? [video.tag] : video.tag).map((tag) => ({ _text: tag }));
	return element;
}
function newsToElement(news) {
	return {
		"news:publication": {
			"news:name": { _text: news.publication.name },
			"news:language": { _text: news.publication.language }
		},
		"news:publication_date": { _text: formatLastmod(news.publication_date) },
		"news:title": { _text: news.title }
	};
}
function entryToUrlElement(entry) {
	const url = { loc: { _text: entry.loc } };
	if (entry.lastmod) url.lastmod = { _text: formatLastmod(entry.lastmod) };
	if (entry.changefreq) url.changefreq = { _text: entry.changefreq };
	if (entry.priority !== void 0) url.priority = { _text: String(entry.priority) };
	if (entry.alternates?.length) url["xhtml:link"] = entry.alternates.map((alternate) => ({ _attributes: {
		rel: alternate.rel,
		hreflang: alternate.hreflang,
		href: alternate.href
	} }));
	if (entry.images?.length) url["image:image"] = entry.images.map(imageToElement);
	if (entry.videos?.length) url["video:video"] = entry.videos.map(videoToElement);
	if (entry.news) url["news:news"] = newsToElement(entry.news);
	return url;
}
function buildSitemap(entries) {
	return (0, import_lib.js2xml)({
		_declaration: { _attributes: {
			version: "1.0",
			encoding: "UTF-8"
		} },
		urlset: {
			_attributes: {
				xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
				"xmlns:xhtml": "http://www.w3.org/1999/xhtml",
				"xmlns:image": "http://www.google.com/schemas/sitemap-image/1.1",
				"xmlns:video": "http://www.google.com/schemas/sitemap-video/1.1",
				"xmlns:news": "http://www.google.com/schemas/sitemap-news/0.9"
			},
			url: entries.map(entryToUrlElement)
		}
	}, {
		compact: true,
		spaces: 0
	});
}
function sitemapPlugin(options = {}) {
	const { path = "/sitemap.xml", getEntry: _getEntry = async function getEntryDefault(page) {
		return {
			loc: this.siteConfig.baseUrl ? new URL(page.url, this.siteConfig.baseUrl).href : page.url,
			lastmod: await this.getPageLastModified(page),
			priority: .8
		};
	}, additionalEntries } = options;
	return {
		name: "core:sitemap",
		async createPages({ createApiIsomorphic, unstable_getCreated }) {
			const renderMode = this.mode === "default" ? "static" : this.mode;
			const getEntry = _getEntry.bind(this);
			createApiIsomorphic({
				render: renderMode,
				path,
				handler: async () => {
					const source = await this.getLoader();
					const entries = [];
					const pageLocs = /* @__PURE__ */ new Set();
					for (const entry of await Promise.all(source.getPages().map(getEntry))) {
						if (!entry) continue;
						pageLocs.add(entry.loc);
						entries.push(entry);
					}
					for (const route of await unstable_getCreated().unstable_getRouterConfigs()) if (route.isStatic && route.type === "route") {
						const segments = route.path.map((v) => v.name);
						if (segments.at(-1) === "404") continue;
						const pathname = "/" + segments.join("/");
						const loc = this.siteConfig.baseUrl ? new URL(pathname, this.siteConfig.baseUrl).href : pathname;
						if (pageLocs.has(loc)) continue;
						entries.push({
							loc,
							priority: 1
						});
					}
					if (additionalEntries) entries.push(...typeof additionalEntries === "function" ? await additionalEntries.call(this) : additionalEntries);
					return new Response(buildSitemap(entries), { headers: { "Content-Type": "application/xml" } });
				}
			});
		}
	};
}
//#endregion
export { sitemapPlugin as n, buildSitemap as t };
