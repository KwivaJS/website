//#region node_modules/fumapress/dist/plugins/robots.js
function ruleToText(rule) {
	const lines = [];
	const userAgents = Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent ?? "*"];
	const allow = Array.isArray(rule.allow) ? rule.allow : rule.allow ? [rule.allow] : [];
	const disallow = Array.isArray(rule.disallow) ? rule.disallow : rule.disallow ? [rule.disallow] : [];
	for (const userAgent of userAgents) lines.push(`User-agent: ${userAgent}`);
	for (const path of allow) lines.push(`Allow: ${path}`);
	for (const path of disallow) lines.push(`Disallow: ${path}`);
	if (rule.crawlDelay !== void 0) lines.push(`Crawl-delay: ${rule.crawlDelay}`);
	return lines.join("\n");
}
function robotsPlugin(options = {}) {
	const { path = "/robots.txt", rules = [{
		userAgent: "*",
		allow: "/"
	}], additionalContent } = options;
	let sitemap = options.sitemap ?? false;
	return {
		name: "core:robots",
		init() {
			if (options.sitemap === void 0) sitemap = this.plugins.some((item) => item.name === "core:sitemap");
		},
		createPages({ createApiIsomorphic }) {
			createApiIsomorphic({
				render: this.mode === "default" ? "static" : this.mode,
				path,
				handler: async () => {
					const sections = rules.map(ruleToText);
					if (sitemap) {
						const sitemapPath = typeof sitemap === "string" ? sitemap : "/sitemap.xml";
						sections.push(`Sitemap: ${this.siteConfig.baseUrl ? new URL(sitemapPath, this.siteConfig.baseUrl).href : sitemapPath}`);
					}
					if (additionalContent) sections.push(additionalContent);
					return new Response(sections.join("\n\n"), { headers: { "Content-Type": "text/plain" } });
				}
			});
		}
	};
}
//#endregion
export { robotsPlugin as t };
