import { a as registerClientReference } from "./server-Ccqw4whX.js";
import { n as __toESM, t as __commonJSMin } from "./runtime-BkT71AZE.js";
import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
import { t as isFullPathname } from "./pathname-BkvvRSn7.js";
//#region node_modules/fumapress/dist/plugins/image/self-hosted.shared.js
function resolveImageConfig(options = {}) {
	return {
		path: options.path ?? "/_img",
		allowedHosts: options.allowedHosts ?? [],
		imageSizes: options.imageSizes ? options.imageSizes.sort((a, b) => a - b) : [
			16,
			32,
			48,
			64,
			96,
			128,
			256,
			384
		],
		deviceSizes: options.deviceSizes ? options.deviceSizes.sort((a, b) => a - b) : [
			640,
			750,
			828,
			1080,
			1200,
			1920,
			2048,
			3840
		],
		quality: options.quality ?? 75,
		fetchTimeout: options.fetchTimeout ?? 4e3,
		maxSourceSize: options.maxSourceSize ?? 64e6
	};
}
/**
* Validate the `src` property of image to be optimized.
*
* @param src - the src, must be either a pathname `/...` or absolute URL.
*/
function validateImageSrc(config, src) {
	if (src.startsWith("https://") || src.startsWith("http://")) {
		const resolved = new URL(src);
		if (!config.allowedHosts.some((entry) => {
			if (typeof entry === "string") return resolved.hostname === entry;
			return matchRemotePattern(entry, resolved);
		})) return {
			allowed: false,
			reason: `Image URL "${src}" is not in allowedHosts`
		};
		return { allowed: true };
	}
	if (isFullPathname(src)) return { allowed: true };
	return {
		allowed: false,
		reason: `Image URL "${src}" is not normalized`
	};
}
function matchRemotePattern(pattern, url) {
	if (pattern.protocol !== void 0 && pattern.protocol !== url.protocol.replace(/:$/, "")) return false;
	if (pattern.port !== void 0 && pattern.port !== url.port) return false;
	if (!pattern.hostname.test(url.hostname)) return false;
	if (pattern.pathname && !pattern.pathname.test(url.pathname)) return false;
	return true;
}
//#endregion
//#region node_modules/fumapress/dist/plugins/image/self-hosted.client.js
var SelfHostedImageProvider = /* #__PURE__ */ registerClientReference((() => {
	throw new Error("It is not possible to invoke a client function from the server: \"SelfHostedImageProvider\"");
}), "fe45b661386f", "SelfHostedImageProvider");
//#endregion
//#region node_modules/fumapress/dist/node_modules/.pnpm/http-cache-semantics@4.2.0/node_modules/http-cache-semantics/index.js
var require_http_cache_semantics = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* @typedef {Object} HttpRequest
	* @property {Record<string, string>} headers - Request headers
	* @property {string} [method] - HTTP method
	* @property {string} [url] - Request URL
	*/
	/**
	* @typedef {Object} HttpResponse
	* @property {Record<string, string>} headers - Response headers
	* @property {number} [status] - HTTP status code
	*/
	/**
	* Set of default cacheable status codes per RFC 7231 section 6.1.
	* @type {Set<number>}
	*/
	const statusCodeCacheableByDefault = /* @__PURE__ */ new Set([
		200,
		203,
		204,
		206,
		300,
		301,
		308,
		404,
		405,
		410,
		414,
		501
	]);
	/**
	* Set of HTTP status codes that the cache implementation understands.
	* Note: This implementation does not understand partial responses (206).
	* @type {Set<number>}
	*/
	const understoodStatuses = /* @__PURE__ */ new Set([
		200,
		203,
		204,
		300,
		301,
		302,
		303,
		307,
		308,
		404,
		405,
		410,
		414,
		501
	]);
	/**
	* Set of HTTP error status codes.
	* @type {Set<number>}
	*/
	const errorStatusCodes = /* @__PURE__ */ new Set([
		500,
		502,
		503,
		504
	]);
	/**
	* Object representing hop-by-hop headers that should be removed.
	* @type {Record<string, boolean>}
	*/
	const hopByHopHeaders = {
		date: true,
		connection: true,
		"keep-alive": true,
		"proxy-authenticate": true,
		"proxy-authorization": true,
		te: true,
		trailer: true,
		"transfer-encoding": true,
		upgrade: true
	};
	/**
	* Headers that are excluded from revalidation update.
	* @type {Record<string, boolean>}
	*/
	const excludedFromRevalidationUpdate = {
		"content-length": true,
		"content-encoding": true,
		"transfer-encoding": true,
		"content-range": true
	};
	/**
	* Converts a string to a number or returns zero if the conversion fails.
	* @param {string} s - The string to convert.
	* @returns {number} The parsed number or 0.
	*/
	function toNumberOrZero(s) {
		const n = parseInt(s, 10);
		return isFinite(n) ? n : 0;
	}
	/**
	* Determines if the given response is an error response.
	* Implements RFC 5861 behavior.
	* @param {HttpResponse|undefined} response - The HTTP response object.
	* @returns {boolean} true if the response is an error or undefined, false otherwise.
	*/
	function isErrorResponse(response) {
		if (!response) return true;
		return errorStatusCodes.has(response.status);
	}
	/**
	* Parses a Cache-Control header string into an object.
	* @param {string} [header] - The Cache-Control header value.
	* @returns {Record<string, string|boolean>} An object representing Cache-Control directives.
	*/
	function parseCacheControl(header) {
		/** @type {Record<string, string|boolean>} */
		const cc = {};
		if (!header) return cc;
		const parts = header.trim().split(/,/);
		for (const part of parts) {
			const [k, v] = part.split(/=/, 2);
			cc[k.trim()] = v === void 0 ? true : v.trim().replace(/^"|"$/g, "");
		}
		return cc;
	}
	/**
	* Formats a Cache-Control directives object into a header string.
	* @param {Record<string, string|boolean>} cc - The Cache-Control directives.
	* @returns {string|undefined} A formatted Cache-Control header string or undefined if empty.
	*/
	function formatCacheControl(cc) {
		let parts = [];
		for (const k in cc) {
			const v = cc[k];
			parts.push(v === true ? k : k + "=" + v);
		}
		if (!parts.length) return;
		return parts.join(", ");
	}
	module.exports = class CachePolicy {
		/**
		* Creates a new CachePolicy instance.
		* @param {HttpRequest} req - Incoming client request.
		* @param {HttpResponse} res - Received server response.
		* @param {Object} [options={}] - Configuration options.
		* @param {boolean} [options.shared=true] - Is the cache shared (a public proxy)? `false` for personal browser caches.
		* @param {number} [options.cacheHeuristic=0.1] - Fallback heuristic (age fraction) for cache duration.
		* @param {number} [options.immutableMinTimeToLive=86400000] - Minimum TTL for immutable responses in milliseconds.
		* @param {boolean} [options.ignoreCargoCult=false] - Detect nonsense cache headers, and override them.
		* @param {any} [options._fromObject] - Internal parameter for deserialization. Do not use.
		*/
		constructor(req, res, { shared, cacheHeuristic, immutableMinTimeToLive, ignoreCargoCult, _fromObject } = {}) {
			if (_fromObject) {
				this._fromObject(_fromObject);
				return;
			}
			if (!res || !res.headers) throw Error("Response headers missing");
			this._assertRequestHasHeaders(req);
			/** @type {number} Timestamp when the response was received */
			this._responseTime = this.now();
			/** @type {boolean} Indicates if the cache is shared */
			this._isShared = shared !== false;
			/** @type {boolean} Indicates if legacy cargo cult directives should be ignored */
			this._ignoreCargoCult = !!ignoreCargoCult;
			/** @type {number} Heuristic cache fraction */
			this._cacheHeuristic = void 0 !== cacheHeuristic ? cacheHeuristic : .1;
			/** @type {number} Minimum TTL for immutable responses in ms */
			this._immutableMinTtl = void 0 !== immutableMinTimeToLive ? immutableMinTimeToLive : 864e5;
			/** @type {number} HTTP status code */
			this._status = "status" in res ? res.status : 200;
			/** @type {Record<string, string>} Response headers */
			this._resHeaders = res.headers;
			/** @type {Record<string, string|boolean>} Parsed Cache-Control directives from response */
			this._rescc = parseCacheControl(res.headers["cache-control"]);
			/** @type {string} HTTP method (e.g., GET, POST) */
			this._method = "method" in req ? req.method : "GET";
			/** @type {string} Request URL */
			this._url = req.url;
			/** @type {string} Host header from the request */
			this._host = req.headers.host;
			/** @type {boolean} Whether the request does not include an Authorization header */
			this._noAuthorization = !req.headers.authorization;
			/** @type {Record<string, string>|null} Request headers used for Vary matching */
			this._reqHeaders = res.headers.vary ? req.headers : null;
			/** @type {Record<string, string|boolean>} Parsed Cache-Control directives from request */
			this._reqcc = parseCacheControl(req.headers["cache-control"]);
			if (this._ignoreCargoCult && "pre-check" in this._rescc && "post-check" in this._rescc) {
				delete this._rescc["pre-check"];
				delete this._rescc["post-check"];
				delete this._rescc["no-cache"];
				delete this._rescc["no-store"];
				delete this._rescc["must-revalidate"];
				this._resHeaders = Object.assign({}, this._resHeaders, { "cache-control": formatCacheControl(this._rescc) });
				delete this._resHeaders.expires;
				delete this._resHeaders.pragma;
			}
			if (res.headers["cache-control"] == null && /no-cache/.test(res.headers.pragma)) this._rescc["no-cache"] = true;
		}
		/**
		* You can monkey-patch it for testing.
		* @returns {number} Current time in milliseconds.
		*/
		now() {
			return Date.now();
		}
		/**
		* Determines if the response is storable in a cache.
		* @returns {boolean} `false` if can never be cached.
		*/
		storable() {
			return !!(!this._reqcc["no-store"] && ("GET" === this._method || "HEAD" === this._method || "POST" === this._method && this._hasExplicitExpiration()) && understoodStatuses.has(this._status) && !this._rescc["no-store"] && (!this._isShared || !this._rescc.private) && (!this._isShared || this._noAuthorization || this._allowsStoringAuthenticated()) && (this._resHeaders.expires || this._rescc["max-age"] || this._isShared && this._rescc["s-maxage"] || this._rescc.public || statusCodeCacheableByDefault.has(this._status)));
		}
		/**
		* @returns {boolean} true if expiration is explicitly defined.
		*/
		_hasExplicitExpiration() {
			return !!(this._isShared && this._rescc["s-maxage"] || this._rescc["max-age"] || this._resHeaders.expires);
		}
		/**
		* @param {HttpRequest} req - a request
		* @throws {Error} if the headers are missing.
		*/
		_assertRequestHasHeaders(req) {
			if (!req || !req.headers) throw Error("Request headers missing");
		}
		/**
		* Checks if the request matches the cache and can be satisfied from the cache immediately,
		* without having to make a request to the server.
		*
		* This doesn't support `stale-while-revalidate`. See `evaluateRequest()` for a more complete solution.
		*
		* @param {HttpRequest} req - The new incoming HTTP request.
		* @returns {boolean} `true`` if the cached response used to construct this cache policy satisfies the request without revalidation.
		*/
		satisfiesWithoutRevalidation(req) {
			return !this.evaluateRequest(req).revalidation;
		}
		/**
		* @param {{headers: Record<string, string>, synchronous: boolean}|undefined} revalidation - Revalidation information, if any.
		* @returns {{response: {headers: Record<string, string>}, revalidation: {headers: Record<string, string>, synchronous: boolean}|undefined}} An object with a cached response headers and revalidation info.
		*/
		_evaluateRequestHitResult(revalidation) {
			return {
				response: { headers: this.responseHeaders() },
				revalidation
			};
		}
		/**
		* @param {HttpRequest} request - new incoming
		* @param {boolean} synchronous - whether revalidation must be synchronous (not s-w-r).
		* @returns {{headers: Record<string, string>, synchronous: boolean}} An object with revalidation headers and a synchronous flag.
		*/
		_evaluateRequestRevalidation(request, synchronous) {
			return {
				synchronous,
				headers: this.revalidationHeaders(request)
			};
		}
		/**
		* @param {HttpRequest} request - new incoming
		* @returns {{response: undefined, revalidation: {headers: Record<string, string>, synchronous: boolean}}} An object indicating no cached response and revalidation details.
		*/
		_evaluateRequestMissResult(request) {
			return {
				response: void 0,
				revalidation: this._evaluateRequestRevalidation(request, true)
			};
		}
		/**
		* Checks if the given request matches this cache entry, and how the cache can be used to satisfy it. Returns an object with:
		*
		* ```
		* {
		*     // If defined, you must send a request to the server.
		*     revalidation: {
		*         headers: {}, // HTTP headers to use when sending the revalidation response
		*         // If true, you MUST wait for a response from the server before using the cache
		*         // If false, this is stale-while-revalidate. The cache is stale, but you can use it while you update it asynchronously.
		*         synchronous: bool,
		*     },
		*     // If defined, you can use this cached response.
		*     response: {
		*         headers: {}, // Updated cached HTTP headers you must use when responding to the client
		*     },
		* }
		* ```
		* @param {HttpRequest} req - new incoming HTTP request
		* @returns {{response: {headers: Record<string, string>}|undefined, revalidation: {headers: Record<string, string>, synchronous: boolean}|undefined}} An object containing keys:
		*   - revalidation: { headers: Record<string, string>, synchronous: boolean } Set if you should send this to the origin server
		*   - response: { headers: Record<string, string> } Set if you can respond to the client with these cached headers
		*/
		evaluateRequest(req) {
			this._assertRequestHasHeaders(req);
			if (this._rescc["must-revalidate"]) return this._evaluateRequestMissResult(req);
			if (!this._requestMatches(req, false)) return this._evaluateRequestMissResult(req);
			const requestCC = parseCacheControl(req.headers["cache-control"]);
			if (requestCC["no-cache"] || /no-cache/.test(req.headers.pragma)) return this._evaluateRequestMissResult(req);
			if (requestCC["max-age"] && this.age() > toNumberOrZero(requestCC["max-age"])) return this._evaluateRequestMissResult(req);
			if (requestCC["min-fresh"] && this.maxAge() - this.age() < toNumberOrZero(requestCC["min-fresh"])) return this._evaluateRequestMissResult(req);
			if (this.stale()) {
				if ("max-stale" in requestCC && (true === requestCC["max-stale"] || requestCC["max-stale"] > this.age() - this.maxAge())) return this._evaluateRequestHitResult(void 0);
				if (this.useStaleWhileRevalidate()) return this._evaluateRequestHitResult(this._evaluateRequestRevalidation(req, false));
				return this._evaluateRequestMissResult(req);
			}
			return this._evaluateRequestHitResult(void 0);
		}
		/**
		* @param {HttpRequest} req - check if this is for the same cache entry
		* @param {boolean} allowHeadMethod - allow a HEAD method to match.
		* @returns {boolean} `true` if the request matches.
		*/
		_requestMatches(req, allowHeadMethod) {
			return !!((!this._url || this._url === req.url) && this._host === req.headers.host && (!req.method || this._method === req.method || allowHeadMethod && "HEAD" === req.method) && this._varyMatches(req));
		}
		/**
		* Determines whether storing authenticated responses is allowed.
		* @returns {boolean} `true` if allowed.
		*/
		_allowsStoringAuthenticated() {
			return !!(this._rescc["must-revalidate"] || this._rescc.public || this._rescc["s-maxage"]);
		}
		/**
		* Checks whether the Vary header in the response matches the new request.
		* @param {HttpRequest} req - incoming HTTP request
		* @returns {boolean} `true` if the vary headers match.
		*/
		_varyMatches(req) {
			if (!this._resHeaders.vary) return true;
			if (this._resHeaders.vary === "*") return false;
			const fields = this._resHeaders.vary.trim().toLowerCase().split(/\s*,\s*/);
			for (const name of fields) if (req.headers[name] !== this._reqHeaders[name]) return false;
			return true;
		}
		/**
		* Creates a copy of the given headers without any hop-by-hop headers.
		* @param {Record<string, string>} inHeaders - old headers from the cached response
		* @returns {Record<string, string>} A new headers object without hop-by-hop headers.
		*/
		_copyWithoutHopByHopHeaders(inHeaders) {
			/** @type {Record<string, string>} */
			const headers = {};
			for (const name in inHeaders) {
				if (hopByHopHeaders[name]) continue;
				headers[name] = inHeaders[name];
			}
			if (inHeaders.connection) {
				const tokens = inHeaders.connection.trim().split(/\s*,\s*/);
				for (const name of tokens) delete headers[name];
			}
			if (headers.warning) {
				const warnings = headers.warning.split(/,/).filter((warning) => {
					return !/^\s*1[0-9][0-9]/.test(warning);
				});
				if (!warnings.length) delete headers.warning;
				else headers.warning = warnings.join(",").trim();
			}
			return headers;
		}
		/**
		* Returns the response headers adjusted for serving the cached response.
		* Removes hop-by-hop headers and updates the Age and Date headers.
		* @returns {Record<string, string>} The adjusted response headers.
		*/
		responseHeaders() {
			const headers = this._copyWithoutHopByHopHeaders(this._resHeaders);
			const age = this.age();
			if (age > 86400 && !this._hasExplicitExpiration() && this.maxAge() > 86400) headers.warning = (headers.warning ? `${headers.warning}, ` : "") + "113 - \"rfc7234 5.5.4\"";
			headers.age = `${Math.round(age)}`;
			headers.date = new Date(this.now()).toUTCString();
			return headers;
		}
		/**
		* Returns the Date header value from the response or the current time if invalid.
		* @returns {number} Timestamp (in milliseconds) representing the Date header or response time.
		*/
		date() {
			const serverDate = Date.parse(this._resHeaders.date);
			if (isFinite(serverDate)) return serverDate;
			return this._responseTime;
		}
		/**
		* Value of the Age header, in seconds, updated for the current time.
		* May be fractional.
		* @returns {number} The age in seconds.
		*/
		age() {
			return this._ageValue() + (this.now() - this._responseTime) / 1e3;
		}
		/**
		* @returns {number} The Age header value as a number.
		*/
		_ageValue() {
			return toNumberOrZero(this._resHeaders.age);
		}
		/**
		* Possibly outdated value of applicable max-age (or heuristic equivalent) in seconds.
		* This counts since response's `Date`.
		*
		* For an up-to-date value, see `timeToLive()`.
		*
		* Returns the maximum age (freshness lifetime) of the response in seconds.
		* @returns {number} The max-age value in seconds.
		*/
		maxAge() {
			if (!this.storable() || this._rescc["no-cache"]) return 0;
			if (this._isShared && this._resHeaders["set-cookie"] && !this._rescc.public && !this._rescc.immutable) return 0;
			if (this._resHeaders.vary === "*") return 0;
			if (this._isShared) {
				if (this._rescc["proxy-revalidate"]) return 0;
				if (this._rescc["s-maxage"]) return toNumberOrZero(this._rescc["s-maxage"]);
			}
			if (this._rescc["max-age"]) return toNumberOrZero(this._rescc["max-age"]);
			const defaultMinTtl = this._rescc.immutable ? this._immutableMinTtl : 0;
			const serverDate = this.date();
			if (this._resHeaders.expires) {
				const expires = Date.parse(this._resHeaders.expires);
				if (Number.isNaN(expires) || expires < serverDate) return 0;
				return Math.max(defaultMinTtl, (expires - serverDate) / 1e3);
			}
			if (this._resHeaders["last-modified"]) {
				const lastModified = Date.parse(this._resHeaders["last-modified"]);
				if (isFinite(lastModified) && serverDate > lastModified) return Math.max(defaultMinTtl, (serverDate - lastModified) / 1e3 * this._cacheHeuristic);
			}
			return defaultMinTtl;
		}
		/**
		* Remaining time this cache entry may be useful for, in *milliseconds*.
		* You can use this as an expiration time for your cache storage.
		*
		* Prefer this method over `maxAge()`, because it includes other factors like `age` and `stale-while-revalidate`.
		* @returns {number} Time-to-live in milliseconds.
		*/
		timeToLive() {
			const age = this.maxAge() - this.age();
			const staleIfErrorAge = age + toNumberOrZero(this._rescc["stale-if-error"]);
			const staleWhileRevalidateAge = age + toNumberOrZero(this._rescc["stale-while-revalidate"]);
			return Math.round(Math.max(0, age, staleIfErrorAge, staleWhileRevalidateAge) * 1e3);
		}
		/**
		* If true, this cache entry is past its expiration date.
		* Note that stale cache may be useful sometimes, see `evaluateRequest()`.
		* @returns {boolean} `false` doesn't mean it's fresh nor usable
		*/
		stale() {
			return this.maxAge() <= this.age();
		}
		/**
		* @returns {boolean} `true` if `stale-if-error` condition allows use of a stale response.
		*/
		_useStaleIfError() {
			return this.maxAge() + toNumberOrZero(this._rescc["stale-if-error"]) > this.age();
		}
		/** See `evaluateRequest()` for a more complete solution
		* @returns {boolean} `true` if `stale-while-revalidate` is currently allowed.
		*/
		useStaleWhileRevalidate() {
			const swr = toNumberOrZero(this._rescc["stale-while-revalidate"]);
			return swr > 0 && this.maxAge() + swr > this.age();
		}
		/**
		* Creates a `CachePolicy` instance from a serialized object.
		* @param {Object} obj - The serialized object.
		* @returns {CachePolicy} A new CachePolicy instance.
		*/
		static fromObject(obj) {
			return new this(void 0, void 0, { _fromObject: obj });
		}
		/**
		* @param {any} obj - The serialized object.
		* @throws {Error} If already initialized or if the object is invalid.
		*/
		_fromObject(obj) {
			if (this._responseTime) throw Error("Reinitialized");
			if (!obj || obj.v !== 1) throw Error("Invalid serialization");
			this._responseTime = obj.t;
			this._isShared = obj.sh;
			this._cacheHeuristic = obj.ch;
			this._immutableMinTtl = obj.imm !== void 0 ? obj.imm : 864e5;
			this._ignoreCargoCult = !!obj.icc;
			this._status = obj.st;
			this._resHeaders = obj.resh;
			this._rescc = obj.rescc;
			this._method = obj.m;
			this._url = obj.u;
			this._host = obj.h;
			this._noAuthorization = obj.a;
			this._reqHeaders = obj.reqh;
			this._reqcc = obj.reqcc;
		}
		/**
		* Serializes the `CachePolicy` instance into a JSON-serializable object.
		* @returns {Object} The serialized object.
		*/
		toObject() {
			return {
				v: 1,
				t: this._responseTime,
				sh: this._isShared,
				ch: this._cacheHeuristic,
				imm: this._immutableMinTtl,
				icc: this._ignoreCargoCult,
				st: this._status,
				resh: this._resHeaders,
				rescc: this._rescc,
				m: this._method,
				u: this._url,
				h: this._host,
				a: this._noAuthorization,
				reqh: this._reqHeaders,
				reqcc: this._reqcc
			};
		}
		/**
		* Headers for sending to the origin server to revalidate stale response.
		* Allows server to return 304 to allow reuse of the previous response.
		*
		* Hop by hop headers are always stripped.
		* Revalidation headers may be added or removed, depending on request.
		* @param {HttpRequest} incomingReq - The incoming HTTP request.
		* @returns {Record<string, string>} The headers for the revalidation request.
		*/
		revalidationHeaders(incomingReq) {
			this._assertRequestHasHeaders(incomingReq);
			const headers = this._copyWithoutHopByHopHeaders(incomingReq.headers);
			delete headers["if-range"];
			if (!this._requestMatches(incomingReq, true) || !this.storable()) {
				delete headers["if-none-match"];
				delete headers["if-modified-since"];
				return headers;
			}
			if (this._resHeaders.etag) headers["if-none-match"] = headers["if-none-match"] ? `${headers["if-none-match"]}, ${this._resHeaders.etag}` : this._resHeaders.etag;
			if (headers["accept-ranges"] || headers["if-match"] || headers["if-unmodified-since"] || this._method && this._method != "GET") {
				delete headers["if-modified-since"];
				if (headers["if-none-match"]) {
					const etags = headers["if-none-match"].split(/,/).filter((etag) => {
						return !/^\s*W\//.test(etag);
					});
					if (!etags.length) delete headers["if-none-match"];
					else headers["if-none-match"] = etags.join(",").trim();
				}
			} else if (this._resHeaders["last-modified"] && !headers["if-modified-since"]) headers["if-modified-since"] = this._resHeaders["last-modified"];
			return headers;
		}
		/**
		* Creates new CachePolicy with information combined from the previews response,
		* and the new revalidation response.
		*
		* Returns {policy, modified} where modified is a boolean indicating
		* whether the response body has been modified, and old cached body can't be used.
		*
		* @param {HttpRequest} request - The latest HTTP request asking for the cached entry.
		* @param {HttpResponse} response - The latest revalidation HTTP response from the origin server.
		* @returns {{policy: CachePolicy, modified: boolean, matches: boolean}} The updated policy and modification status.
		* @throws {Error} If the response headers are missing.
		*/
		revalidatedPolicy(request, response) {
			this._assertRequestHasHeaders(request);
			if (this._useStaleIfError() && isErrorResponse(response)) return {
				policy: this,
				modified: false,
				matches: true
			};
			if (!response || !response.headers) throw Error("Response headers missing");
			let matches = false;
			if (response.status !== void 0 && response.status != 304) matches = false;
			else if (response.headers.etag && !/^\s*W\//.test(response.headers.etag)) matches = this._resHeaders.etag && this._resHeaders.etag.replace(/^\s*W\//, "") === response.headers.etag;
			else if (this._resHeaders.etag && response.headers.etag) matches = this._resHeaders.etag.replace(/^\s*W\//, "") === response.headers.etag.replace(/^\s*W\//, "");
			else if (this._resHeaders["last-modified"]) matches = this._resHeaders["last-modified"] === response.headers["last-modified"];
			else if (!this._resHeaders.etag && !this._resHeaders["last-modified"] && !response.headers.etag && !response.headers["last-modified"]) matches = true;
			const optionsCopy = {
				shared: this._isShared,
				cacheHeuristic: this._cacheHeuristic,
				immutableMinTimeToLive: this._immutableMinTtl,
				ignoreCargoCult: this._ignoreCargoCult
			};
			if (!matches) return {
				policy: new this.constructor(request, response, optionsCopy),
				modified: response.status != 304,
				matches: false
			};
			const headers = {};
			for (const k in this._resHeaders) headers[k] = k in response.headers && !excludedFromRevalidationUpdate[k] ? response.headers[k] : this._resHeaders[k];
			const newResponse = Object.assign({}, response, {
				status: this._status,
				method: this._method,
				headers
			});
			return {
				policy: new this.constructor(request, newResponse, optionsCopy),
				modified: false,
				matches: true
			};
		}
	};
}));
require_http_cache_semantics();
//#endregion
//#region node_modules/fumapress/dist/plugins/image/self-hosted.utils.js
var import_http_cache_semantics = /* @__PURE__ */ __toESM(require_http_cache_semantics(), 1);
var SAFE_IMAGE_CONTENT_TYPES = /* @__PURE__ */ new Set([
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/avif",
	"image/x-icon",
	"image/vnd.microsoft.icon",
	"image/bmp",
	"image/tiff"
]);
function parseImageParams({ searchParams }, config) {
	const src = searchParams.get("src");
	if (!src) return null;
	const width = parseInt(searchParams.get("width") ?? "0", 10);
	const quality = parseInt(searchParams.get("quality") ?? String(config.quality), 10);
	if (Number.isNaN(width) || width < 0) return null;
	if (!config.deviceSizes.includes(width) && !config.imageSizes.includes(width)) return null;
	if (Number.isNaN(quality) || quality < 1 || quality > 100) return null;
	return {
		src,
		width,
		quality
	};
}
var ImageOptimizationCache = class {
	store = /* @__PURE__ */ new Map();
	readCache(src, req) {
		const entry = this.store.get(src);
		if (!entry) return null;
		if (!req || entry.policy.satisfiesWithoutRevalidation(req)) return entry;
		this.store.delete(src);
		return null;
	}
	set(src, result) {
		const { policy } = result;
		if (!policy.storable() || policy.timeToLive() <= 0) return null;
		const entry = {
			...result,
			optimized: /* @__PURE__ */ new Map()
		};
		this.store.set(src, entry);
		return entry;
	}
};
function getOptimizeCacheKey(params) {
	return `${params.width}\0${params.quality}`;
}
function isSafeImageContentType(contentType) {
	if (!contentType) return false;
	const mediaType = contentType.split(";")[0].trim().toLowerCase();
	return SAFE_IMAGE_CONTENT_TYPES.has(mediaType);
}
async function readResponseBodyWithLimit(response, maxBytes) {
	const contentLength = response.headers.get("Content-Length");
	if (contentLength !== null) {
		const length = Number(contentLength);
		if (!Number.isNaN(length) && length > maxBytes) return "too-large";
	}
	const reader = response.body.getReader();
	const chunks = [];
	let total = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			total += value.byteLength;
			if (total > maxBytes) return "too-large";
			chunks.push(value);
		}
	} finally {
		reader.releaseLock();
	}
	const body = new Uint8Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		body.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return body.buffer;
}
function createCachePolicyHeaders(headers) {
	const out = {};
	headers.forEach((value, key) => {
		out[key.toLowerCase()] = value;
	});
	return out;
}
function createImageOptimizer(config, cache) {
	async function transformImage(input, { width, quality }) {
		const { default: sharp } = await import("./__vite-optional-peer-dep_sharp_fumapress-DAocKYHi.js");
		let pipeline = sharp(input.body);
		if (width > 0) pipeline = pipeline.resize(width, void 0, {
			fit: "inside",
			withoutEnlargement: true
		});
		switch (input.contentType) {
			case "image/avif":
				pipeline = pipeline.avif({ quality });
				return {
					body: new Uint8Array(await pipeline.toBuffer()),
					contentType: "image/avif"
				};
			case "image/png":
				pipeline = pipeline.png({ quality });
				return {
					body: new Uint8Array(await pipeline.toBuffer()),
					contentType: "image/png"
				};
			case "image/jpeg":
			case "image/jpg":
				pipeline = pipeline.jpeg({
					quality,
					mozjpeg: true
				});
				return {
					body: new Uint8Array(await pipeline.toBuffer()),
					contentType: "image/jpg"
				};
			default:
				pipeline = pipeline.webp({ quality });
				return {
					body: new Uint8Array(await pipeline.toBuffer()),
					contentType: "image/webp"
				};
		}
	}
	async function fetchSource(params, request) {
		const headers = new Headers({ "X-Fumapress": "image-optimization" });
		const accept = request.headers.get("Accept");
		if (accept) headers.set("Accept", accept);
		const cachePolicyRequest = { headers: createCachePolicyHeaders(headers) };
		const cached = cache?.readCache(params.src, cachePolicyRequest);
		if (cached) return cached;
		let currentUrl = new URL(params.src, request.url).toString();
		let redirectCount = 0;
		let res = null;
		while (redirectCount <= 5) {
			res = await fetch(currentUrl, {
				headers,
				signal: AbortSignal.timeout(config.fetchTimeout),
				redirect: "manual"
			});
			if (res.status < 300 || res.status >= 400) break;
			const location = res.headers.get("Location");
			if (!location) return new Response("Invalid redirect: missing Location header", { status: 400 });
			const nextUrl = new URL(location, currentUrl).toString();
			const validation = validateImageSrc(config, nextUrl);
			if (!validation.allowed) return new Response(validation.reason, { status: 403 });
			currentUrl = nextUrl;
			redirectCount += 1;
		}
		if (!res || !res.ok || !res.body) return new Response("Image not found", { status: 404 });
		const contentType = res.headers.get("Content-Type");
		if (!isSafeImageContentType(contentType)) return new Response("The requested resource is not an allowed image type", { status: 400 });
		const body = await readResponseBodyWithLimit(res, config.maxSourceSize);
		if (body === "too-large") return new Response("Source image is too large", { status: 413 });
		const result = {
			body,
			contentType,
			policy: new import_http_cache_semantics.default(cachePolicyRequest, {
				status: res.status,
				headers: createCachePolicyHeaders(res.headers)
			})
		};
		return cache?.set(params.src, result) ?? result;
	}
	function createOptimizedImageResponse(result, policy) {
		const headers = new Headers();
		if (policy?.storable()) for (const [key, value] of Object.entries(policy.responseHeaders())) {
			if (typeof value !== "string") continue;
			switch (key) {
				case "cache-control":
				case "etag":
				case "last-modified":
				case "vary":
				case "age":
				case "date": headers.set(key, value);
			}
		}
		headers.set("Content-Type", result.contentType);
		headers.set("Content-Security-Policy", "script- src 'none'; frame-src 'none'; sandbox;");
		headers.set("X-Content-Type-Options", "nosniff");
		headers.set("Content-Disposition", "inline");
		return new Response(result.body, {
			status: 200,
			headers
		});
	}
	return async function onRequest(request) {
		const params = parseImageParams(new URL(request.url), config);
		if (!params || request.headers.get("X-Fumapress") === "image-optimization") return new Response("Bad Request", { status: 400 });
		const validation = validateImageSrc(config, params.src);
		if (!validation.allowed) return new Response(validation.reason, { status: 403 });
		const source = await fetchSource(params, request);
		if (source instanceof Response) return source;
		const optimizeKey = getOptimizeCacheKey(params);
		if ("optimized" in source) {
			const cached = source.optimized.get(optimizeKey);
			if (cached) return createOptimizedImageResponse(cached, source.policy);
		}
		try {
			const transformed = await transformImage(source, {
				width: params.width,
				quality: params.quality
			});
			if ("optimized" in source) source.optimized.set(optimizeKey, transformed);
			return createOptimizedImageResponse(transformed, source.policy);
		} catch (error) {
			console.error("[Fumapress] Image optimization error:", error);
			return new Response("Failed to optimize image", { status: 500 });
		}
	};
}
//#endregion
//#region node_modules/fumapress/dist/plugins/image/self-hosted.js
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
function imagePlugin(_options = {}) {
	const config = resolveImageConfig(_options);
	return {
		name: "image:self-hosted",
		init() {
			const data = this.data["core:provider"] ??= {};
			(data.transformers ??= []).push((props) => {
				props.children = /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(SelfHostedImageProvider, {
					config,
					children: props.children
				});
				return props;
			});
		},
		createPages({ createApi }) {
			if (this.mode === "static") throw new Error("[Fumapress] Image Optimization is not compatible with static mode, please disable it");
			const optimizer = createImageOptimizer(config, new ImageOptimizationCache());
			createApi({
				render: "dynamic",
				path: config.path,
				handlers: { GET: optimizer }
			});
		}
	};
}
//#endregion
export { imagePlugin };
