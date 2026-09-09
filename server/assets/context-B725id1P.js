import { t as require_react_react_server } from "./react.react-server-BSR27ksj.js";
import { a as extname, i as dirname$1, n as visit, o as joinPath, r as basename, s as normalize } from "./utils-DEVq3cEC-DMfnMxy1.js";
import { n as __toESM, t as __commonJSMin } from "./runtime-BkT71AZE.js";
import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
import path, { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import { AsyncLocalStorage } from "node:async_hooks";
//#region node_modules/fumadocs-core/dist/url-BVHvi3_K.js
var import_react_react_server = require_react_react_server();
/**
* normalize URL into the Fumadocs standard form (`/slug-1/slug-2`).
*
* This includes URLs with trailing slashes.
*/
function normalizeUrl(url) {
	if (url.startsWith("http://") || url.startsWith("https://")) return url;
	if (!url.startsWith("/")) url = "/" + url;
	if (url.length > 1 && url.endsWith("/")) url = url.slice(0, -1);
	return url;
}
//#endregion
//#region node_modules/fumadocs-core/dist/is-equal-LdLqRs0o.js
function isEqualShallow(a, b) {
	if (a === b) return true;
	if (Array.isArray(a) && Array.isArray(b)) return b.length === a.length && a.every((v, i) => isEqualShallow(v, b[i]));
	return false;
}
//#endregion
//#region node_modules/fumadocs-core/dist/source/plugins/slugs.js
/**
* Generate slugs for pages if missing.
*/
function slugsPlugin(optsOrFn = {}) {
	const prepended = /* @__PURE__ */ new WeakSet();
	const { baseSlugs = [], slugs: slugFn } = typeof optsOrFn === "function" ? { slugs: optsOrFn } : optsOrFn;
	function generateSlugs(path, file) {
		const out = slugFn?.(file, () => getSlugs(path)) ?? getSlugs(path);
		prepended.add(file);
		return baseSlugs.length > 0 ? [...baseSlugs, ...out] : out;
	}
	return {
		name: "fumadocs:slugs",
		transformStorage({ storage }) {
			const indexFiles = [];
			const taken = /* @__PURE__ */ new Set();
			for (const path of storage.getFiles()) {
				const file = storage.read(path);
				if (!file || file.format !== "page") continue;
				if (file.slugs) {
					if (baseSlugs.length > 0 && !prepended.has(file)) {
						file.slugs = [...baseSlugs, ...file.slugs];
						prepended.add(file);
					}
					continue;
				}
				if (basename(path, extname(path)) === "index") {
					indexFiles.push(path);
					continue;
				}
				file.slugs = generateSlugs(path, file);
				const key = file.slugs.join("/");
				if (taken.has(key)) throw new Error(`Duplicated slugs: ${key}`);
				taken.add(key);
			}
			for (const path of indexFiles) {
				const file = storage.read(path);
				if (file?.format !== "page") continue;
				file.slugs = generateSlugs(path, file);
				if (taken.has(file.slugs.join("/"))) file.slugs = [...file.slugs, "index"];
				const key = file.slugs.join("/");
				if (taken.has(key)) throw new Error(`Duplicated slugs: ${key}`);
				taken.add(key);
			}
		}
	};
}
var GroupRegex = /^\(.+\)$/;
/**
* Convert file path into slugs, also encode non-ASCII characters, so they can work in pathname
*/
function getSlugs(file) {
	const dir = dirname$1(file);
	const name = basename(file, extname(file));
	const slugs = [];
	for (const seg of dir.split("/")) if (seg.length > 0 && !GroupRegex.test(seg)) slugs.push(encodeURI(seg));
	if (GroupRegex.test(name)) throw new Error(`Cannot use folder group in file names: ${file}`);
	if (name !== "index") slugs.push(encodeURI(name));
	return slugs;
}
//#endregion
//#region node_modules/fumadocs-core/dist/icon-BILaoXeg.js
function iconPlugin(resolveIcon) {
	function replaceIcon(node) {
		if (node.icon === void 0 || typeof node.icon === "string") node.icon = resolveIcon(node.icon);
		return node;
	}
	return {
		name: "fumadocs:icon",
		transformPageTree: {
			file: replaceIcon,
			folder: replaceIcon,
			separator: replaceIcon
		}
	};
}
//#endregion
//#region node_modules/fumadocs-core/dist/dynamic-CTsodhTH.js
/**
* In memory file system.
*/
var FileSystem = class {
	constructor(inherit) {
		this.files = /* @__PURE__ */ new Map();
		this.folders = /* @__PURE__ */ new Map();
		if (inherit) {
			for (const [k, v] of inherit.folders) this.folders.set(k, [...v]);
			for (const [k, v] of inherit.files) this.files.set(k, v);
		} else this.folders.set("", []);
	}
	read(path) {
		return this.files.get(path);
	}
	/**
	* get the direct children of folder (in virtual file path)
	*/
	readDir(path) {
		return this.folders.get(path);
	}
	write(path, file) {
		if (!this.files.has(path)) {
			const dir = dirname$1(path);
			this.makeDir(dir);
			this.readDir(dir)?.push(path);
		}
		this.files.set(path, file);
	}
	/**
	* Delete files at specified path.
	*
	* @param path - the target path.
	* @param [recursive=false] - if set to `true`, it will also delete directories.
	*/
	delete(path, recursive = false) {
		if (this.files.delete(path)) return true;
		if (recursive) {
			const folder = this.folders.get(path);
			if (!folder) return false;
			this.folders.delete(path);
			for (const child of folder) this.delete(child);
			return true;
		}
		return false;
	}
	getFiles() {
		return Array.from(this.files.keys());
	}
	makeDir(path) {
		const cur = [];
		let parentPath = "";
		for (const seg of path.split("/")) {
			cur.push(seg);
			const curPath = cur.join("/");
			if (!this.folders.has(curPath)) {
				this.folders.set(curPath, []);
				this.folders.get(parentPath).push(curPath);
			}
			parentPath = curPath;
		}
	}
};
function isStaticSource(s) {
	return "files" in s && Array.isArray(s.files);
}
function isDynamicSource(s) {
	return "files" in s && typeof s.files === "function";
}
var EmptyLang = Symbol();
/**
* convert input files into virtual file system.
*
* in the storage, locale codes are removed from file paths, hence the same file will have same file paths in every storage.
*/
function createContentStorageBuilder(loaderConfig) {
	const { input, plugins, i18n } = loaderConfig;
	let parser;
	if (!i18n) parser = (path) => [path];
	else if (i18n.parser === "dir") {
		const langSet = new Set(i18n.languages);
		parser = (path) => {
			const [locale, ...segs] = path.split("/");
			if (!locale || segs.length === 0) return [path];
			if (langSet.has(locale)) return [segs.join("/"), locale];
			if (locale === "$") return [segs.join("/"), i18n.languages];
			return [path];
		};
	} else {
		const langSet = new Set(i18n.languages);
		parser = (path) => {
			const segs = path.split("/");
			const base = segs.pop();
			if (!base) return [path];
			const parts = base.split(".");
			if (parts.length < 3) return [path];
			const [locale] = parts.splice(parts.length - 2, 1);
			segs.push(parts.join("."));
			if (langSet.has(locale)) return [segs.join("/"), locale];
			if (locale === "$") return [segs.join("/"), i18n.languages];
			return [path];
		};
	}
	const fileMap = /* @__PURE__ */ new Map();
	function scan(type, source) {
		for (const inputFile of source.files) {
			let file;
			const path = normalize(source.baseDir ? `${source.baseDir}/${inputFile.path}` : inputFile.path);
			if (inputFile.type === "page") file = {
				format: "page",
				type,
				path,
				slugs: inputFile.slugs,
				data: inputFile.data,
				absolutePath: inputFile.absolutePath
			};
			else file = {
				format: "meta",
				type,
				path,
				absolutePath: inputFile.absolutePath,
				data: inputFile.data
			};
			const [storageKey, locale = i18n ? i18n.defaultLanguage : EmptyLang] = parser(path);
			const entry = [storageKey, file];
			if (Array.isArray(locale)) for (const item of locale) pushMapList(fileMap, item, entry);
			else pushMapList(fileMap, locale, entry);
		}
	}
	if (isStaticSource(input)) scan(void 0, input);
	else for (const k in input) scan(k, input[k]);
	function makeStorage(locale, inherit) {
		const storage = new FileSystem(inherit);
		for (const [storageKey, file] of fileMap.get(locale) ?? []) storage.write(storageKey, file);
		const context = { storage };
		for (const plugin of plugins) plugin.transformStorage?.(context);
		return storage;
	}
	return {
		i18n() {
			const storages = {};
			if (!i18n) return storages;
			const fallbackLang = i18n.fallbackLanguage !== null ? i18n.fallbackLanguage ?? i18n.defaultLanguage : null;
			function scan(lang) {
				if (storages[lang]) return storages[lang];
				return storages[lang] = makeStorage(lang, fallbackLang && fallbackLang !== lang ? scan(fallbackLang) : void 0);
			}
			for (const lang of i18n.languages) scan(lang);
			return storages;
		},
		single() {
			return makeStorage(EmptyLang);
		}
	};
}
function pushMapList(map, k, v) {
	let list = map.get(k);
	if (!list) {
		list = [];
		map.set(k, list);
	}
	list.push(v);
}
function transformerFallback() {
	const addedFiles = /* @__PURE__ */ new Set();
	function shouldIgnore(context) {
		return context.custom?._fallback === true;
	}
	return {
		root(root) {
			if (shouldIgnore(this)) return root;
			const isolatedStorage = new FileSystem();
			if (addedFiles.size === this.storage.files.size) return root;
			for (const file of this.storage.getFiles()) {
				if (addedFiles.has(file)) continue;
				isolatedStorage.write(file, this.storage.read(file));
			}
			root.fallback = createPageTreeBuilder(isolatedStorage, {
				...this.options,
				idPrefix: this.options.idPrefix ? `fallback:${this.options.idPrefix}` : "fallback",
				generateFallback: false,
				context: {
					...this.custom,
					_fallback: true
				}
			}).root();
			addedFiles.clear();
			return root;
		},
		file(node, file) {
			if (shouldIgnore(this)) return node;
			if (file) addedFiles.add(file);
			return node;
		},
		folder(node, _dir, metaPath) {
			if (shouldIgnore(this)) return node;
			if (metaPath) addedFiles.add(metaPath);
			return node;
		}
	};
}
var group = /^\((?<name>.+)\)$/;
var link = /^(?<external>external:)?(?:\[(?<icon>[^\]]+)])?\[(?<name>[^\]]+)]\((?<url>[^)]+)\)$/;
var separator = /^---(?:\[(?<icon>[^\]]+)])?(?<name>.+)---|^---$/;
var rest = "...";
var restReversed = "z...a";
var extractPrefix = "...";
var excludePrefix = "!";
var SymbolUnfinished = Symbol("unfinished");
var SymbolName = Symbol("name");
var SymbolOwner = Symbol("owner");
function createPageTreeBuilder(input, options) {
	const flattenPathToFullPath = /* @__PURE__ */ new Map();
	const transformers = [];
	/** virtual file path -> output page tree node (if cached) */
	const pathToNode = /* @__PURE__ */ new Map();
	let _nextId = 0;
	const { noRef = false, idPrefix, url: getUrl, generateFallback = true, sort: { by: sortBy = "path", locales: sortLocales, options: sortOptions } = {} } = options;
	/** passed as additional information to transformers */
	let ctx;
	if (options.transformers) transformers.push(...options.transformers);
	if (generateFallback) transformers.push(transformerFallback());
	if (Array.isArray(input)) {
		const [locale, storages] = input;
		ctx = {
			get builder() {
				return builder;
			},
			storage: storages[locale],
			storages,
			locale,
			transformers,
			custom: options.context,
			options
		};
	} else ctx = {
		get builder() {
			return builder;
		},
		storage: input,
		transformers,
		custom: options.context,
		options
	};
	const { storage, locale } = ctx;
	for (const file of storage.getFiles()) {
		const content = storage.read(file);
		const flattenPath = file.substring(0, file.length - extname(file).length);
		flattenPathToFullPath.set(flattenPath + "." + content.format, file);
	}
	function resolveFlattenPath(name, format) {
		return flattenPathToFullPath.get(name + "." + format) ?? name;
	}
	/**
	* try to register as the owner of `node`.
	*
	* when a node is referenced by multiple folders, this determines which folder they should belong to.
	*
	* @returns whether the owner owns the node.
	*/
	function own(ownerPath, node, priority) {
		if (node[SymbolUnfinished]) return false;
		const existing = node[SymbolOwner];
		if (!existing) {
			node[SymbolOwner] = {
				owner: ownerPath,
				priority
			};
			return true;
		}
		if (existing.owner === ownerPath) {
			existing.priority = Math.max(existing.priority, priority);
			return true;
		}
		if (existing.priority >= priority) return false;
		const folder = pathToNode.get(existing.owner);
		if (folder && folder.type === "folder") {
			if (folder.index === node) delete folder.index;
			else {
				const idx = folder.children.indexOf(node);
				if (idx !== -1) folder.children.splice(idx, 1);
			}
		}
		existing.owner = ownerPath;
		existing.priority = priority;
		return true;
	}
	function transferOwner(ownerPath, node) {
		const existing = node[SymbolOwner];
		if (existing) existing.owner = ownerPath;
	}
	function generateId(localId = `_${_nextId++}`) {
		let id = localId;
		if (locale) id = `${locale}:${id}`;
		if (idPrefix) id = `${idPrefix}:${id}`;
		return id;
	}
	function buildPaths(paths, filter, reversed = false) {
		const nodes = [];
		let indexNode;
		for (const path of paths) {
			if (filter && !filter(path)) continue;
			const fileNode = buildFile(path);
			if (fileNode) {
				nodes.push(fileNode);
				if (!indexNode && basename(path, extname(path)) === "index") indexNode = fileNode;
				continue;
			}
			const dirNode = buildFolder(path);
			if (dirNode) nodes.push(dirNode);
		}
		const factor = reversed ? -1 : 1;
		const useName = sortBy === "name";
		return nodes.sort((a, b) => {
			if (a === indexNode) return -100;
			if (b === indexNode) return 100;
			const aT = useName && a[SymbolName] || (a.type === "folder" ? a.$ref.folder : a.$ref);
			const bT = useName && b[SymbolName] || (b.type === "folder" ? b.$ref.folder : b.$ref);
			const aK = a.type === "folder" ? 10 : 0;
			const bK = b.type === "folder" ? 10 : 0;
			return factor * (aT.localeCompare(bT, sortLocales, sortOptions) + (aK - bK));
		});
	}
	function resolveLink(item) {
		const match = link.exec(item);
		if (!match?.groups) return;
		const { icon, url, name, external } = match.groups;
		let node = {
			$id: generateId(),
			type: "page",
			icon,
			name,
			url,
			external: external ? true : void 0
		};
		for (const transformer of transformers) {
			if (!transformer.file) continue;
			node = transformer.file.call(ctx, node);
		}
		return node;
	}
	function resolveSeparator(item) {
		const match = separator.exec(item);
		if (!match?.groups) return;
		let node = {
			$id: generateId(),
			type: "separator",
			icon: match.groups.icon,
			name: match.groups.name
		};
		for (const transformer of transformers) {
			if (!transformer.separator) continue;
			node = transformer.separator.call(ctx, node);
		}
		return node;
	}
	function resolveFolderItem(folderPath, item, outputArray, excludedPaths) {
		if (item === rest || item === restReversed) {
			outputArray.push(item);
			return;
		}
		const separator = resolveSeparator(item);
		if (separator) {
			outputArray.push(separator);
			return;
		}
		const link = resolveLink(item);
		if (link) {
			outputArray.push(link);
			return;
		}
		if (item.startsWith(excludePrefix)) {
			const path = joinPath(folderPath, item.slice(1));
			excludedPaths.add(path);
			excludedPaths.add(resolveFlattenPath(path, "page"));
			return;
		}
		if (item.startsWith(extractPrefix)) {
			const path = joinPath(folderPath, item.slice(3));
			const node = buildFolder(path);
			if (!node) return;
			const children = node.index ? [node.index, ...node.children] : node.children;
			if (own(folderPath, node, 2)) {
				for (const child of children) {
					transferOwner(folderPath, child);
					outputArray.push(child);
				}
				excludedPaths.add(path);
			} else for (const child of children) if (own(folderPath, child, 2)) outputArray.push(child);
			return;
		}
		let path = joinPath(folderPath, item);
		let node = buildFolder(path);
		if (!node) {
			path = resolveFlattenPath(path, "page");
			node = buildFile(path);
		}
		if (!node || !own(folderPath, node, 2)) return;
		outputArray.push(node);
		excludedPaths.add(path);
	}
	function buildFolder(folderPath, isGlobalRoot = false) {
		const cached = pathToNode.get(folderPath);
		if (cached) return cached;
		const files = storage.readDir(folderPath);
		if (!files) return;
		let metaPath = resolveFlattenPath(joinPath(folderPath, "meta"), "meta");
		let meta = storage.read(metaPath);
		if (!meta || meta.format !== "meta") {
			meta = void 0;
			metaPath = void 0;
		}
		const metadata = meta?.data ?? {};
		const isRoot = metadata.root ?? isGlobalRoot;
		let node = {
			type: "folder",
			name: null,
			root: metadata.root,
			defaultOpen: metadata.defaultOpen,
			description: metadata.description,
			collapsible: metadata.collapsible,
			children: [],
			$id: generateId(folderPath),
			$ref: {
				folder: folderPath,
				meta: metaPath
			},
			[SymbolUnfinished]: true
		};
		pathToNode.set(folderPath, node);
		let indexPath;
		if (metadata.pagesIndex) {
			const resolvedPath = resolveFlattenPath(joinPath(folderPath, metadata.pagesIndex), "page");
			const page = buildFile(resolvedPath);
			if (page && own(folderPath, page, 3)) {
				indexPath = resolvedPath;
				node.index = page;
			} else node.index = resolveLink(metadata.pagesIndex);
		} else if (!isRoot) {
			const defaultPath = resolveFlattenPath(joinPath(folderPath, "index"), "page");
			const page = buildFile(defaultPath);
			if (page && own(folderPath, page, 0)) {
				indexPath = defaultPath;
				node.index = page;
			}
		}
		if (metadata.pages) {
			const outputArray = [];
			const excludedPaths = /* @__PURE__ */ new Set();
			for (const item of metadata.pages) resolveFolderItem(folderPath, item, outputArray, excludedPaths);
			if (indexPath) {
				if (excludedPaths.has(indexPath)) delete node.index;
				else excludedPaths.add(indexPath);
			}
			for (const item of outputArray) {
				if (item !== rest && item !== restReversed) {
					node.children.push(item);
					continue;
				}
				const resolvedItem = buildPaths(files, (file) => !excludedPaths.has(file), item === restReversed);
				for (const child of resolvedItem) if (own(folderPath, child, 0)) node.children.push(child);
			}
		} else for (const item of buildPaths(files, indexPath ? (file) => file !== indexPath : void 0)) if (own(folderPath, item, 0)) node.children.push(item);
		node.icon = metadata.icon ?? node.index?.icon;
		node.name = metadata.title ?? node.index?.name;
		node[SymbolName] = metadata.title ?? node.index?.[SymbolName];
		if (!node.name) {
			const folderName = basename(folderPath);
			node.name = pathToName(group.exec(folderName)?.[1] ?? folderName);
		}
		for (const transformer of transformers) {
			if (!transformer.folder) continue;
			node = transformer.folder.call(ctx, node, folderPath, metaPath);
		}
		pathToNode.set(folderPath, node);
		delete node[SymbolUnfinished];
		return node;
	}
	function buildFile(path) {
		const cached = pathToNode.get(path);
		if (cached) return cached;
		const page = storage.read(path);
		if (!page || page.format !== "page") return;
		const { title, description, icon } = page.data;
		let item = {
			$id: generateId(path),
			type: "page",
			name: title ?? pathToName(basename(path, extname(path))),
			description,
			icon,
			url: getUrl(page.slugs, ctx.locale),
			$ref: path,
			[SymbolName]: title
		};
		for (const transformer of transformers) {
			if (!transformer.file) continue;
			item = transformer.file.call(ctx, item, path);
		}
		pathToNode.set(path, item);
		return item;
	}
	const builder = {
		resolveFlattenPath,
		root(id = "root", path = "") {
			const folder = buildFolder(path, true);
			for (const node of pathToNode.values()) {
				delete node[SymbolName];
				delete node[SymbolOwner];
				if (noRef && "$ref" in node) delete node.$ref;
			}
			let root = {
				type: "root",
				$ref: folder?.$ref,
				$id: generateId(id),
				name: folder?.name || "Docs",
				description: folder?.description,
				children: folder ? folder.children : []
			};
			for (const transformer of transformers) {
				if (!transformer.root) continue;
				root = transformer.root.call(ctx, root);
			}
			return root;
		}
	};
	return builder;
}
/**
* Get item name from file name
*
* @param name - file name
*/
function pathToName(name) {
	const result = [];
	for (const c of name) if (result.length === 0) result.push(c.toLocaleUpperCase());
	else if (c === "-") result.push(" ");
	else result.push(c);
	return result.join("");
}
function createPageIndexer({ url }) {
	const pages = /* @__PURE__ */ new Map();
	const pathToMeta = /* @__PURE__ */ new Map();
	const pathToPage = /* @__PURE__ */ new Map();
	const urlToPage = /* @__PURE__ */ new Map();
	return {
		scan(storage, lang) {
			for (const filePath of storage.getFiles()) {
				const item = storage.read(filePath);
				const prefix = lang ? `${lang}.` : ".";
				const path = prefix + filePath;
				if (item.format === "meta") {
					pathToMeta.set(path, {
						type: item.type,
						path: item.path,
						absolutePath: item.absolutePath,
						data: item.data
					});
					continue;
				}
				const page = {
					type: item.type,
					path: item.path,
					absolutePath: item.absolutePath,
					url: url(item.slugs, lang),
					slugs: item.slugs,
					data: item.data,
					locale: lang
				};
				pathToPage.set(path, page);
				pages.set(prefix + page.slugs.join("/"), page);
				urlToPage.set(prefix + page.url, page);
			}
		},
		getPage(path, lang = "") {
			return pathToPage.get(`${lang}.${path}`);
		},
		getPageByUrl(url, lang = "") {
			return urlToPage.get(`${lang}.${url}`);
		},
		getMeta(path, lang = "") {
			return pathToMeta.get(`${lang}.${path}`);
		},
		getPageBySlugs(slugs, lang = "") {
			let page = pages.get(`${lang}.${slugs.join("/")}`);
			if (page) return page;
			page = pages.get(`${lang}.${slugs.map(decodeURI).join("/")}`);
			if (page) return page;
		},
		/** do not filter by language if `lang` is not specified */
		getPages(lang) {
			const out = [];
			for (const [key, value] of pages.entries()) if (lang === void 0 || key.startsWith(`${lang}.`)) out.push(value);
			return out;
		}
	};
}
function createGetUrl(baseUrl, i18n) {
	const baseSlugs = baseUrl.split("/");
	return (slugs, locale) => {
		const hideLocale = i18n?.hideLocale ?? "never";
		let urlLocale;
		if (hideLocale === "never") urlLocale = locale;
		else if (hideLocale === "default-locale" && locale !== i18n?.defaultLanguage) urlLocale = locale;
		const paths = [...baseSlugs, ...slugs];
		if (urlLocale) paths.unshift(urlLocale);
		return `/${paths.filter((v) => v.length > 0).join("/")}`;
	};
}
function loader(...args) {
	const loaderConfig = args.length === 2 ? resolveConfig(args[0], args[1]) : resolveConfig(args[0].source, args[0]);
	const { i18n } = loaderConfig;
	const storage = i18n ? createContentStorageBuilder(loaderConfig).i18n() : createContentStorageBuilder(loaderConfig).single();
	const indexer = createPageIndexer(loaderConfig);
	if (storage instanceof FileSystem) indexer.scan(storage);
	else for (const locale in storage) indexer.scan(storage[locale], locale);
	let pageTrees;
	function getPageTrees() {
		if (pageTrees) return pageTrees;
		const { plugins, url, pageTree: pageTreeConfig } = loaderConfig;
		const transformers = [];
		if (pageTreeConfig?.transformers) transformers.push(...pageTreeConfig.transformers);
		for (const plugin of plugins) if (plugin.transformPageTree) transformers.push(plugin.transformPageTree);
		const options = {
			url,
			...pageTreeConfig,
			transformers
		};
		if (storage instanceof FileSystem) return pageTrees = createPageTreeBuilder(storage, options).root();
		else {
			const out = {};
			for (const locale in storage) out[locale] = createPageTreeBuilder([locale, storage], options).root();
			return pageTrees = out;
		}
	}
	const out = {
		_i18n: i18n,
		get pageTree() {
			return getPageTrees();
		},
		set pageTree(v) {
			pageTrees = v;
		},
		getPageByHref(href, { dir = "", language = i18n?.defaultLanguage } = {}) {
			const [value, hash] = href.split("#", 2);
			let target;
			if (value.startsWith("./") || value.startsWith("../")) {
				let decoded = value;
				try {
					decoded = decodeURI(value);
				} catch {}
				const path = joinPath(dir, decoded);
				target = indexer.getPage(path, language);
			} else target = indexer.getPageByUrl(value, language);
			if (target) return {
				page: target,
				hash
			};
		},
		resolveHref(href, parent) {
			if (href.startsWith("./") || href.startsWith("../")) {
				const target = this.getPageByHref(href, {
					dir: dirname$1(parent.path),
					language: parent.locale
				});
				if (target) return target.hash ? `${target.page.url}#${target.hash}` : target.page.url;
			}
			return href;
		},
		getPages(language) {
			return indexer.getPages(language);
		},
		getLanguages() {
			const list = [];
			if (!i18n) return list;
			for (const language of i18n.languages) list.push({
				language,
				pages: this.getPages(language)
			});
			return list;
		},
		getPage(slugs = [], language = i18n?.defaultLanguage) {
			return indexer.getPageBySlugs(slugs, language);
		},
		getNodeMeta(node, language = i18n?.defaultLanguage) {
			const ref = node.$ref;
			if (!ref?.meta) return;
			return indexer.getMeta(ref.meta, language);
		},
		getNodePage(node, language = i18n?.defaultLanguage) {
			const ref = node.$ref;
			if (!ref) return;
			return indexer.getPage(ref, language);
		},
		getPageTree(locale) {
			if (i18n) {
				const trees = getPageTrees();
				if (locale && trees[locale]) return trees[locale];
				return trees[i18n.defaultLanguage];
			}
			return getPageTrees();
		},
		generateParams(slug, lang) {
			if (i18n) return this.getLanguages().flatMap((entry) => entry.pages.map((page) => ({
				[slug ?? "slug"]: page.slugs,
				[lang ?? "lang"]: entry.language
			})));
			return this.getPages().map((page) => ({ [slug ?? "slug"]: page.slugs }));
		},
		async serializePageTree(tree) {
			const { renderToString } = await import("./server.react-server-CXYXbdGd.js");
			return {
				$fumadocs_loader: "page-tree",
				data: visit(tree, (node) => {
					node = { ...node };
					if ("icon" in node && node.icon) node.icon = renderToString(node.icon);
					if (node.name) node.name = renderToString(node.name);
					if ("children" in node) node.children = [...node.children];
					return node;
				})
			};
		}
	};
	if (isStaticSource(loaderConfig.input)) loaderConfig.input.configureStatic?.({ loader: out });
	else for (const [k, v] of Object.entries(loaderConfig.input)) v.configureStatic?.({
		loader: out,
		source: k
	});
	return out;
}
function resolveConfig(input, { slugs, baseSlugs, icon, plugins = [], baseUrl, url, ...base }) {
	let config = {
		...base,
		url: url ? (...args) => normalizeUrl(url(...args)) : createGetUrl(baseUrl, base.i18n),
		input,
		plugins: buildPlugins([
			icon && iconPlugin(icon),
			...typeof plugins === "function" ? plugins({ typedPlugin: (plugin) => plugin }) : plugins,
			slugsPlugin({
				slugs,
				baseSlugs
			})
		])
	};
	for (const plugin of config.plugins) {
		const result = plugin.config?.(config);
		if (result) config = result;
	}
	return config;
}
var priorityMap = {
	pre: 1,
	default: 0,
	post: -1
};
function buildPlugins(plugins, sort = true) {
	const flatten = [];
	for (const plugin of plugins) if (Array.isArray(plugin)) flatten.push(...buildPlugins(plugin, false));
	else if (plugin) flatten.push(plugin);
	if (sort) return flatten.sort((a, b) => priorityMap[b.enforce ?? "default"] - priorityMap[a.enforce ?? "default"]);
	return flatten;
}
/** content loader API for static & dynamic content sources, with in-memory cache. */
function dynamicLoader(input, options) {
	let cachedLoader;
	const memoryCache = /* @__PURE__ */ new Map();
	async function resolveSources() {
		if (isStaticSource(input) || isDynamicSource(input)) return resolveSource(input);
		const entries = await Promise.all(Object.entries(input).map(async ([k, v]) => [k, await resolveSource(v)]));
		return Object.fromEntries(entries);
	}
	function resolveSource(v) {
		if (isStaticSource(v)) return v;
		const mapFiles = (files) => ({
			baseDir: v.baseDir,
			files,
			configureStatic: v.configureStatic
		});
		if (!v.cache || v.cache === "memory") {
			const cached = memoryCache.get(v);
			if (cached && (cached.expires === void 0 || Date.now() < cached.expires)) return cached.value;
			const value = Promise.resolve(v.files()).then(mapFiles).catch((e) => {
				if (memoryCache.get(v)?.value === value) memoryCache.delete(v);
				throw e;
			});
			memoryCache.set(v, {
				value,
				expires: v.staleTime !== void 0 ? Date.now() + v.staleTime : void 0
			});
			return value;
		}
		return Promise.resolve(v.files()).then(mapFiles);
	}
	const dynamicLoader = {
		get: (0, import_react_react_server.cache)(async () => {
			const resolved = await resolveSources();
			if (cachedLoader && isEqual(cachedLoader.input, resolved)) return cachedLoader.value;
			cachedLoader = {
				input: resolved,
				value: loader(resolved, options)
			};
			return cachedLoader.value;
		}),
		$inferPage: void 0,
		$inferMeta: void 0,
		async revalidate(name) {
			dynamicLoader.invalidate(name);
			if (name === void 0) await resolveSources();
			else if (!isStaticSource(input) && !isDynamicSource(input)) await resolveSource(input[name]);
		},
		invalidate(name) {
			if (isStaticSource(input)) return;
			if (name === void 0) {
				memoryCache.clear();
				if (isDynamicSource(input)) input.invalidate?.();
				else for (const v of Object.values(input)) if (isDynamicSource(v)) v.invalidate?.();
				return;
			}
			if (isDynamicSource(input)) return;
			const s = input[name];
			if (!isDynamicSource(s)) return;
			memoryCache.delete(s);
			s.invalidate?.();
		}
	};
	if (isDynamicSource(input) || isStaticSource(input)) {
		input.configureDynamic?.({ loader: dynamicLoader });
		if (isDynamicSource(input)) input.configure?.(dynamicLoader, {});
	} else for (const [k, v] of Object.entries(input)) {
		v.configureDynamic?.({
			loader: dynamicLoader,
			source: k
		});
		if (isDynamicSource(v)) v.configure?.(dynamicLoader, { source: k });
	}
	return dynamicLoader;
}
function isEqual(a, b) {
	if (isStaticSource(a) && isStaticSource(b)) return isEqualShallow(a.files, b.files);
	if (!isStaticSource(a) && !isStaticSource(b)) return Object.keys(b).every((k) => isEqualShallow(a[k].files, b[k].files));
	return false;
}
//#endregion
//#region node_modules/fumapress/dist/.translations/keys.js
var keys_default = [
	"All Tags(blog tags page)",
	"Back to Home(blog)",
	"Blog(blog)",
	"Copied(blog panel)",
	"Share(blog panel)",
	"Table of Contents(blog panel)",
	"Tag \"{tag}\"(blog tag page)",
	"{count} matching blog posts.(blog tag page)",
	"{count} tags in total.(blog tags page)"
];
//#endregion
//#region node_modules/fumapress/dist/i18n.js
function fumapressTranslations() {
	return { keys: keys_default };
}
//#endregion
//#region node_modules/fumapress/dist/app/plugin.js
var PLUGIN_ORDER = {
	pre: -1,
	post: 1,
	_: 0
};
function flattenPlugins(plugins) {
	const out = [];
	for (const plugin of plugins) {
		if (!plugin) continue;
		if (Array.isArray(plugin)) out.push(...flattenPlugins(plugin));
		else out.push(plugin);
	}
	return out;
}
function sortPlugins(plugins) {
	return plugins.sort((a, b) => PLUGIN_ORDER[a.enforce ?? "_"] - PLUGIN_ORDER[b.enforce ?? "_"]);
}
async function preinitPlugins(preset = "recommended", plugins, env = {}) {
	const flattened = flattenPlugins(plugins);
	flattened.push({
		name: "core:i18n",
		init() {
			if (this.translationsConfig) this.translationsConfig.extend(fumapressTranslations());
		}
	}, {
		name: "core:disable-search-if-needed",
		enforce: "post",
		init() {
			const data = this.data["core:provider"] ??= {};
			(data.transformers ??= []).push((props) => {
				props.search ??= { enabled: false };
				return props;
			});
		}
	});
	sortPlugins(flattened);
	const finalized = [];
	const finalizedNames = /* @__PURE__ */ new Set();
	for (const plugin of flattened) {
		if (plugin.preinit && await plugin.preinit({
			finalized,
			original: flattened
		}) === false) continue;
		finalized.push(plugin);
		if (plugin.name) finalizedNames.add(plugin.name);
	}
	if (preset === "recommended") {
		if (!finalizedNames.has("core:sitemap")) finalized.push((await import("./sitemap-oRCMTdel.js")).sitemapPlugin());
		if (!finalizedNames.has("core:robots")) finalized.push((await import("./robots-C-Ja-Vxk.js")).robotsPlugin());
		if (!finalizedNames.has("core:llms.txt")) finalized.push((await import("./llms.txt-MDcrWiPm.js")).llmsPlugin());
		if (!finalizedNames.has("core:rss")) finalized.push((await import("./rss-57u7ew8G.js")).rssPlugin());
		if (!finalizedNames.has("core:flexsearch") && !finalizedNames.has("core:orama-search")) finalized.push((await import("./flexsearch-DdKRiNNw.js")).flexsearchPlugin());
		if (!env._debug_no_takumi && !finalizedNames.has("core:takumi")) finalized.push((await import("./takumi-Bc9nRM-K.js")).takumiPlugin());
		if (!finalized.some((plugin) => plugin.name?.startsWith("image:"))) {
			if (env.mode !== "static" && hasSharp()) finalized.push((await import("./self-hosted-DxmZWNwn.js")).imagePlugin());
		}
	}
	return sortPlugins(finalized);
}
function hasSharp() {
	try {
		import.meta.resolve("sharp");
		return true;
	} catch {
		return false;
	}
}
//#endregion
//#region node_modules/fumapress/dist/lib/fs.js
/**
* Returns the absolute path to the root directory of the current git repository.
*/
function getGitRootDir(startDir = process.cwd()) {
	let dir = startDir;
	while (true) {
		if (existsSync(join(dir, ".git"))) return dir;
		const parent = dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	return null;
}
//#endregion
//#region node_modules/fumapress/dist/lib/git.js
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
/**
* Brand icon paths from Simple Icons (https://simpleicons.org, CC0-1.0).
*/
var providers = {
	github: {
		label: "GitHub",
		url: "https://github.com",
		icon: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
	},
	gitlab: {
		label: "GitLab",
		url: "https://gitlab.com",
		icon: "m23.6004 9.5927-.0337-.0862L20.3.9814a.851.851 0 0 0-.3362-.405.8748.8748 0 0 0-.9997.0539.8748.8748 0 0 0-.29.4399l-2.2055 6.748H7.5375l-2.2057-6.748a.8573.8573 0 0 0-.29-.4412.8748.8748 0 0 0-.9997-.0537.8585.8585 0 0 0-.3361.4049L.4332 9.5015l-.0325.0862a6.0657 6.0657 0 0 0 2.0119 7.0105l.0113.0087.03.0213 4.976 3.7264 2.4617 1.8633 1.4995 1.1321a1.0085 1.0085 0 0 0 1.2197 0l1.4995-1.1321 2.4616-1.8633 5.006-3.7489.0125-.01a6.0682 6.0682 0 0 0 2.0099-7.003z"
	},
	bitbucket: {
		label: "Bitbucket",
		url: "https://bitbucket.org",
		icon: "M.778 1.213a.768.768 0 0 0-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 0 0 .77-.646l3.27-20.03a.768.768 0 0 0-.768-.891zM14.52 15.53H9.522L8.17 8.466h7.561z"
	}
};
var defaultGitProviderUrls = {
	github: providers.github.url,
	gitlab: providers.gitlab.url,
	bitbucket: providers.bitbucket.url
};
/** URL of the repository page */
function getRepoUrl(git) {
	return `${git.url}/${git.user}/${git.repo}`;
}
/**
* A navbar icon link pointing to the repository, same as the one Fumadocs adds for `githubUrl`.
*/
function getRepoLinkItem(git) {
	const { label, icon } = providers[git.provider];
	return {
		type: "icon",
		url: getRepoUrl(git),
		text: label,
		label,
		icon: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("svg", {
			role: "img",
			viewBox: "0 0 24 24",
			fill: "currentColor",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("path", { d: icon })
		}),
		external: true
	};
}
/**
* URL of a file in the repository.
*
* @param path - file path relative to the root directory of git repo, using `/` as separator.
*/
function getFileUrl(git, path) {
	const repo = getRepoUrl(git);
	switch (git.provider) {
		case "gitlab": return `${repo}/-/blob/${git.branch}/${path}`;
		case "bitbucket": return `${repo}/src/${git.branch}/${path}`;
		default: return `${repo}/blob/${git.branch}/${path}`;
	}
}
//#endregion
//#region node_modules/fumapress/dist/node_modules/.pnpm/@fastify_deepmerge@3.2.1/node_modules/@fastify/deepmerge/index.js
var require_deepmerge = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const JSON_PROTO = Object.getPrototypeOf({});
	function defaultIsMergeableObjectFactory() {
		return function defaultIsMergeableObject(value) {
			return typeof value === "object" && value !== null && !(value instanceof RegExp) && !(value instanceof Date);
		};
	}
	function deepmergeConstructor(options) {
		function isNotPrototypeKey(value) {
			return value !== "constructor" && value !== "prototype" && value !== "__proto__";
		}
		function cloneArray(value) {
			let i = 0;
			const il = value.length;
			const result = new Array(il);
			for (; i < il; ++i) result[i] = clone(value[i]);
			return result;
		}
		function cloneObject(target) {
			const result = {};
			if (cloneProtoObject && Object.getPrototypeOf(target) !== JSON_PROTO) return cloneProtoObject(target);
			const targetKeys = getKeys(target);
			let i, il, key;
			for (i = 0, il = targetKeys.length; i < il; ++i) isNotPrototypeKey(key = targetKeys[i]) && (result[key] = clone(target[key]));
			return result;
		}
		function concatArrays(target, source) {
			const tl = target.length;
			const sl = source.length;
			let i = 0;
			const result = new Array(tl + sl);
			for (; i < tl; ++i) result[i] = clone(target[i]);
			for (i = 0; i < sl; ++i) result[i + tl] = clone(source[i]);
			return result;
		}
		const propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
		function getSymbolsAndKeys(value) {
			const result = Object.keys(value);
			const keys = Object.getOwnPropertySymbols(value);
			for (let i = 0, il = keys.length; i < il; ++i) propertyIsEnumerable.call(value, keys[i]) && result.push(keys[i]);
			return result;
		}
		const getKeys = options?.symbols ? getSymbolsAndKeys : Object.keys;
		const cloneProtoObject = typeof options?.cloneProtoObject === "function" ? options.cloneProtoObject : void 0;
		const isMergeableObject = typeof options?.isMergeableObject === "function" ? options.isMergeableObject : defaultIsMergeableObjectFactory();
		const onlyDefinedProperties = options?.onlyDefinedProperties === true;
		function isPrimitive(value) {
			return typeof value !== "object" || value === null;
		}
		const mergeArray = options && typeof options.mergeArray === "function" ? options.mergeArray({
			clone,
			deepmerge: _deepmerge,
			getKeys,
			isMergeableObject
		}) : concatArrays;
		function clone(entry) {
			return isMergeableObject(entry) ? Array.isArray(entry) ? cloneArray(entry) : cloneObject(entry) : entry;
		}
		function mergeObject(target, source) {
			const result = {};
			const targetKeys = getKeys(target);
			const sourceKeys = getKeys(source);
			let i, il, key;
			for (i = 0, il = targetKeys.length; i < il; ++i) isNotPrototypeKey(key = targetKeys[i]) && sourceKeys.indexOf(key) === -1 && (result[key] = clone(target[key]));
			for (i = 0, il = sourceKeys.length; i < il; ++i) {
				if (!isNotPrototypeKey(key = sourceKeys[i])) continue;
				if (key in target) {
					if (targetKeys.indexOf(key) !== -1) {
						if (cloneProtoObject && isMergeableObject(source[key]) && Object.getPrototypeOf(source[key]) !== JSON_PROTO) result[key] = cloneProtoObject(source[key]);
						else result[key] = _deepmerge(target[key], source[key]);
					}
				} else {
					if (onlyDefinedProperties && typeof source[key] === "undefined") continue;
					result[key] = clone(source[key]);
				}
			}
			return result;
		}
		function _deepmerge(target, source) {
			if (onlyDefinedProperties && typeof source === "undefined") return clone(target);
			const sourceIsArray = Array.isArray(source);
			const targetIsArray = Array.isArray(target);
			if (isPrimitive(source)) return source;
			else if (!isMergeableObject(target)) return clone(source);
			else if (sourceIsArray && targetIsArray) return mergeArray(target, source);
			else if (sourceIsArray !== targetIsArray) return clone(source);
			else return mergeObject(target, source);
		}
		function _deepmergeAll() {
			switch (arguments.length) {
				case 0: return {};
				case 1: return clone(arguments[0]);
				case 2: return _deepmerge(arguments[0], arguments[1]);
			}
			let result;
			for (let i = 0, il = arguments.length; i < il; ++i) result = _deepmerge(result, arguments[i]);
			return result;
		}
		return options?.all ? _deepmergeAll : _deepmerge;
	}
	module.exports = deepmergeConstructor;
	module.exports.default = deepmergeConstructor;
	module.exports.deepmerge = deepmergeConstructor;
	Object.defineProperty(module.exports, "isMergeableObject", { get: defaultIsMergeableObjectFactory });
}));
require_deepmerge();
//#endregion
//#region node_modules/fumapress/dist/app/context.js
var import_deepmerge = /* @__PURE__ */ __toESM(require_deepmerge(), 1);
var appContext = new AsyncLocalStorage({ name: "fumapress:core" });
function getPressContext() {
	const store = appContext.getStore();
	if (!store) throw new Error("[Fumapress] Missing server context for Fumapress, make sure to use the middlewares from createRouter()");
	return store;
}
async function initApp(builder) {
	const config = builder.get();
	const { translations, site, defaultLayoutProps, mode = "default", renderNotFound = (await import("./not-found-CP9WeEdw.js")).DefaultNotFound, renderPage = (await import("./docs-Cn6J_qRk.js")).createDocsLayoutPage(), renderRoot = (await import("./root-Dna8FF2Z.js")).createRootLayout() } = config;
	const ctx = {
		$context: void 0,
		getLoader() {
			throw new Error("[Fumapress] Content loader is not initialized yet, please access it after init()");
		},
		revalidateLoader: () => Promise.resolve(void 0),
		invalidateLoader: () => void 0,
		i18nConfig: translations && "config" in translations ? translations.config : config.i18n,
		defaultLayoutProps: async (opts) => {
			const { name, git } = ctx.siteConfig;
			const base = typeof defaultLayoutProps === "function" ? await defaultLayoutProps.call(ctx, opts) : defaultLayoutProps;
			const repo = git && !base?.githubUrl ? git : void 0;
			return {
				...base,
				githubUrl: base?.githubUrl ?? (repo?.provider === "github" ? getRepoUrl(repo) : void 0),
				links: repo && repo.provider !== "github" ? [...base?.links ?? [], getRepoLinkItem(repo)] : base?.links,
				nav: {
					...base?.nav,
					title: base?.nav?.title ?? name
				}
			};
		},
		renderNotFound,
		renderPage,
		renderRoot,
		plugins: await preinitPlugins(config.preset, config.plugins ?? [], { mode }),
		adapters: config.adapters ?? [],
		data: {},
		translationsConfig: translations,
		mode,
		siteConfig: {
			name: site?.name ?? "Fumapress",
			baseUrl: site?.baseUrl ?? getDefaultBaseUrl(),
			git: site?.git ? {
				...site.git,
				provider: site.git.provider ?? "github",
				url: (site.git.url ?? defaultGitProviderUrls[site.git.provider ?? "github"]).replace(/\/$/, ""),
				rootDir: site.git.rootDir ?? getGitRootDir() ?? process.cwd()
			} : void 0
		},
		...hooks(config)
	};
	for (const plugin of ctx.plugins) await plugin.init?.call(ctx);
	let loaderOptions = {
		baseUrl: "/",
		i18n: ctx.i18nConfig,
		...config.loaderOptions
	};
	for (const plugin of ctx.plugins) {
		if (!plugin.configureLoader) continue;
		loaderOptions = await plugin.configureLoader.call(ctx, loaderOptions);
	}
	const source = dynamicLoader(config.content, loaderOptions);
	ctx.revalidateLoader = source.revalidate.bind(source);
	ctx.invalidateLoader = source.invalidate.bind(source);
	ctx.getLoader = () => {
		if (config.loaderOptions?.alwaysRevalidate) source.invalidate();
		return source.get();
	};
	for (const plugin of ctx.plugins) await plugin.configure?.call(ctx);
	return ctx;
}
function hooks(config) {
	const rootMetaInterceptors = [];
	const pageMetaInterceptors = [];
	return {
		interceptPageMeta(interceptor) {
			pageMetaInterceptors.push(interceptor);
		},
		interceptRootMeta(interceptor) {
			rootMetaInterceptors.push(interceptor);
		},
		renderRootMeta() {
			const ctx = getPressContext();
			function next(i) {
				const interceptor = rootMetaInterceptors[i];
				if (!interceptor) return config.meta?.root?.call(ctx);
				return interceptor({ next: () => next(i + 1) });
			}
			return next(0);
		},
		renderPageMeta(page) {
			const context = getPressContext();
			function next(i) {
				const interceptor = pageMetaInterceptors[i];
				if (!interceptor) return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("title", { children: page.data.title }),
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
						property: "og:title",
						content: page.data.title
					}),
					page.data.description && /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
						property: "og:description",
						content: page.data.description
					}),
					config.meta?.page?.call(context, page)
				] });
				return interceptor({
					page,
					next: () => next(i + 1)
				});
			}
			return next(0);
		},
		async getPageCreatedAt(page) {
			const ctx = getPressContext();
			for (const adapter of ctx.adapters) {
				const date = await adapter["core:get-creation-date"]?.call(ctx, page);
				if (date !== void 0) return date;
			}
		},
		async getPageLastModified(page) {
			const ctx = getPressContext();
			for (const adapter of ctx.adapters) {
				const date = await adapter["core:get-modified-date"]?.call(ctx, page);
				if (date !== void 0) return date;
			}
		},
		async getPageBody(page) {
			const ctx = getPressContext();
			for (const adapter of ctx.adapters) {
				const body = await adapter["core:get-body"]?.call(ctx, page);
				if (body !== void 0) return body;
			}
		},
		async getPageToc(page) {
			const ctx = getPressContext();
			for (const adapter of ctx.adapters) {
				const toc = await adapter["core:render-toc"]?.call(ctx, page);
				if (toc !== void 0) return toc;
			}
		},
		getFileUrl(absolutePath) {
			const { git } = getPressContext().siteConfig;
			if (!git) return;
			const p = path.relative(git.rootDir, absolutePath).replaceAll(path.sep, "/");
			if (p.startsWith("../")) return;
			return getFileUrl(git, p);
		}
	};
}
function getDefaultBaseUrl() {
	console.warn("[Fumapress] It is recommended to specify \"site.baseUrl\" in your config for better SEO; sitemap and RSS will fall back to relative URLs.");
}
var deepmerge = (0, import_deepmerge.default)({
	all: true,
	onlyDefinedProperties: true,
	isMergeableObject(value) {
		if ((0, import_react_react_server.isValidElement)(value)) return false;
		return import_deepmerge.default.isMergeableObject(value);
	}
});
//#endregion
export { initApp as i, deepmerge as n, getPressContext as r, appContext as t };
