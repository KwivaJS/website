//#region node_modules/fumapress/dist/plugins/flexsearch.js
function flexsearchPlugin({ buildIndex = async function buildIndexDefault(page) {
	for (const adapter of this.adapters) {
		const structuredData = await adapter["core:get-structured-data"]?.call(this, page);
		if (structuredData !== void 0) return {
			id: page.url,
			title: page.data.title ?? page.path,
			description: page.data.description,
			url: page.url,
			structuredData
		};
	}
	throw new Error("[Fumapress] Please specify the `buildIndex` option to flexsearchPlugin()");
} } = {}) {
	return {
		name: "core:flexsearch",
		preinit({ finalized }) {
			for (const item of finalized) if (item.name === "core:flexsearch" || item.name === "core:orama-search") throw new Error(`[Fumapress] "core:flexsearch" conflicts with "${item.name}": only one search plugin can be added.`);
		},
		init() {
			const data = this.data["core:provider"] ??= {};
			(data.transformers ??= []).push(async (props) => {
				props.search ??= { enabled: true };
				if (this.mode === "static") props.search.SearchDialog ??= (await import("./flexsearch-static-DfW1mE1g.js")).default;
				return props;
			});
		},
		async createPages({ createApiIsomorphic }) {
			const { flexsearchFromSource } = await import("./flexsearch-CS0dkFlp.js");
			const render = this.mode === "default" ? "dynamic" : this.mode;
			const server = flexsearchFromSource(this.getLoader, { buildIndex: buildIndex.bind(this) });
			createApiIsomorphic({
				render,
				path: "/api/search",
				handler: render === "static" ? server.staticGET : server.GET
			});
		}
	};
}
//#endregion
export { flexsearchPlugin as t };
