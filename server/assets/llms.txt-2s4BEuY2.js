import { t as require_react_react_server } from "./react.react-server-BSR27ksj.js";
import { n as unstable_notFound } from "./server-BJVqT1VK.js";
import { l as __commonJSMin } from "./utils-DEVq3cEC-DMfnMxy1.js";
import { t as appContext } from "./context-B725id1P.js";
import { n as joinPathname } from "./pathname-BkvvRSn7.js";
import { n as renderRoute } from "./server-YJsb-2Zs.js";
//#region node_modules/fumadocs-core/dist/source/llms.js
var import_react_react_server = require_react_react_server();
function llms(loader, config = {}) {
	const { TAB = "  ", renderName = (node, ctx) => {
		if (node.type === "page") {
			const page = loader.getNodePage(node, ctx.lang);
			if (page?.data.title) return page.data.title;
		} else if (node.type !== "separator") {
			const meta = loader.getNodeMeta(node, ctx.lang);
			if (meta?.data.title) return meta.data.title;
		}
		return typeof node.name === "string" ? node.name : "";
	}, renderDescription = (node, ctx) => {
		if (node.type === "page") {
			const page = loader.getNodePage(node, ctx.lang);
			if (page?.data.description) return page.data.description;
		} else {
			const meta = loader.getNodeMeta(node, ctx.lang);
			if (meta?.data.description) return meta.data.description;
		}
		return typeof node.description === "string" ? node.description : "";
	} } = config;
	function formatListItem(name, description, indent) {
		const prefix = TAB.repeat(indent);
		description = description.trim();
		if (description.length > 0) return `${prefix}- ${name}: ${description}`;
		return `${prefix}- ${name}`;
	}
	function formatNode(node, indent, ctx) {
		switch (node.type) {
			case "page": return formatListItem(formatMarkdownLink(renderName(node, ctx), node.url), renderDescription(node, ctx), indent);
			case "folder": {
				const out = [];
				out.push(formatListItem(renderName(node, ctx), renderDescription(node, ctx), indent));
				if (node.index) out.push(formatNode(node.index, indent + 1, ctx));
				for (const child of node.children) out.push(formatNode(child, indent + 1, ctx));
				return out.join("\n");
			}
			case "separator": return "\n" + formatListItem(`**${renderName(node, ctx) || "Separator"}**`, "", indent);
		}
	}
	function index(lang) {
		if (loader._i18n && lang === void 0) {
			const { languages } = loader._i18n;
			return languages.map(index).join("\n\n");
		}
		const pageTree = loader.getPageTree(lang);
		const out = [];
		const ctx = { lang };
		out.push(`# ${renderName(pageTree, ctx)}`, "");
		const description = renderDescription(pageTree, ctx);
		if (description) out.push(`> ${description}`, "");
		for (const child of pageTree.children) out.push(formatNode(child, 0, ctx));
		return out.join("\n");
	}
	return {
		/**
		* generate `llms.txt` content in Markdown format.
		*
		* use `indexNode(node)` instead for more control (e.g. add extra sections to output).
		*/
		index,
		/**
		* generate `llms.txt` content for a single page tree node.
		*/
		indexNode(node, lang) {
			return formatNode(node, 0, { lang });
		}
	};
}
function formatMarkdownLink(title, url) {
	return `[${title.replace(/([[\]])/g, "\\$1")}](${url.replace(/([()])/g, "\\$1")})`;
}
(/* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PathError = exports.TokenData = void 0;
	exports.compile = compile;
	exports.match = match;
	const DEFAULT_DELIMITER = "/";
	const NOOP_VALUE = (value) => value;
	const ID_START = /^[$_\p{ID_Start}]$/u;
	const ID_CONTINUE = /^[$\u200c\u200d\p{ID_Continue}]$/u;
	/**
	* Escape a regular expression string.
	*/
	function escape(str) {
		return str.replace(/[.+*?^${}()[\]|/\\]/g, "\\$&");
	}
	/**
	* Tokenized path instance.
	*/
	var TokenData = class {
		constructor(tokens, originalPath) {
			this.tokens = tokens;
			this.originalPath = originalPath;
		}
	};
	exports.TokenData = TokenData;
	/**
	* ParseError is thrown when there is an error processing the path.
	*/
	var PathError = class extends TypeError {
		constructor(message, originalPath) {
			let text = message;
			if (originalPath) text += `: ${originalPath}`;
			text += `; visit https://git.new/pathToRegexpError for info`;
			super(text);
			this.originalPath = originalPath;
		}
	};
	exports.PathError = PathError;
	/**
	* Parse a string for the raw tokens.
	*/
	function parse(str, options = {}) {
		const { encodePath = NOOP_VALUE } = options;
		const chars = [...str];
		let index = 0;
		function consumeUntil(end) {
			const output = [];
			let path = "";
			function writePath() {
				if (!path) return;
				output.push({
					type: "text",
					value: encodePath(path)
				});
				path = "";
			}
			while (index < chars.length) {
				const value = chars[index++];
				if (value === end) {
					writePath();
					return output;
				}
				if (value === "\\") {
					if (index === chars.length) throw new PathError(`Unexpected end after \\ at index ${index}`, str);
					path += chars[index++];
					continue;
				}
				if (value === ":" || value === "*") {
					const type = value === ":" ? "param" : "wildcard";
					let name = "";
					if (ID_START.test(chars[index])) do
						name += chars[index++];
					while (ID_CONTINUE.test(chars[index]));
					else if (chars[index] === "\"") {
						let quoteStart = index;
						while (index < chars.length) {
							if (chars[++index] === "\"") {
								index++;
								quoteStart = 0;
								break;
							}
							if (chars[index] === "\\") index++;
							name += chars[index];
						}
						if (quoteStart) throw new PathError(`Unterminated quote at index ${quoteStart}`, str);
					}
					if (!name) throw new PathError(`Missing parameter name at index ${index}`, str);
					writePath();
					output.push({
						type,
						name
					});
					continue;
				}
				if (value === "{") {
					writePath();
					output.push({
						type: "group",
						tokens: consumeUntil("}")
					});
					continue;
				}
				if (value === "}" || value === "(" || value === ")" || value === "[" || value === "]" || value === "+" || value === "?" || value === "!") throw new PathError(`Unexpected ${value} at index ${index - 1}`, str);
				path += value;
			}
			if (end) throw new PathError(`Unexpected end at index ${index}, expected ${end}`, str);
			writePath();
			return output;
		}
		return new TokenData(consumeUntil(""), str);
	}
	/**
	* Compile a string to a template function for the path.
	*/
	function compile(path, options = {}) {
		const { encode = encodeURIComponent, delimiter = DEFAULT_DELIMITER } = options;
		const fn = tokensToFunction((typeof path === "object" ? path : parse(path, options)).tokens, delimiter, encode);
		return function path(params = {}) {
			const missing = [];
			const path = fn(params, missing);
			if (missing.length) throw new TypeError(`Missing parameters: ${missing.join(", ")}`);
			return path;
		};
	}
	function tokensToFunction(tokens, delimiter, encode) {
		const encoders = tokens.map((token) => tokenToFunction(token, delimiter, encode));
		return (data, missing) => {
			let result = "";
			for (const encoder of encoders) result += encoder(data, missing);
			return result;
		};
	}
	/**
	* Convert a single token into a path building function.
	*/
	function tokenToFunction(token, delimiter, encode) {
		if (token.type === "text") return () => token.value;
		if (token.type === "group") {
			const fn = tokensToFunction(token.tokens, delimiter, encode);
			return (data, missing) => {
				const len = missing.length;
				const value = fn(data, missing);
				if (missing.length === len) return value;
				missing.length = len;
				return "";
			};
		}
		const encodeValue = encode || NOOP_VALUE;
		if (token.type === "wildcard" && encode !== false) return (data, missing) => {
			const value = data[token.name];
			if (value == null) {
				missing.push(token.name);
				return "";
			}
			if (!Array.isArray(value) || value.length === 0) throw new TypeError(`Expected "${token.name}" to be a non-empty array`);
			let result = "";
			for (let i = 0; i < value.length; i++) {
				if (typeof value[i] !== "string") throw new TypeError(`Expected "${token.name}/${i}" to be a string`);
				if (i > 0) result += delimiter;
				result += encodeValue(value[i]);
			}
			return result;
		};
		return (data, missing) => {
			const value = data[token.name];
			if (value == null) {
				missing.push(token.name);
				return "";
			}
			if (typeof value !== "string") throw new TypeError(`Expected "${token.name}" to be a string`);
			return encodeValue(value);
		};
	}
	/**
	* Transform a path into a match function.
	*/
	function match(path, options = {}) {
		const { decode = decodeURIComponent, delimiter = DEFAULT_DELIMITER } = options;
		const { regexp, keys } = pathToRegexp(path, options);
		const decoders = keys.map((key) => {
			if (decode === false) return NOOP_VALUE;
			if (key.type === "param") return decode;
			return (value) => value.split(delimiter).map(decode);
		});
		return function match(input) {
			const m = regexp.exec(input);
			if (!m) return false;
			const path = m[0];
			const params = Object.create(null);
			for (let i = 1; i < m.length; i++) {
				if (m[i] === void 0) continue;
				const key = keys[i - 1];
				const decoder = decoders[i - 1];
				params[key.name] = decoder(m[i]);
			}
			return {
				path,
				params
			};
		};
	}
	/**
	* Transform a path into a regular expression and capture keys.
	*/
	function pathToRegexp(path, options = {}) {
		const { delimiter = DEFAULT_DELIMITER, end = true, sensitive = false, trailing = true } = options;
		const keys = [];
		let source = "";
		let combinations = 0;
		function process(path) {
			if (Array.isArray(path)) {
				for (const p of path) process(p);
				return;
			}
			const data = typeof path === "object" ? path : parse(path, options);
			flatten(data.tokens, 0, [], (tokens) => {
				if (combinations >= 256) throw new PathError("Too many path combinations", data.originalPath);
				if (combinations > 0) source += "|";
				source += toRegExpSource(tokens, delimiter, keys, data.originalPath);
				combinations++;
			});
		}
		process(path);
		let pattern = `^(?:${source})`;
		if (trailing) pattern += "(?:" + escape(delimiter) + "$)?";
		pattern += end ? "$" : "(?=" + escape(delimiter) + "|$)";
		return {
			regexp: new RegExp(pattern, sensitive ? "" : "i"),
			keys
		};
	}
	/**
	* Generate a flat list of sequence tokens from the given tokens.
	*/
	function flatten(tokens, index, result, callback) {
		while (index < tokens.length) {
			const token = tokens[index++];
			if (token.type === "group") {
				const len = result.length;
				flatten(token.tokens, 0, result, (seq) => flatten(tokens, index, seq, callback));
				result.length = len;
				continue;
			}
			result.push(token);
		}
		callback(result);
	}
	/**
	* Transform a flat sequence of tokens into a regular expression.
	*/
	function toRegExpSource(tokens, delimiter, keys, originalPath) {
		let result = "";
		let backtrack = "";
		let wildcardBacktrack = "";
		let prevCaptureType = 0;
		let hasSegmentCapture = 0;
		let index = 0;
		function hasInSegment(index, type) {
			while (index < tokens.length) {
				const token = tokens[index++];
				if (token.type === type) return true;
				if (token.type === "text") {
					if (token.value.includes(delimiter)) break;
				}
			}
			return false;
		}
		function peekText(index) {
			let result = "";
			while (index < tokens.length) {
				const token = tokens[index++];
				if (token.type !== "text") break;
				result += token.value;
			}
			return result;
		}
		while (index < tokens.length) {
			const token = tokens[index++];
			if (token.type === "text") {
				result += escape(token.value);
				backtrack += token.value;
				if (prevCaptureType === 2) wildcardBacktrack += token.value;
				if (token.value.includes(delimiter)) hasSegmentCapture = 0;
				continue;
			}
			if (token.type === "param" || token.type === "wildcard") {
				if (prevCaptureType && !backtrack) throw new PathError(`Missing text before "${token.name}" ${token.type}`, originalPath);
				if (token.type === "param") {
					result += hasSegmentCapture & 2 ? `(${negate(delimiter, backtrack)}+)` : hasInSegment(index, "wildcard") ? `(${negate(delimiter, peekText(index))}+)` : hasSegmentCapture & 1 ? `(${negate(delimiter, backtrack)}+|${escape(backtrack)})` : `(${negate(delimiter, "")}+)`;
					hasSegmentCapture |= prevCaptureType = 1;
				} else {
					result += hasSegmentCapture & 2 ? `(${negate(backtrack, "")}+)` : wildcardBacktrack ? `(${negate(wildcardBacktrack, "")}+|${negate(delimiter, "")}+)` : `([^]+)`;
					wildcardBacktrack = "";
					hasSegmentCapture |= prevCaptureType = 2;
				}
				keys.push(token);
				backtrack = "";
				continue;
			}
			throw new TypeError(`Unknown token type: ${token.type}`);
		}
		return result;
	}
	/**
	* Block backtracking on previous text/delimiter.
	*/
	function negate(a, b) {
		if (b.length > a.length) return negate(b, a);
		if (a === b) b = "";
		if (b.length > 1) return `(?:(?!${escape(a)}|${escape(b)})[^])`;
		if (a.length > 1) return `(?:(?!${escape(a)})[^${escape(b)}])`;
		return `[^${escape(a + b)}]`;
	}
})))();
/**
* Parse an `Accept` header into its media types and quality values.
*
* Media types the client didn't rank explicitly default to `q=1`.
*/
function parseAccept(header) {
	const entries = [];
	for (const section of header.split(",")) {
		const [rawMediaType, ...params] = section.split(";");
		const mediaType = rawMediaType.trim().toLowerCase();
		if (mediaType.length === 0) continue;
		let quality = 1;
		for (const param of params) {
			const separator = param.indexOf("=");
			if (separator === -1 || param.slice(0, separator).trim().toLowerCase() !== "q") continue;
			const parsed = Number.parseFloat(param.slice(separator + 1));
			if (!Number.isNaN(parsed)) quality = parsed;
		}
		entries.push({
			mediaType,
			quality
		});
	}
	return entries;
}
function isMarkdownPreferred(request, options) {
	const { markdownMediaTypes = [
		"text/plain",
		"text/markdown",
		"text/x-markdown"
	] } = options ?? {};
	const accept = request.headers.get("accept");
	if (!accept) return false;
	let markdown = 0;
	let html = 0;
	for (const { mediaType, quality } of parseAccept(accept)) {
		if (quality <= 0) continue;
		if (markdownMediaTypes.includes(mediaType)) markdown = Math.max(markdown, quality);
		else if (mediaType === "text/html" || mediaType === "text/*" || mediaType === "*/*") html = Math.max(html, quality);
	}
	return markdown > 0 && markdown >= html;
}
//#endregion
//#region node_modules/fumapress/dist/plugins/llms.txt.js
function llmsPlugin(options = {}) {
	const { autoRedirect = true, routes = "content", getLLMText: _getLLMText = async function getLLMTextDefault(page) {
		for (const adapter of this.adapters) {
			const txt = await adapter["core:get-text"]?.call(this, page);
			if (txt !== void 0) return `# ${page.data.title} (${page.url})\n\n${txt}`;
		}
	} } = options;
	function markdownResponse(txt) {
		return new Response(txt, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
	}
	function withMd(pathname) {
		return pathname === "/" ? "/index.md" : pathname + ".md";
	}
	function initTransformers(data) {
		data.transformers ??= [];
		data.transformers.push(({ data, page }) => {
			data.markdownUrl ??= withMd(page.url);
			return data;
		});
	}
	let includedPages = [];
	let mocked_createPage;
	return {
		name: "core:llms.txt",
		enforce: "post",
		init() {
			initTransformers(this.data["core:docs-layout"] ??= {});
			initTransformers(this.data["core:notebook-layout"] ??= {});
			initTransformers(this.data["core:glass-layout"] ??= {});
		},
		createMiddlewares({ app }) {
			if (this.mode === "static") return;
			const middlewares = [];
			if (autoRedirect) middlewares.push(async (c, next) => {
				const { req } = c;
				if (req.method !== "GET" || req.path.endsWith(".md")) return next();
				if (isMarkdownPreferred(req.raw)) {
					const url = new URL(withMd(req.path), req.url);
					const res = await app.fetch(new Request(url));
					if (res.ok) {
						res.headers.append("Vary", "Accept");
						return res;
					}
				}
				await next();
				if (c.res.headers.get("Content-Type")?.startsWith("text/html")) c.res.headers.append("Vary", "Accept");
			});
			middlewares.push(async (c, next) => {
				const { req } = c;
				if (req.method !== "GET" || !req.path.endsWith(".md")) return next();
				await next();
				if (c.res.ok && c.res.headers.get("Content-Type")?.startsWith("text/markdown")) return;
				const url = new URL(joinPathname("_llms.txt", req.path === "/index.md" ? "" : req.path.replace(/\.md$/, "")), req.url);
				const res = await app.fetch(new Request(url));
				if (!res.ok) return;
				c.res = void 0;
				c.res = res;
			});
			return middlewares;
		},
		prepareCreatePages(fns) {
			mocked_createPage = fns.createPage;
			includedPages = [];
			fns.createPage = (page) => {
				if (routes === "all" && page.component) includedPages.push(page);
				return mocked_createPage(page);
			};
		},
		async createPages(fns) {
			fns.createPage = mocked_createPage;
			const renderMode = this.mode === "default" ? "static" : this.mode;
			const getLLMText = _getLLMText.bind(this);
			const renderPage = (page, pathname, params) => renderRoute((0, import_react_react_server.createElement)(page.component, {
				...params,
				path: pathname
			}));
			fns.createApiIsomorphic({
				render: renderMode,
				path: "/llms.txt",
				handler: async () => {
					const source = await this.getLoader();
					return new Response(llms(source).index());
				}
			});
			fns.createApiIsomorphic({
				render: renderMode,
				path: "/llms-full.txt",
				handler: async () => {
					const source = await this.getLoader();
					const scanned = await Promise.all(source.getPages().map(getLLMText));
					return new Response(scanned.filter((item) => item !== void 0).join("\n\n"));
				}
			});
			const dynamicPages = [];
			const staticPages = [];
			if (routes === "all") {
				for (const page of includedPages) {
					if (page.exactPath) continue;
					if (page.render === "dynamic") {
						dynamicPages.push({
							...precompileRoutePath(page.path),
							...page
						});
						continue;
					}
					const segments = page.path.split("/").filter(Boolean);
					const entries = segments.some((seg) => seg.startsWith("[")) ? page.staticPaths ?? [] : [[]];
					for (const entry of entries) staticPages.push({
						...expandStaticPath(segments, typeof entry === "string" ? [entry] : entry),
						page
					});
				}
				dynamicPages.sort((a, b) => {
					if (a.length === 0 || b.length === 0) return a.length - b.length;
					return b.length - a.length || a.priority - b.priority;
				});
			}
			if (this.mode === "dynamic" || this.mode === "default") {
				const handler = async (_req, { params }) => {
					const slugs = params.slugs ?? [];
					if (this.mode === "dynamic") {
						const source = await this.getLoader();
						const page = this.i18nConfig ? source.getPage(slugs.slice(1), slugs[0]) : source.getPage(slugs);
						if (page) return markdownResponse(await getLLMText(page) ?? "");
					}
					const pathname = "/" + slugs.join("/");
					for (const page of dynamicPages) {
						const routeParams = matchRoutePath(page, pathname);
						if (!routeParams) continue;
						const res = await renderPage(page, pathname, routeParams);
						if (res) return markdownResponse(res);
						break;
					}
					unstable_notFound();
				};
				fns.createApiIsomorphic({
					render: "dynamic",
					path: "/_llms.txt",
					handler
				});
				fns.createApiIsomorphic({
					render: "dynamic",
					path: "/_llms.txt/[...slugs]",
					handler
				});
			}
			const mdPaths = /* @__PURE__ */ new Set();
			if (this.mode === "static" || this.mode === "default") {
				const staticPaths = [];
				for (const page of (await this.getLoader()).getPages()) {
					const p = [page.locale, ...page.slugs].filter(Boolean);
					if (p.length === 0) p.push("index.md");
					else p[p.length - 1] += ".md";
					staticPaths.push(p);
					mdPaths.add("/" + p.join("/"));
				}
				fns.createApiIsomorphic({
					render: "static",
					path: "/[...slugs]",
					staticPaths,
					handler: async (_req, { params }) => {
						const source = await this.getLoader();
						const slugs = params.slugs;
						if (slugs.length === 0) unstable_notFound();
						if (slugs.length === 1 && slugs[0] === "index.md") slugs.pop();
						else slugs[slugs.length - 1] = slugs[slugs.length - 1].replace(/\.md$/, "");
						const lang = this.i18nConfig ? slugs.shift() : void 0;
						if (this.i18nConfig && !lang) unstable_notFound();
						const page = source.getPage(slugs, lang);
						if (!page) unstable_notFound();
						return markdownResponse(await getLLMText(page) ?? "");
					}
				});
			}
			for (const { pathname, params, page } of staticPages) {
				const path = withMd(pathname);
				if (mdPaths.has(path)) continue;
				const text = await appContext.run(this, () => renderPage(page, pathname, params));
				if (text === void 0) continue;
				mdPaths.add(path);
				fns.createApi({
					render: "static",
					path,
					method: "GET",
					unstable_sourceFile: page.unstable_sourceFile,
					handler: async () => markdownResponse(text)
				});
			}
		}
	};
}
function precompileRoutePath(routePath) {
	const segments = routePath.split("/").filter(Boolean);
	const params = /* @__PURE__ */ new Map();
	let length = 0;
	let priority = 0;
	let pattern = "";
	for (let i = 0; i < segments.length; i++) {
		const seg = segments[i];
		if (seg.startsWith("(") && seg.endsWith(")")) continue;
		length++;
		priority *= 10;
		if (seg.startsWith("[...") && seg.endsWith("]")) {
			const name = seg.slice(4, -1);
			priority += 3;
			pattern += i === segments.length - 1 ? `(?:\\/(?<${name}>.*))?` : `\\/(?<${name}>.*)`;
			params.set(name, 1);
		} else if (seg.startsWith("[") && seg.endsWith("]")) {
			const name = seg.slice(1, -1);
			priority += 2;
			pattern += `\\/(?<${name}>[^/]+)`;
			params.set(name, 0);
		} else {
			priority += 1;
			pattern += `\\/${RegExp.escape(seg)}`;
		}
	}
	return {
		regex: new RegExp(`^${pattern || "\\/"}$`),
		length,
		priority,
		params
	};
}
function matchRoutePath(precompiled, pathname) {
	const match = precompiled.regex.exec(pathname);
	if (match === null) return null;
	const params = {};
	for (const [k, type] of precompiled.params) {
		const v = match.groups[k] ?? "";
		if (type === 0) params[k] = v;
		else params[k] = v.length === 0 ? [] : v.split("/");
	}
	return params;
}
/**
* The concrete pathname (without route groups) and route params of one entry in `staticPaths`,
* where its values fill the dynamic segments of `routePath` in order.
*/
function expandStaticPath(segments, values) {
	const params = {};
	let pathname = "";
	let i = 0;
	for (const seg of segments) {
		if (seg.startsWith("(") && seg.endsWith(")")) continue;
		if (seg.startsWith("[...") && seg.endsWith("]")) {
			const rest = values.slice(i);
			i = values.length;
			params[seg.slice(4, -1)] = rest;
			for (const value of rest) pathname += "/" + value;
		} else if (seg.startsWith("[") && seg.endsWith("]")) {
			const value = values[i++];
			params[seg.slice(1, -1)] = value;
			pathname += "/" + value;
		} else pathname += "/" + seg;
	}
	return {
		pathname: pathname.length === 0 ? "/" : pathname,
		params
	};
}
//#endregion
export { llms as n, llmsPlugin as t };
