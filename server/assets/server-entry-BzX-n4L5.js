import { r as __exportAll } from "./rolldown-runtime-BMI-E3GI.js";
import { a as setRequireModule, i as loadServerAction } from "./rsc-Vn185Xlk.js";
import { t as require_react_react_server } from "./react.react-server-BSR27ksj.js";
import { i as decodeReply, n as decodeAction, o as renderToReadableStream$1, r as decodeFormState, t as createTemporaryReferenceSet } from "./server-Ccqw4whX.js";
import { a as ETAGS_HEADER, c as createCustomError, i as stringToStream, l as getErrorInfo, n as unstable_notFound, o as ETAG_ID_PREFIX, r as unstable_redirect, s as parseClientEtags, t as createPages } from "./server-BJVqT1VK.js";
import { n as press_config_default } from "./press.config-D-pOEvGT.js";
import { i as initApp, t as appContext } from "./context-B725id1P.js";
import { n as joinPathname } from "./pathname-BkvvRSn7.js";
import path, { join } from "node:path";
import { STATUS_CODES, createServer } from "node:http";
import { Http2ServerRequest, constants } from "node:http2";
import { Readable } from "node:stream";
import { versions } from "node:process";
import { createReadStream, existsSync, statSync } from "node:fs";
import assetsManifest from "../__vite_rsc_assets_manifest.js";
import { buildMetadata } from "../__waku_build_metadata.js";
//#endregion
//#region node_modules/@hono/node-server/dist/index.mjs
var RequestError = class extends Error {
	constructor(message, options) {
		super(message, options);
		this.name = "RequestError";
	}
};
var nonJoinedHeaders = /* @__PURE__ */ new Set([
	"age",
	"authorization",
	"content-length",
	"content-type",
	"etag",
	"expires",
	"from",
	"host",
	"if-modified-since",
	"if-unmodified-since",
	"last-modified",
	"location",
	"max-forwards",
	"proxy-authorization",
	"referer",
	"retry-after",
	"server",
	"user-agent"
]);
var validHeaderName = /^[!#$%&'*+\-.^_`|~\dA-Za-z]+$/;
var isHttpWhitespace = (code) => code === 9 || code === 10 || code === 13 || code === 32;
var normalizeHeaderValue = (value) => {
	if (!isHttpWhitespace(value.charCodeAt(0)) && !isHttpWhitespace(value.charCodeAt(value.length - 1))) return value;
	let start = 0;
	let end = value.length;
	while (start < end && isHttpWhitespace(value.charCodeAt(start))) start++;
	while (end > start && isHttpWhitespace(value.charCodeAt(end - 1))) end--;
	return value.slice(start, end);
};
var forbiddenHeaderValue = /[\0\r\n]/;
var GlobalHeaders = globalThis.Headers;
var materializeHeaders = (rawHeaders, HeadersCtor = GlobalHeaders) => {
	const headers = new HeadersCtor();
	for (let i = 0; i < rawHeaders.length; i += 2) {
		const name = rawHeaders[i];
		if (!name.startsWith(":")) headers.append(name, rawHeaders[i + 1]);
	}
	return headers;
};
var RequestHeaders = class {
	#incoming;
	#rawHeaders;
	#headers;
	#invalidValue;
	constructor(incoming) {
		this.#incoming = incoming;
		if (incoming instanceof Http2ServerRequest) this.#rawHeaders = incoming.rawHeaders.slice();
	}
	get #lazyRawHeaders() {
		return this.#rawHeaders ??= this.#incoming.rawHeaders.slice();
	}
	get #native() {
		if (!this.#headers) {
			this.#headers = materializeHeaders(this.#lazyRawHeaders);
			this.#rawHeaders = void 0;
		}
		return this.#headers;
	}
	#normalizedName(name) {
		if (typeof name !== "string") return;
		if (!validHeaderName.test(name)) throw new TypeError(`Invalid header name: ${name}`);
		return name.toLowerCase();
	}
	#lookupHttp1(lowerName) {
		const headers = this.#incoming instanceof Http2ServerRequest ? void 0 : this.#incoming.headers;
		if (!headers || nonJoinedHeaders.has(lowerName) || lowerName === "set-cookie" || lowerName === "__proto__") return;
		if (!Object.hasOwn(headers, lowerName)) return null;
		const rawValue = headers[lowerName];
		if (typeof rawValue === "string") {
			const value = normalizeHeaderValue(rawValue);
			return forbiddenHeaderValue.test(value) ? void 0 : value;
		}
	}
	#lookup(rawHeaders, lowerName) {
		const separator = lowerName === "cookie" ? "; " : ", ";
		let value = null;
		for (let i = 0; i < rawHeaders.length; i += 2) {
			const rawName = rawHeaders[i];
			if (rawName.length === lowerName.length && rawName.toLowerCase() === lowerName) {
				const rawValue = normalizeHeaderValue(rawHeaders[i + 1]);
				if (forbiddenHeaderValue.test(rawValue)) {
					this.#invalidValue = true;
					return;
				}
				value = value === null ? rawValue : value + separator + rawValue;
			}
		}
		return value;
	}
	append(name, value) {
		this.#native.append(name, value);
	}
	delete(name) {
		this.#native.delete(name);
	}
	get(name) {
		const lowerName = this.#normalizedName(name);
		if (lowerName && !this.#headers && !this.#invalidValue) {
			const http1Value = this.#lookupHttp1(lowerName);
			if (http1Value !== void 0) return http1Value;
			const value = this.#lookup(this.#lazyRawHeaders, lowerName);
			if (value !== void 0) return value;
		}
		return this.#native.get(name);
	}
	has(name) {
		const lowerName = this.#normalizedName(name);
		if (lowerName && !this.#headers && !this.#invalidValue) {
			const http1Value = this.#lookupHttp1(lowerName);
			if (http1Value !== void 0) return http1Value !== null;
			const value = this.#lookup(this.#lazyRawHeaders, lowerName);
			if (value !== void 0) return value !== null;
		}
		return this.#native.has(name);
	}
	set(name, value) {
		this.#native.set(name, value);
	}
	getSetCookie() {
		return this.#native.getSetCookie();
	}
	keys() {
		return this.#native.keys();
	}
	values() {
		return this.#native.values();
	}
	entries() {
		return this.#native.entries();
	}
	forEach(callback, thisArg) {
		this.#native.forEach((value, key) => {
			callback.call(thisArg, value, key, this);
		});
	}
	[Symbol.iterator]() {
		return this.entries();
	}
};
Object.defineProperty(RequestHeaders.prototype, Symbol.for("nodejs.util.inspect.custom"), { value: function(depth, options, inspectFn) {
	return `Headers (lightweight) ${inspectFn(Object.fromEntries(this), {
		...options,
		depth: depth == null ? null : depth - 1
	})}`;
} });
Object.setPrototypeOf(RequestHeaders.prototype, GlobalHeaders.prototype);
var newHeadersFromIncoming = (incoming) => globalThis.Headers === GlobalHeaders ? new RequestHeaders(incoming) : materializeHeaders(incoming.rawHeaders, globalThis.Headers);
var reValidRequestUrl = /^\/[!#$&-;=?-\[\]_a-z~]*$/;
var reDotSegment = /\/\.\.?(?:[/?#]|$)/;
var reValidHost = /^[a-z0-9._-]+(?::(?:[1-5]\d{3,4}|[6-9]\d{3}))?$/;
var buildUrl = (scheme, host, incomingUrl) => {
	const url = `${scheme}://${host}${incomingUrl}`;
	if (!reValidHost.test(host)) {
		const urlObj = new URL(url);
		if (urlObj.hostname.length !== host.length && urlObj.hostname !== (host.includes(":") ? host.replace(/:\d+$/, "") : host).toLowerCase()) throw new RequestError("Invalid host header");
		return urlObj.href;
	} else if (incomingUrl.length === 0) return url + "/";
	else {
		if (incomingUrl.charCodeAt(0) !== 47) throw new RequestError("Invalid URL");
		if (!reValidRequestUrl.test(incomingUrl) || reDotSegment.test(incomingUrl)) return new URL(url).href;
		return url;
	}
};
var toRequestError = (e) => {
	if (e instanceof RequestError) return e;
	return new RequestError(e.message, { cause: e });
};
var GlobalRequest = global.Request;
var Request$1 = class extends GlobalRequest {
	constructor(input, options) {
		if (typeof input === "object" && getRequestCache in input) {
			const hasReplacementBody = options !== void 0 && "body" in options && options.body != null;
			if (input[bodyConsumedDirectlyKey] && !hasReplacementBody) throw new TypeError("Cannot construct a Request with a Request object that has already been used.");
			input = input[getRequestCache]();
		}
		if (typeof (options?.body)?.getReader !== "undefined") options.duplex ??= "half";
		super(input, options);
	}
};
var wrapBodyStream = Symbol("wrapBodyStream");
var byteExactEncodings = /* @__PURE__ */ new Set([
	"latin1",
	"binary",
	"hex",
	"base64",
	"base64url"
]);
var isByteExactEncoding = (encoding) => encoding === null || byteExactEncodings.has(encoding);
var bodyBufferedBeforeDisconnectKey = Symbol("bodyBufferedBeforeDisconnect");
var bodyBufferedLengthBeforeDisconnectKey = Symbol("bodyBufferedLengthBeforeDisconnect");
var toBufferChunk = (chunk, encoding) => Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding ?? "utf8");
var isRecoverableDisconnectedIncoming = (incoming) => !(incoming instanceof Http2ServerRequest) && !!incoming.complete && !!incoming.readableAborted && typeof incoming.read === "function" && isByteExactEncoding(incoming.readableEncoding);
var recordBodyBufferedBeforeDisconnect = (incoming) => {
	if (incoming.readableDidRead || !isRecoverableDisconnectedIncoming(incoming)) return;
	const incomingWithRecovery = incoming;
	incomingWithRecovery[bodyBufferedLengthBeforeDisconnectKey] ??= incoming.readableLength;
};
var readBodyBufferedBeforeDisconnect = (incoming, chunks) => {
	if (incoming.readableDidRead && !chunks || !isRecoverableDisconnectedIncoming(incoming)) return;
	const incomingWithRecovery = incoming;
	if (incomingWithRecovery[bodyBufferedBeforeDisconnectKey] !== void 0) return incomingWithRecovery[bodyBufferedBeforeDisconnectKey];
	let result;
	const errored = incoming.errored;
	if (errored && errored.code !== "ECONNRESET") result = errored;
	else if (incomingWithRecovery[bodyBufferedLengthBeforeDisconnectKey] !== void 0 && incoming.readableLength !== incomingWithRecovery[bodyBufferedLengthBeforeDisconnectKey]) result = newBodyUnusableError();
	else {
		const bodyChunks = chunks ?? [];
		const chunk = incoming.read();
		if (chunk !== null) bodyChunks.push(toBufferChunk(chunk, incoming.readableEncoding));
		const buffer = bodyChunks.length === 1 ? bodyChunks[0] : Buffer.concat(bodyChunks);
		result = buffer;
		const contentLength = incoming.headers["content-length"];
		if (typeof contentLength === "string" && /^\d+$/.test(contentLength)) {
			const expectedLength = Number(contentLength);
			if (Number.isSafeInteger(expectedLength) && buffer.length !== expectedLength) result = newBodyUnusableError();
		}
	}
	incomingWithRecovery[bodyBufferedBeforeDisconnectKey] = result;
	return result;
};
var enqueueBufferedBody = (controller, buffered) => {
	if (buffered instanceof Error) {
		controller.error(buffered);
		return;
	}
	if (buffered.length > 0) controller.enqueue(buffered);
	controller.close();
};
var newRequestFromIncoming = (method, url, headers, incoming, abortController) => {
	const init = {
		method,
		headers,
		signal: abortController.signal
	};
	if (method === "TRACE") {
		init.method = "GET";
		const req = new Request$1(url, init);
		Object.defineProperty(req, "method", { get() {
			return "TRACE";
		} });
		return req;
	}
	if (!(method === "GET" || method === "HEAD")) if ("rawBody" in incoming && incoming.rawBody instanceof Buffer) init.body = new ReadableStream({ start(controller) {
		controller.enqueue(incoming.rawBody);
		controller.close();
	} });
	else if (incoming[wrapBodyStream]) {
		let reader;
		init.body = new ReadableStream({ async pull(controller) {
			try {
				if (!reader) {
					const buffered = readBodyBufferedBeforeDisconnect(incoming);
					if (buffered !== void 0) {
						enqueueBufferedBody(controller, buffered);
						return;
					}
				}
				reader ||= Readable.toWeb(incoming).getReader();
				const { done, value } = await reader.read();
				if (done) controller.close();
				else controller.enqueue(value);
			} catch (error) {
				controller.error(error);
			}
		} });
	} else {
		const buffered = readBodyBufferedBeforeDisconnect(incoming);
		if (buffered !== void 0) init.body = new ReadableStream({ start(controller) {
			enqueueBufferedBody(controller, buffered);
		} });
		else init.body = Readable.toWeb(incoming);
	}
	return new Request$1(url, init);
};
var getRequestCache = Symbol("getRequestCache");
var requestCache = Symbol("requestCache");
var incomingKey = Symbol("incomingKey");
var urlKey = Symbol("urlKey");
var methodKey = Symbol("methodKey");
var headersKey = Symbol("headersKey");
var abortControllerKey = Symbol("abortControllerKey");
var getAbortController = Symbol("getAbortController");
var abortRequest = Symbol("abortRequest");
var bodyBufferKey = Symbol("bodyBuffer");
var bodyReadPromiseKey = Symbol("bodyReadPromise");
var bodyConsumedDirectlyKey = Symbol("bodyConsumedDirectly");
var bodyLockReaderKey = Symbol("bodyLockReader");
var abortReasonKey = Symbol("abortReason");
var newBodyUnusableError = () => {
	return /* @__PURE__ */ new TypeError("Body is unusable");
};
var rejectBodyUnusable = () => {
	return Promise.reject(newBodyUnusableError());
};
var textDecoder = new TextDecoder();
var consumeBodyDirectOnce = (request) => {
	if (request[bodyConsumedDirectlyKey]) return rejectBodyUnusable();
	request[bodyConsumedDirectlyKey] = true;
};
var toArrayBuffer = (buf) => {
	return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
};
var contentType = (request) => {
	return (request[headersKey] ||= newHeadersFromIncoming(request[incomingKey])).get("content-type") || "";
};
var methodTokenRegExp = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
var normalizeIncomingMethod = (method) => {
	if (typeof method !== "string" || method.length === 0) return "GET";
	switch (method) {
		case "DELETE":
		case "GET":
		case "HEAD":
		case "OPTIONS":
		case "PATCH":
		case "POST":
		case "PUT":
		case "QUERY": return method;
	}
	const upper = method.toUpperCase();
	switch (upper) {
		case "DELETE":
		case "GET":
		case "HEAD":
		case "OPTIONS":
		case "POST":
		case "PUT": return upper;
		default: return method;
	}
};
var validateDirectReadMethod = (method) => {
	if (!methodTokenRegExp.test(method)) return /* @__PURE__ */ new TypeError(`'${method}' is not a valid HTTP method.`);
	const normalized = method.toUpperCase();
	if (normalized === "CONNECT" || normalized === "TRACK" || normalized === "TRACE" && method !== "TRACE") return /* @__PURE__ */ new TypeError(`'${method}' HTTP method is unsupported.`);
};
var readBodyWithFastPath = (request, method, fromBuffer) => {
	if (request[bodyConsumedDirectlyKey]) return rejectBodyUnusable();
	const methodName = request.method;
	if (methodName === "GET" || methodName === "HEAD") return request[getRequestCache]()[method]();
	const methodValidationError = validateDirectReadMethod(methodName);
	if (methodValidationError) return Promise.reject(methodValidationError);
	if (request[requestCache]) {
		if (methodName !== "TRACE") return request[requestCache][method]();
	}
	const alreadyUsedError = consumeBodyDirectOnce(request);
	if (alreadyUsedError) return alreadyUsedError;
	const raw = readRawBodyIfAvailable(request);
	if (raw) {
		const result = Promise.resolve(fromBuffer(raw, request));
		request[bodyBufferKey] = void 0;
		return result;
	}
	return readBodyDirect(request).then((buf) => {
		const result = fromBuffer(buf, request);
		request[bodyBufferKey] = void 0;
		return result;
	});
};
var readRawBodyIfAvailable = (request) => {
	const incoming = request[incomingKey];
	if ("rawBody" in incoming && incoming.rawBody instanceof Buffer) return incoming.rawBody;
};
var normalizeAbortError = (request, incoming) => {
	if (incoming.errored) return incoming.errored;
	const reason = request[abortReasonKey];
	if (reason !== void 0) return reason instanceof Error ? reason : new Error(String(reason));
	return /* @__PURE__ */ new Error("Client connection prematurely closed.");
};
var readBodyDirect = (request) => {
	if (request[bodyBufferKey]) return Promise.resolve(request[bodyBufferKey]);
	if (request[bodyReadPromiseKey]) return request[bodyReadPromiseKey];
	const incoming = request[incomingKey];
	if (incoming.readableDidRead) return rejectBodyUnusable();
	const buffered = readBodyBufferedBeforeDisconnect(incoming);
	if (buffered !== void 0) {
		if (buffered instanceof Error) return Promise.reject(buffered);
		request[bodyBufferKey] = buffered;
		return Promise.resolve(buffered);
	}
	const promise = new Promise((resolve, reject) => {
		const chunks = [];
		let settled = false;
		const finish = (callback) => {
			if (settled) return;
			settled = true;
			cleanup();
			callback();
		};
		const recoverCompleteBodyAfterDisconnect = (error) => {
			const streamError = incoming.errored ?? error;
			if (!isRecoverableDisconnectedIncoming(incoming) || streamError && streamError.code !== "ECONNRESET") return false;
			finish(() => {
				const recovered = readBodyBufferedBeforeDisconnect(incoming, chunks);
				if (recovered instanceof Error) reject(recovered);
				else if (recovered === void 0) reject(error ?? normalizeAbortError(request, incoming));
				else {
					request[bodyBufferKey] = recovered;
					resolve(recovered);
				}
			});
			return true;
		};
		const onData = (chunk) => {
			chunks.push(toBufferChunk(chunk, incoming.readableEncoding));
		};
		const onEnd = () => {
			finish(() => {
				const buffer = chunks.length === 1 ? chunks[0] : Buffer.concat(chunks);
				request[bodyBufferKey] = buffer;
				resolve(buffer);
			});
		};
		const onError = (error) => {
			if (recoverCompleteBodyAfterDisconnect(error)) return;
			finish(() => {
				reject(error);
			});
		};
		const onClose = () => {
			if (incoming.readableEnded) {
				onEnd();
				return;
			}
			if (recoverCompleteBodyAfterDisconnect()) return;
			finish(() => {
				reject(normalizeAbortError(request, incoming));
			});
		};
		const cleanup = () => {
			incoming.off("data", onData);
			incoming.off("end", onEnd);
			incoming.off("error", onError);
			incoming.off("close", onClose);
			request[bodyReadPromiseKey] = void 0;
		};
		incoming.on("data", onData);
		incoming.on("end", onEnd);
		incoming.on("error", onError);
		incoming.on("close", onClose);
		queueMicrotask(() => {
			if (settled) return;
			if (incoming.readableEnded) onEnd();
			else if (incoming.errored) onError(incoming.errored);
			else if (incoming.destroyed) onClose();
		});
	});
	request[bodyReadPromiseKey] = promise;
	return promise;
};
var requestPrototype = {
	get method() {
		return this[methodKey];
	},
	get url() {
		return this[urlKey];
	},
	get headers() {
		return this[headersKey] ||= newHeadersFromIncoming(this[incomingKey]);
	},
	[abortRequest](reason) {
		if (this[abortReasonKey] === void 0) this[abortReasonKey] = reason;
		const abortController = this[abortControllerKey];
		if (abortController && !abortController.signal.aborted) abortController.abort(reason);
	},
	[getAbortController]() {
		this[abortControllerKey] ||= new AbortController();
		if (this[abortReasonKey] !== void 0 && !this[abortControllerKey].signal.aborted) this[abortControllerKey].abort(this[abortReasonKey]);
		return this[abortControllerKey];
	},
	[getRequestCache]() {
		const abortController = this[getAbortController]();
		if (this[requestCache]) return this[requestCache];
		const method = this.method;
		if (this[bodyConsumedDirectlyKey] && !(method === "GET" || method === "HEAD")) {
			this[bodyBufferKey] = void 0;
			const init = {
				method: method === "TRACE" ? "GET" : method,
				headers: this.headers,
				signal: abortController.signal
			};
			if (method !== "TRACE") {
				init.body = new ReadableStream({ start(c) {
					c.close();
				} });
				init.duplex = "half";
			}
			const req = new Request$1(this[urlKey], init);
			if (method === "TRACE") Object.defineProperty(req, "method", { get() {
				return "TRACE";
			} });
			return this[requestCache] = req;
		}
		return this[requestCache] = newRequestFromIncoming(this.method, this[urlKey], this.headers, this[incomingKey], abortController);
	},
	get body() {
		if (!this[bodyConsumedDirectlyKey]) return this[getRequestCache]().body;
		const request = this[getRequestCache]();
		if (!this[bodyLockReaderKey] && request.body) this[bodyLockReaderKey] = request.body.getReader();
		return request.body;
	},
	get bodyUsed() {
		if (this[bodyConsumedDirectlyKey]) return true;
		if (this[requestCache]) return this[requestCache].bodyUsed;
		return false;
	}
};
Object.defineProperty(requestPrototype, "signal", { get() {
	return this[getAbortController]().signal;
} });
[
	"cache",
	"credentials",
	"destination",
	"integrity",
	"mode",
	"redirect",
	"referrer",
	"referrerPolicy",
	"keepalive"
].forEach((k) => {
	Object.defineProperty(requestPrototype, k, { get() {
		return this[getRequestCache]()[k];
	} });
});
["clone", "formData"].forEach((k) => {
	Object.defineProperty(requestPrototype, k, { value: function() {
		if (this[bodyConsumedDirectlyKey]) {
			if (k === "clone") throw newBodyUnusableError();
			return rejectBodyUnusable();
		}
		return this[getRequestCache]()[k]();
	} });
});
Object.defineProperty(requestPrototype, "text", { value: function() {
	return readBodyWithFastPath(this, "text", (buf) => textDecoder.decode(buf));
} });
Object.defineProperty(requestPrototype, "arrayBuffer", { value: function() {
	return readBodyWithFastPath(this, "arrayBuffer", (buf) => toArrayBuffer(buf));
} });
Object.defineProperty(requestPrototype, "blob", { value: function() {
	return readBodyWithFastPath(this, "blob", (buf, request) => {
		const type = contentType(request);
		return new Response(buf, type ? { headers: { "content-type": type } } : void 0).blob();
	});
} });
Object.defineProperty(requestPrototype, "json", { value: function() {
	if (this[bodyConsumedDirectlyKey]) return rejectBodyUnusable();
	return this.text().then(JSON.parse);
} });
Object.defineProperty(requestPrototype, Symbol.for("nodejs.util.inspect.custom"), { value: function(depth, options, inspectFn) {
	return `Request (lightweight) ${inspectFn({
		method: this.method,
		url: this.url,
		headers: this.headers,
		nativeRequest: this[requestCache]
	}, {
		...options,
		depth: depth == null ? null : depth - 1
	})}`;
} });
Object.setPrototypeOf(requestPrototype, Request$1.prototype);
var newRequest = (incoming, defaultHostname) => {
	const req = Object.create(requestPrototype);
	req[incomingKey] = incoming;
	req[methodKey] = normalizeIncomingMethod(incoming.method);
	const incomingUrl = incoming.url || "";
	if (incomingUrl[0] !== "/" && (incomingUrl.startsWith("http://") || incomingUrl.startsWith("https://"))) {
		if (incoming instanceof Http2ServerRequest) throw new RequestError("Absolute URL for :path is not allowed in HTTP/2");
		try {
			req[urlKey] = new URL(incomingUrl).href;
		} catch (e) {
			throw new RequestError("Invalid absolute URL", { cause: e });
		}
		return req;
	}
	const host = (incoming instanceof Http2ServerRequest ? incoming.authority : incoming.headers.host) || defaultHostname;
	if (!host) throw new RequestError("Missing host header");
	let scheme;
	if (incoming instanceof Http2ServerRequest) {
		scheme = incoming.scheme;
		if (!(scheme === "http" || scheme === "https")) throw new RequestError("Unsupported scheme");
	} else scheme = incoming.socket && incoming.socket.encrypted ? "https" : "http";
	try {
		req[urlKey] = buildUrl(scheme, host, incomingUrl);
	} catch (e) {
		if (e instanceof RequestError) throw e;
		else throw new RequestError("Invalid URL", { cause: e });
	}
	return req;
};
var defaultContentType = "text/plain; charset=UTF-8";
var responseCache = Symbol("responseCache");
var getResponseCache = Symbol("getResponseCache");
var cacheKey = Symbol("cache");
var GlobalResponse = global.Response;
var Response$1 = class Response$1 {
	#body;
	#init;
	[getResponseCache]() {
		const cache = this[cacheKey];
		const liveHeaders = cache && cache[2] instanceof Headers ? cache[2] : void 0;
		delete this[cacheKey];
		return this[responseCache] ||= new GlobalResponse(this.#body, liveHeaders ? {
			status: this.#init?.status,
			statusText: this.#init?.statusText,
			headers: liveHeaders
		} : this.#init);
	}
	constructor(body, init) {
		let headers;
		this.#body = body;
		if (init instanceof GlobalResponse) {
			const cachedGlobalResponse = init[responseCache];
			if (cachedGlobalResponse) {
				this.#init = cachedGlobalResponse;
				this[getResponseCache]();
				return;
			}
			this.#init = init instanceof Response$1 ? init.#init : init;
			headers = new Headers(init.headers);
		} else this.#init = init;
		if (body == null || typeof body === "string" || typeof body?.getReader !== "undefined" || body instanceof Blob || body instanceof Uint8Array) this[cacheKey] = [
			init?.status || 200,
			body ?? null,
			headers || init?.headers
		];
	}
	get headers() {
		const cache = this[cacheKey];
		if (cache) {
			if (!(cache[2] instanceof Headers)) cache[2] = new Headers(cache[2] || (cache[1] === null ? void 0 : { "content-type": defaultContentType }));
			return cache[2];
		}
		return this[getResponseCache]().headers;
	}
	get status() {
		return this[cacheKey]?.[0] ?? this[getResponseCache]().status;
	}
	get ok() {
		const status = this.status;
		return status >= 200 && status < 300;
	}
};
[
	"body",
	"bodyUsed",
	"redirected",
	"statusText",
	"trailers",
	"type",
	"url"
].forEach((k) => {
	Object.defineProperty(Response$1.prototype, k, { get() {
		return this[getResponseCache]()[k];
	} });
});
[
	"arrayBuffer",
	"blob",
	"clone",
	"formData",
	"json",
	"text"
].forEach((k) => {
	Object.defineProperty(Response$1.prototype, k, { value: function() {
		return this[getResponseCache]()[k]();
	} });
});
Object.defineProperty(Response$1.prototype, Symbol.for("nodejs.util.inspect.custom"), { value: function(depth, options, inspectFn) {
	return `Response (lightweight) ${inspectFn({
		status: this.status,
		headers: this.headers,
		ok: this.ok,
		nativeResponse: this[responseCache]
	}, {
		...options,
		depth: depth == null ? null : depth - 1
	})}`;
} });
Object.setPrototypeOf(Response$1, GlobalResponse);
Object.setPrototypeOf(Response$1.prototype, GlobalResponse.prototype);
var validRedirectUrl = /^https?:\/\/[!#-;=?-[\]_a-z~A-Z]+$/;
var parseRedirectUrl = (url) => {
	if (url instanceof URL) return url.href;
	if (validRedirectUrl.test(url)) return url;
	return new URL(url).href;
};
var validRedirectStatuses = /* @__PURE__ */ new Set([
	301,
	302,
	303,
	307,
	308
]);
Object.defineProperty(Response$1, "redirect", {
	value: function redirect(url, status = 302) {
		if (!validRedirectStatuses.has(status)) throw new RangeError("Invalid status code");
		return new Response$1(null, {
			status,
			headers: { location: parseRedirectUrl(url) }
		});
	},
	writable: true,
	configurable: true
});
Object.defineProperty(Response$1, "json", {
	value: function json(data, init) {
		const body = JSON.stringify(data);
		if (body === void 0) throw new TypeError("The data is not JSON serializable");
		const initHeaders = init?.headers;
		let headers;
		if (initHeaders) {
			headers = new Headers(initHeaders);
			if (!headers.has("content-type")) headers.set("content-type", "application/json");
		} else headers = { "content-type": "application/json" };
		return new Response$1(body, {
			status: init?.status ?? 200,
			statusText: init?.statusText,
			headers
		});
	},
	writable: true,
	configurable: true
});
async function readWithoutBlocking(readPromise) {
	return Promise.race([readPromise, Promise.resolve().then(() => Promise.resolve(void 0))]);
}
function writeFromReadableStreamDefaultReader(reader, writable, currentReadPromise) {
	const cancel = (error) => {
		reader.cancel(error).catch(() => {});
	};
	writable.on("close", cancel);
	writable.on("error", cancel);
	(currentReadPromise ?? reader.read()).then(flow, handleStreamError);
	return reader.closed.finally(() => {
		writable.off("close", cancel);
		writable.off("error", cancel);
	});
	function handleStreamError(error) {
		if (error) writable.destroy(error);
	}
	function onDrain() {
		reader.read().then(flow, handleStreamError);
	}
	function flow({ done, value }) {
		try {
			if (done) writable.end();
			else if (!writable.write(value)) writable.once("drain", onDrain);
			else return reader.read().then(flow, handleStreamError);
		} catch (e) {
			handleStreamError(e);
		}
	}
}
function writeFromReadableStream(stream, writable) {
	if (stream.locked) throw new TypeError("ReadableStream is locked.");
	else if (writable.destroyed) return;
	return writeFromReadableStreamDefaultReader(stream.getReader(), writable);
}
var buildOutgoingHttpHeaders = (headers, defaultContentType) => {
	const res = {};
	if (!(headers instanceof Headers)) headers = new Headers(headers ?? void 0);
	if (headers.has("set-cookie")) {
		const cookies = [];
		for (const [k, v] of headers) if (k === "set-cookie") cookies.push(v);
		else res[k] = v;
		if (cookies.length > 0) res["set-cookie"] = cookies;
	} else for (const [k, v] of headers) res[k] = v;
	if (defaultContentType) res["content-type"] ??= defaultContentType;
	return res;
};
var outgoingEnded = Symbol("outgoingEnded");
var incomingDraining = Symbol("incomingDraining");
var DRAIN_TIMEOUT_MS = 500;
var MAX_DRAIN_BYTES = 67108864;
var drainIncoming = (incoming) => {
	const incomingWithDrainState = incoming;
	if (incoming.destroyed || incomingWithDrainState[incomingDraining]) return;
	incomingWithDrainState[incomingDraining] = true;
	if (incoming instanceof Http2ServerRequest) {
		try {
			incoming.stream?.close?.(constants.NGHTTP2_NO_ERROR);
		} catch {}
		return;
	}
	let bytesRead = 0;
	const cleanup = () => {
		clearTimeout(timer);
		incoming.off("data", onData);
		incoming.off("end", cleanup);
		incoming.off("error", cleanup);
	};
	const forceClose = () => {
		cleanup();
		const socket = incoming.socket;
		if (socket && !socket.destroyed) {
			if (typeof socket.destroySoon === "function") socket.destroySoon();
			else if (typeof socket.destroy === "function") socket.destroy();
		}
	};
	const timer = setTimeout(forceClose, DRAIN_TIMEOUT_MS);
	timer.unref?.();
	const onData = (chunk) => {
		bytesRead += chunk.length;
		if (bytesRead > MAX_DRAIN_BYTES) forceClose();
	};
	incoming.on("data", onData);
	incoming.on("end", cleanup);
	incoming.on("error", cleanup);
	incoming.resume();
};
var makeCloseHandler = (req, incoming, outgoing, needsBodyCleanup) => () => {
	if (incoming.errored) {
		recordBodyBufferedBeforeDisconnect(incoming);
		req[abortRequest](incoming.errored.toString());
	} else if (!outgoing.writableFinished) {
		recordBodyBufferedBeforeDisconnect(incoming);
		req[abortRequest]("Client connection prematurely closed.");
	}
	if (needsBodyCleanup && !incoming.readableEnded) setTimeout(() => {
		if (!incoming.readableEnded) setTimeout(() => {
			drainIncoming(incoming);
		});
	});
};
var isImmediateCacheableResponse = (res) => {
	if (!(cacheKey in res)) return false;
	const body = res[cacheKey][1];
	return body === null || typeof body === "string" || body instanceof Uint8Array;
};
var handleRequestError = () => new Response(null, { status: 400 });
var handleFetchError = (e) => new Response(null, { status: e instanceof Error && (e.name === "TimeoutError" || e.constructor.name === "TimeoutError") ? 504 : 500 });
var handleResponseError = (e, outgoing) => {
	const err = e instanceof Error ? e : new Error("unknown error", { cause: e });
	if (err.code === "ERR_STREAM_PREMATURE_CLOSE") console.info("The user aborted a request.");
	else {
		console.error(e);
		if (!outgoing.headersSent) outgoing.writeHead(500, { "Content-Type": "text/plain" });
		outgoing.end(`Error: ${err.message}`);
		outgoing.destroy(err);
	}
};
var flushHeaders = (outgoing) => {
	if ("flushHeaders" in outgoing && outgoing.writable) outgoing.flushHeaders();
};
var responseViaCache = async (res, outgoing) => {
	let [status, body, header] = res[cacheKey];
	if (!header) {
		if (body === null) {
			outgoing.writeHead(status);
			outgoing.end();
		} else if (typeof body === "string") {
			outgoing.writeHead(status, {
				"Content-Type": defaultContentType,
				"Content-Length": Buffer.byteLength(body)
			});
			outgoing.end(body);
		} else if (body instanceof Uint8Array) {
			outgoing.writeHead(status, {
				"Content-Type": defaultContentType,
				"Content-Length": body.byteLength
			});
			outgoing.end(body);
		} else if (body instanceof Blob) {
			outgoing.writeHead(status, {
				"Content-Type": defaultContentType,
				"Content-Length": body.size
			});
			outgoing.end(new Uint8Array(await body.arrayBuffer()));
		} else {
			outgoing.writeHead(status, { "Content-Type": defaultContentType });
			flushHeaders(outgoing);
			await writeFromReadableStream(body, outgoing)?.catch((e) => handleResponseError(e, outgoing));
		}
		outgoing[outgoingEnded]?.();
		return;
	}
	let hasContentLength = false;
	if (header instanceof Headers) {
		hasContentLength = header.has("content-length");
		header = buildOutgoingHttpHeaders(header, body === null ? void 0 : defaultContentType);
	} else if (Array.isArray(header)) {
		const headerObj = new Headers(header);
		hasContentLength = headerObj.has("content-length");
		header = buildOutgoingHttpHeaders(headerObj, body === null ? void 0 : defaultContentType);
	} else for (const key in header) if (key.length === 14 && key.toLowerCase() === "content-length") {
		hasContentLength = true;
		break;
	}
	if (!hasContentLength) {
		if (typeof body === "string") header["Content-Length"] = Buffer.byteLength(body);
		else if (body instanceof Uint8Array) header["Content-Length"] = body.byteLength;
		else if (body instanceof Blob) header["Content-Length"] = body.size;
	}
	outgoing.writeHead(status, header);
	if (body == null) outgoing.end();
	else if (typeof body === "string" || body instanceof Uint8Array) outgoing.end(body);
	else if (body instanceof Blob) outgoing.end(new Uint8Array(await body.arrayBuffer()));
	else {
		flushHeaders(outgoing);
		await writeFromReadableStream(body, outgoing)?.catch((e) => handleResponseError(e, outgoing));
	}
	outgoing[outgoingEnded]?.();
};
var isPromise = (res) => typeof res.then === "function";
var responseViaResponseObject = async (res, outgoing, options = {}) => {
	if (isPromise(res)) if (options.errorHandler) try {
		res = await res;
	} catch (err) {
		const errRes = await options.errorHandler(err);
		if (!errRes) return;
		res = errRes;
	}
	else res = await res.catch(handleFetchError);
	if (cacheKey in res) return responseViaCache(res, outgoing);
	const resHeaderRecord = buildOutgoingHttpHeaders(res.headers, res.body === null ? void 0 : defaultContentType);
	if (res.body) {
		const reader = res.body.getReader();
		const values = [];
		let done = false;
		let currentReadPromise = void 0;
		if (resHeaderRecord["transfer-encoding"] !== "chunked") {
			let maxReadCount = 2;
			for (let i = 0; i < maxReadCount; i++) {
				currentReadPromise ||= reader.read();
				const chunk = await readWithoutBlocking(currentReadPromise).catch((e) => {
					console.error(e);
					done = true;
				});
				if (!chunk) {
					if (i === 1) {
						await new Promise((resolve) => setTimeout(resolve));
						maxReadCount = 3;
						continue;
					}
					break;
				}
				currentReadPromise = void 0;
				if (chunk.value) values.push(chunk.value);
				if (chunk.done) {
					done = true;
					break;
				}
			}
			if (done && !("content-length" in resHeaderRecord)) resHeaderRecord["content-length"] = values.reduce((acc, value) => acc + value.length, 0);
		}
		outgoing.writeHead(res.status, resHeaderRecord);
		values.forEach((value) => {
			outgoing.write(value);
		});
		if (done) outgoing.end();
		else {
			if (values.length === 0) flushHeaders(outgoing);
			await writeFromReadableStreamDefaultReader(reader, outgoing, currentReadPromise);
		}
	} else if (resHeaderRecord["x-hono-already-sent"]) {} else {
		outgoing.writeHead(res.status, resHeaderRecord);
		outgoing.end();
	}
	outgoing[outgoingEnded]?.();
};
var getRequestListener = (fetchCallback, options = {}) => {
	const autoCleanupIncoming = options.autoCleanupIncoming ?? true;
	if (options.overrideGlobalObjects !== false && global.Request !== Request$1) {
		Object.defineProperty(global, "Request", { value: Request$1 });
		Object.defineProperty(global, "Response", { value: Response$1 });
	}
	return async (incoming, outgoing) => {
		let res, req;
		let needsBodyCleanup = false;
		let closeHandlerAttached = false;
		const ensureCloseHandler = () => {
			if (!req || closeHandlerAttached) return;
			closeHandlerAttached = true;
			outgoing.on("close", makeCloseHandler(req, incoming, outgoing, needsBodyCleanup));
		};
		try {
			req = newRequest(incoming, options.hostname);
			needsBodyCleanup = autoCleanupIncoming && !(incoming.method === "GET" || incoming.method === "HEAD");
			if (needsBodyCleanup) {
				incoming[wrapBodyStream] = true;
				if (incoming instanceof Http2ServerRequest) outgoing[outgoingEnded] = () => {
					if (!incoming.readableEnded) setTimeout(() => {
						if (!incoming.readableEnded) setTimeout(() => {
							incoming.destroy();
							outgoing.destroy();
						});
					});
				};
			}
			res = fetchCallback(req, {
				incoming,
				outgoing
			});
			if (!isPromise(res) && isImmediateCacheableResponse(res)) {
				if (needsBodyCleanup && !incoming.readableEnded) outgoing.once("finish", () => {
					if (!incoming.readableEnded) drainIncoming(incoming);
				});
				return responseViaCache(res, outgoing);
			}
			ensureCloseHandler();
		} catch (e) {
			if (!res) if (options.errorHandler) {
				ensureCloseHandler();
				res = await options.errorHandler(req ? e : toRequestError(e));
				if (!res) return;
			} else if (!req) res = handleRequestError();
			else res = handleFetchError(e);
			else return handleResponseError(e, outgoing);
		}
		try {
			return await responseViaResponseObject(res, outgoing, options);
		} catch (e) {
			return handleResponseError(e, outgoing);
		}
	};
};
globalThis.CloseEvent;
globalThis.ErrorEvent;
var CONNECTION_SYMBOL_KEY = Symbol("CONNECTION_SYMBOL_KEY");
var WAIT_FOR_WEBSOCKET_SYMBOL = Symbol("WAIT_FOR_WEBSOCKET_SYMBOL");
var responseHeadersToSkip = /* @__PURE__ */ new Set([
	"connection",
	"content-length",
	"keep-alive",
	"proxy-authenticate",
	"proxy-authorization",
	"te",
	"trailer",
	"transfer-encoding",
	"upgrade",
	"sec-websocket-accept",
	"sec-websocket-extensions",
	"sec-websocket-protocol"
]);
var appendResponseHeaders = (headers, responseHeaders) => {
	if (!responseHeaders) return;
	responseHeaders.forEach((value, key) => {
		if (responseHeadersToSkip.has(key.toLowerCase())) return;
		headers.push(`${key}: ${value}`);
	});
};
var rejectUpgradeRequest = (socket, status, responseHeaders) => {
	const responseLines = ["Connection: close", "Content-Length: 0"];
	appendResponseHeaders(responseLines, responseHeaders);
	socket.end(`HTTP/1.1 ${status.toString()} ${STATUS_CODES[status] ?? ""}\r\n${responseLines.join("\r\n")}\r\n\r
`);
};
var createUpgradeRequest = (request) => {
	const protocol = request.socket.encrypted ? "https" : "http";
	const url = new URL(request.url ?? "/", `${protocol}://${request.headers.host ?? "localhost"}`);
	const headers = new Headers();
	for (const key in request.headers) {
		const value = request.headers[key];
		if (!value) continue;
		headers.append(key, Array.isArray(value) ? value[0] : value);
	}
	return new Request(url, { headers });
};
var setupWebSocket = (options) => {
	const { server, fetchCallback, wss } = options;
	const waiterMap = /* @__PURE__ */ new Map();
	wss.on("connection", (ws, request) => {
		const waiter = waiterMap.get(request);
		if (waiter) {
			waiter.resolve(ws);
			waiterMap.delete(request);
		}
	});
	const rejectWaiter = (request) => {
		const waiter = waiterMap.get(request);
		if (waiter) {
			waiterMap.delete(request);
			waiter.reject(/* @__PURE__ */ new Error("WebSocket handshake aborted"));
		}
	};
	const waitForWebSocket = (request, connectionSymbol) => {
		return new Promise((resolve, reject) => {
			waiterMap.set(request, {
				resolve,
				reject,
				connectionSymbol
			});
		});
	};
	server.on("upgrade", async (request, socket, head) => {
		if (request.headers.upgrade?.toLowerCase() !== "websocket") return;
		const env = {
			incoming: request,
			outgoing: void 0,
			wss,
			[WAIT_FOR_WEBSOCKET_SYMBOL]: waitForWebSocket
		};
		let status = 400;
		let responseHeaders;
		try {
			const response = await fetchCallback(createUpgradeRequest(request), env);
			if (response instanceof Response) {
				status = response.status;
				responseHeaders = response.headers;
			}
		} catch {
			if (server.listenerCount("upgrade") === 1) rejectUpgradeRequest(socket, 500);
			return;
		}
		const waiter = waiterMap.get(request);
		if (!waiter || waiter.connectionSymbol !== env[CONNECTION_SYMBOL_KEY]) {
			rejectWaiter(request);
			if (server.listenerCount("upgrade") === 1) rejectUpgradeRequest(socket, status, responseHeaders);
			return;
		}
		const addResponseHeaders = (headers) => {
			appendResponseHeaders(headers, responseHeaders);
		};
		const reclaimWaiterOnClose = () => rejectWaiter(request);
		socket.once("close", reclaimWaiterOnClose);
		wss.on("headers", addResponseHeaders);
		try {
			wss.handleUpgrade(request, socket, head, (ws) => {
				socket.off("close", reclaimWaiterOnClose);
				wss.emit("connection", ws, request);
			});
		} finally {
			wss.off("headers", addResponseHeaders);
		}
	});
	server.on("close", () => {
		wss.close();
	});
};
var createAdaptorServer = (options) => {
	const fetchCallback = options.fetch;
	const requestListener = getRequestListener(fetchCallback, {
		hostname: options.hostname,
		overrideGlobalObjects: options.overrideGlobalObjects,
		autoCleanupIncoming: options.autoCleanupIncoming
	});
	const server = (options.createServer || createServer)(options.serverOptions || {}, requestListener);
	if (options.websocket && options.websocket.server) {
		if (options.websocket.server.options.noServer !== true) throw new Error("WebSocket server must be created with { noServer: true } option");
		setupWebSocket({
			server,
			fetchCallback,
			wss: options.websocket.server
		});
	}
	return server;
};
var serve = (options, listeningListener) => {
	const server = createAdaptorServer(options);
	server.listen(options?.port ?? 3e3, options.hostname, () => {
		const serverInfo = server.address();
		listeningListener && listeningListener(serverInfo);
	});
	return server;
};
//#endregion
//#region node_modules/@hono/node-server/dist/utils/stream.mjs
var pr54206Applied = () => {
	const [major, minor] = versions.node.split(".").map((component) => parseInt(component));
	return major >= 23 || major === 22 && minor >= 7 || major === 20 && minor >= 18;
};
var useReadableToWeb = pr54206Applied();
var createStreamBody = (stream, useNativeReadableToWeb = useReadableToWeb) => {
	if (useNativeReadableToWeb) return Readable.toWeb(stream);
	let controller;
	let settled = false;
	const cleanup = () => {
		stream.off("data", onData);
		stream.off("error", onError);
		stream.off("end", onTerminate);
		stream.off("close", onTerminate);
	};
	const settle = (callback) => {
		if (settled) return;
		settled = true;
		cleanup();
		callback?.();
	};
	const onData = (chunk) => {
		if (settled || !controller) return;
		controller.enqueue(chunk);
		if ((controller.desiredSize ?? 0) <= 0) stream.pause();
	};
	const onError = (error) => {
		settle(() => {
			controller?.error(error);
		});
	};
	const onTerminate = () => {
		settle(() => {
			controller?.close();
		});
	};
	return new ReadableStream({
		start(streamController) {
			controller = streamController;
			stream.on("data", onData);
			stream.on("error", onError);
			stream.on("end", onTerminate);
			stream.on("close", onTerminate);
			stream.pause();
		},
		pull() {
			if (!settled) stream.resume();
		},
		cancel() {
			settle();
			const ignoreError = () => {};
			stream.on("error", ignoreError);
			stream.once("close", () => stream.off("error", ignoreError));
			stream.destroy();
		}
	});
};
//#endregion
//#region node_modules/hono/dist/utils/mime.js
var getMimeType = (filename, mimes = baseMimes) => {
	const match = filename.match(/\.([a-zA-Z0-9]+?)$/);
	if (!match) return;
	return mimes[match[1].toLowerCase()];
};
var baseMimes = {
	aac: "audio/aac",
	avi: "video/x-msvideo",
	avif: "image/avif",
	av1: "video/av1",
	bin: "application/octet-stream",
	bmp: "image/bmp",
	css: "text/css; charset=utf-8",
	csv: "text/csv; charset=utf-8",
	eot: "application/vnd.ms-fontobject",
	epub: "application/epub+zip",
	gif: "image/gif",
	gz: "application/gzip",
	htm: "text/html; charset=utf-8",
	html: "text/html; charset=utf-8",
	ico: "image/x-icon",
	ics: "text/calendar; charset=utf-8",
	jpeg: "image/jpeg",
	jpg: "image/jpeg",
	js: "text/javascript; charset=utf-8",
	json: "application/json",
	jsonld: "application/ld+json",
	map: "application/json",
	mid: "audio/x-midi",
	midi: "audio/x-midi",
	mjs: "text/javascript; charset=utf-8",
	mp3: "audio/mpeg",
	mp4: "video/mp4",
	mpeg: "video/mpeg",
	oga: "audio/ogg",
	ogv: "video/ogg",
	ogx: "application/ogg",
	opus: "audio/opus",
	otf: "font/otf",
	pdf: "application/pdf",
	png: "image/png",
	rtf: "application/rtf",
	svg: "image/svg+xml; charset=utf-8",
	tif: "image/tiff",
	tiff: "image/tiff",
	ts: "video/mp2t",
	ttf: "font/ttf",
	txt: "text/plain; charset=utf-8",
	wasm: "application/wasm",
	webm: "video/webm",
	weba: "audio/webm",
	webmanifest: "application/manifest+json",
	webp: "image/webp",
	woff: "font/woff",
	woff2: "font/woff2",
	xhtml: "application/xhtml+xml; charset=utf-8",
	xml: "application/xml; charset=utf-8",
	zip: "application/zip",
	"3gp": "video/3gpp",
	"3g2": "video/3gpp2",
	gltf: "model/gltf+json",
	glb: "model/gltf-binary"
};
//#endregion
//#region node_modules/@hono/node-server/dist/serve-static.mjs
var COMPRESSIBLE_CONTENT_TYPE_REGEX = /^\s*(?:text\/[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i;
var ENCODINGS = {
	br: ".br",
	zstd: ".zst",
	gzip: ".gz"
};
var ENCODINGS_ORDERED_KEYS = Object.keys(ENCODINGS);
var getStats = (path) => {
	let stats;
	try {
		stats = statSync(path);
	} catch {}
	return stats;
};
var BYTE_RANGE_PATTERN = /^(?:bytes=)?(?!-$)(\d*)-(\d*)$/;
var parseByteRange = (range) => {
	const match = range.match(BYTE_RANGE_PATTERN);
	if (!match) return;
	const [, start, end] = match;
	if (start === "") return {
		type: "suffix",
		length: Number(end)
	};
	if (end === "") return {
		type: "open-ended",
		start: Number(start)
	};
	return {
		type: "bounded",
		start: Number(start),
		end: Number(end)
	};
};
var resolveByteRange = (spec, size) => {
	if (size === 0) return;
	if (spec.type === "suffix") {
		if (spec.length === 0) return;
		return {
			start: Math.max(size - spec.length, 0),
			end: size - 1
		};
	}
	const end = spec.type === "bounded" ? Math.min(spec.end, size - 1) : size - 1;
	if (spec.start >= size || spec.start > end) return;
	return {
		start: spec.start,
		end
	};
};
var tryDecode$1 = (str, decoder) => {
	try {
		return decoder(str);
	} catch {
		return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match) => {
			try {
				return decoder(match);
			} catch {
				return match;
			}
		});
	}
};
var tryDecodeURI$1 = (str) => tryDecode$1(str, decodeURI);
var serveStatic = (options = { root: "" }) => {
	const root = options.root || "";
	const optionPath = options.path;
	if (root !== "" && !existsSync(root)) console.error(`serveStatic: root path '${root}' is not found, are you sure it's correct?`);
	return async (c, next) => {
		if (c.finalized) return next();
		let filename;
		if (optionPath) filename = optionPath;
		else try {
			filename = tryDecodeURI$1(c.req.path);
			if (/(?:^|[\/\\])\.{1,2}(?:$|[\/\\])|[\/\\]{2,}|\\/.test(filename)) throw new Error();
		} catch {
			await options.onNotFound?.(c.req.path, c);
			return next();
		}
		let path = join(root, !optionPath && options.rewriteRequestPath ? options.rewriteRequestPath(filename, c) : filename);
		let stats = getStats(path);
		if (stats && stats.isDirectory()) {
			const indexFile = options.index ?? "index.html";
			path = join(path, indexFile);
			stats = getStats(path);
		}
		if (!stats) {
			await options.onNotFound?.(path, c);
			return next();
		}
		const mimeType = getMimeType(path);
		c.header("Content-Type", mimeType || "application/octet-stream");
		if (options.precompressed && (!mimeType || mimeType === "application/octet-stream" || COMPRESSIBLE_CONTENT_TYPE_REGEX.test(mimeType))) {
			const acceptEncodingSet = new Set(c.req.header("Accept-Encoding")?.split(",").map((encoding) => encoding.trim()));
			for (const encoding of ENCODINGS_ORDERED_KEYS) {
				if (!acceptEncodingSet.has(encoding)) continue;
				const precompressedStats = getStats(path + ENCODINGS[encoding]);
				if (precompressedStats) {
					c.header("Content-Encoding", encoding);
					c.header("Vary", "Accept-Encoding", { append: true });
					stats = precompressedStats;
					path = path + ENCODINGS[encoding];
					break;
				}
			}
		}
		let result;
		const size = stats.size;
		const range = c.req.header("range") || "";
		c.header("Last-Modified", stats.mtime.toUTCString());
		if (c.req.method == "HEAD" || c.req.method == "OPTIONS") {
			c.header("Content-Length", size.toString());
			c.status(200);
			result = c.body(null);
		} else if (!range) {
			c.header("Content-Length", size.toString());
			result = c.body(createStreamBody(createReadStream(path)), 200);
		} else {
			c.header("Accept-Ranges", "bytes");
			const resolvedRange = resolveByteRange(parseByteRange(range) ?? {
				type: "open-ended",
				start: 0
			}, size);
			if (!resolvedRange) {
				c.header("Content-Range", `bytes */${size}`);
				result = c.body(null, 416);
			} else {
				const { start, end } = resolvedRange;
				const chunkSize = end - start + 1;
				const stream = createReadStream(path, {
					start,
					end
				});
				c.header("Content-Length", chunkSize.toString());
				c.header("Content-Range", `bytes ${start}-${end}/${size}`);
				result = c.body(createStreamBody(stream), 206);
			}
		}
		await options.onFound?.(path, c);
		return result;
	};
};
//#endregion
//#region node_modules/hono/dist/http-exception.js
var HTTPException = class extends Error {
	res;
	status;
	/**
	* Creates an instance of `HTTPException`.
	* @param status - HTTP status code for the exception. Defaults to 500.
	* @param options - Additional options for the exception.
	*/
	constructor(status = 500, options) {
		super(options?.message, { cause: options?.cause });
		this.res = options?.res;
		this.status = status;
	}
	/**
	* Returns the response object associated with the exception.
	* If a response object is not provided, a new response is created with the error message and status code.
	* @returns The response object.
	*/
	getResponse() {
		if (this.res) return new Response(this.res.body, {
			status: this.status,
			headers: this.res.headers
		});
		return new Response(this.message, { status: this.status });
	}
};
//#endregion
//#region node_modules/hono/dist/middleware/body-limit/index.js
var ERROR_MESSAGE = "Payload Too Large";
var bodyLimit = (options) => {
	const onError = options.onError || (() => {
		throw new HTTPException(413, { res: new Response(ERROR_MESSAGE, { status: 413 }) });
	});
	const maxSize = options.maxSize;
	return async function bodyLimit2(c, next) {
		if (!c.req.raw.body) return next();
		const hasTransferEncoding = c.req.raw.headers.has("transfer-encoding");
		if (c.req.raw.headers.has("content-length") && !hasTransferEncoding) return parseInt(c.req.raw.headers.get("content-length") || "0", 10) > maxSize ? onError(c) : next();
		let size = 0;
		const chunks = [];
		const rawReader = c.req.raw.body.getReader();
		for (;;) {
			const { done, value } = await rawReader.read();
			if (done) break;
			size += value.length;
			if (size > maxSize) return onError(c);
			chunks.push(value);
		}
		const requestInit = {
			body: new ReadableStream({ start(controller) {
				for (const chunk of chunks) controller.enqueue(chunk);
				controller.close();
			} }),
			duplex: "half"
		};
		c.req.raw = new Request(c.req.raw, requestInit);
		return next();
	};
};
//#endregion
//#region node_modules/hono/dist/compose.js
var compose = (middleware, onError, onNotFound) => {
	return (context, next) => {
		let index = -1;
		return dispatch(0);
		async function dispatch(i) {
			if (i <= index) throw new Error("next() called multiple times");
			index = i;
			let res;
			let isError = false;
			let handler;
			if (middleware[i]) {
				handler = middleware[i][0][0];
				context.req.routeIndex = i;
			} else handler = i === middleware.length && next || void 0;
			if (handler) try {
				res = await handler(context, () => dispatch(i + 1));
			} catch (err) {
				if (err instanceof Error && onError) {
					context.error = err;
					res = await onError(err, context);
					isError = true;
				} else throw err;
			}
			else if (context.finalized === false && onNotFound) res = await onNotFound(context);
			if (res && (context.finalized === false || isError)) context.res = res;
			return context;
		}
	};
};
//#endregion
//#region node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();
//#endregion
//#region node_modules/hono/dist/utils/buffer.js
var bufferToFormData = (arrayBuffer, contentType) => {
	return new Response(arrayBuffer, { headers: { "Content-Type": contentType.replace(/^[^;]+/, (mediaType) => mediaType.toLowerCase()) } }).formData();
};
//#endregion
//#region node_modules/hono/dist/utils/body.js
var MAX_NESTING_DEPTH = 32;
var MAX_NESTED_OBJECTS = 1e4;
var isRawRequest = (request) => "headers" in request;
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
	const { all = false, dot = false } = options;
	const mediaType = (isRawRequest(request) ? request.headers : request.raw.headers).get("Content-Type")?.split(";")[0].trim().toLowerCase();
	if (mediaType === "multipart/form-data" || mediaType === "application/x-www-form-urlencoded") return parseFormData(request, {
		all,
		dot
	});
	return {};
};
async function parseFormData(request, options) {
	if (!isRawRequest(request) && request.bodyCache.formData) return convertFormDataToBodyData(await request.bodyCache.formData, options);
	const headers = isRawRequest(request) ? request.headers : request.raw.headers;
	const formDataPromise = bufferToFormData(await request.arrayBuffer(), headers.get("Content-Type") || "");
	if (!isRawRequest(request)) request.bodyCache.formData = formDataPromise;
	const formData = await formDataPromise;
	if (formData) return convertFormDataToBodyData(formData, options);
	return {};
}
function convertFormDataToBodyData(formData, options) {
	const form = /* @__PURE__ */ Object.create(null);
	const nestingState = { count: 0 };
	formData.forEach((value, key) => {
		if (!(options.all || key.endsWith("[]"))) form[key] = value;
		else handleParsingAllValues(form, key, value);
	});
	if (options.dot) Object.entries(form).forEach(([key, value]) => {
		if (key.includes(".")) {
			handleParsingNestedValues(form, key, value, nestingState);
			delete form[key];
		}
	});
	return form;
}
var handleParsingAllValues = (form, key, value) => {
	if (form[key] !== void 0) {
		if (Array.isArray(form[key])) form[key].push(value);
		else form[key] = [form[key], value];
	} else if (!key.endsWith("[]")) form[key] = value;
	else form[key] = [value];
};
var handleParsingNestedValues = (form, key, value, state) => {
	if (/(?:^|\.)__proto__\./.test(key)) return;
	let nestedForm = form;
	const keys = key.split(".", MAX_NESTING_DEPTH + 2);
	if (keys.length > MAX_NESTING_DEPTH + 1) throwNestingLimitExceeded();
	keys.forEach((key2, index) => {
		if (index === keys.length - 1) nestedForm[key2] = value;
		else {
			if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
				if (state.count++ >= MAX_NESTED_OBJECTS) throwNestingLimitExceeded();
				nestedForm[key2] = /* @__PURE__ */ Object.create(null);
			}
			nestedForm = nestedForm[key2];
		}
	});
};
var throwNestingLimitExceeded = () => {
	throw new Error("Nesting limit exceeded");
};
//#endregion
//#region node_modules/hono/dist/utils/url.js
var tryDecode = (str, decoder) => {
	try {
		return decoder(str);
	} catch {
		return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match) => {
			try {
				return decoder(match);
			} catch {
				return match;
			}
		});
	}
};
var tryDecodeURI = (str) => tryDecode(str, decodeURI);
var getPath = (request) => {
	const url = request.url;
	const start = url.indexOf("/", url.indexOf(":") + 4);
	let i = start;
	for (; i < url.length; i++) {
		const charCode = url.charCodeAt(i);
		if (charCode === 37) {
			const queryIndex = url.indexOf("?", i);
			const hashIndex = url.indexOf("#", i);
			const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
			const path = url.slice(start, end);
			return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
		} else if (charCode === 63 || charCode === 35) break;
	}
	return url.slice(start, i);
};
var getPathNoStrict = (request) => {
	const result = getPath(request);
	return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (base, sub, ...rest) => {
	if (rest.length) sub = mergePath(sub, ...rest);
	return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
};
var tryDecodeURIComponent = (str) => str.indexOf("%") !== -1 ? tryDecode(str, decodeURIComponent_) : str;
var _decodeURI = (value) => {
	if (value.indexOf("+") !== -1) value = value.replace(/\+/g, " ");
	return tryDecodeURIComponent(value);
};
var _getQueryParam = (url, key, multiple) => {
	const hashIndex = url.indexOf("#", 8);
	if (hashIndex !== -1) url = url.slice(0, hashIndex);
	let encoded;
	if (!multiple && key && key.indexOf("%") === -1 && key.indexOf("+") === -1) {
		let keyIndex2 = url.indexOf("?", 8);
		if (keyIndex2 === -1) return;
		if (!url.startsWith(key, keyIndex2 + 1)) keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
		while (keyIndex2 !== -1) {
			const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
			if (trailingKeyCode === 61) {
				const valueIndex = keyIndex2 + key.length + 2;
				const endIndex = url.indexOf("&", valueIndex);
				return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
			} else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) return "";
			keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
		}
		encoded = /[%+]/.test(url);
		if (!encoded) return;
	}
	const results = /* @__PURE__ */ Object.create(null);
	encoded ??= /[%+]/.test(url);
	let keyIndex = url.indexOf("?", 8);
	while (keyIndex !== -1) {
		const nextKeyIndex = url.indexOf("&", keyIndex + 1);
		let valueIndex = url.indexOf("=", keyIndex);
		if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) valueIndex = -1;
		let name = url.slice(keyIndex + 1, valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex);
		if (encoded) name = _decodeURI(name);
		keyIndex = nextKeyIndex;
		if (name === "") continue;
		let value;
		if (valueIndex === -1) value = "";
		else {
			value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
			if (encoded) value = _decodeURI(value);
		}
		if (multiple) {
			if (!(results[name] && Array.isArray(results[name]))) results[name] = [];
			results[name].push(value);
		} else results[name] ??= value;
	}
	return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
	return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;
//#endregion
//#region node_modules/hono/dist/request.js
var HonoRequest = class {
	/**
	* `.raw` can get the raw Request object.
	*
	* @see {@link https://hono.dev/docs/api/request#raw}
	*
	* @example
	* ```ts
	* // For Cloudflare Workers
	* app.post('/', async (c) => {
	*   const metadata = c.req.raw.cf?.hostMetadata?
	*   ...
	* })
	* ```
	*/
	raw;
	#validatedData;
	#matchResult;
	routeIndex = 0;
	/**
	* `.path` can get the pathname of the request.
	*
	* @see {@link https://hono.dev/docs/api/request#path}
	*
	* @example
	* ```ts
	* app.get('/about/me', (c) => {
	*   const pathname = c.req.path // `/about/me`
	* })
	* ```
	*/
	path;
	bodyCache = {};
	constructor(request, path = "/", matchResult = [[]]) {
		this.raw = request;
		this.path = path;
		this.#matchResult = matchResult;
	}
	param(key) {
		return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
	}
	#getDecodedParam(key) {
		const paramKey = this.#matchResult[0][this.routeIndex]?.[1][key];
		const param = this.#getParamValue(paramKey);
		return param && tryDecodeURIComponent(param);
	}
	#getAllDecodedParams() {
		const decoded = {};
		const keys = Object.keys(this.#matchResult[0][this.routeIndex]?.[1] ?? {});
		for (const key of keys) {
			const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
			if (value !== void 0) decoded[key] = tryDecodeURIComponent(value);
		}
		return decoded;
	}
	#getParamValue(paramKey) {
		return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
	}
	query(key) {
		return getQueryParam(this.url, key);
	}
	queries(key) {
		return getQueryParams(this.url, key);
	}
	header(name) {
		if (name) return this.raw.headers.get(name) ?? void 0;
		const headerData = /* @__PURE__ */ Object.create(null);
		this.raw.headers.forEach((value, key) => {
			headerData[key] = value;
		});
		return headerData;
	}
	async parseBody(options) {
		return parseBody(this, options);
	}
	#cachedBody = (key) => {
		const { bodyCache, raw } = this;
		const cachedBody = bodyCache[key];
		if (cachedBody) return cachedBody;
		for (const anyCachedKey in bodyCache) return bodyCache[anyCachedKey].then((body) => {
			if (anyCachedKey === "json") body = JSON.stringify(body);
			return new Response(body)[key]();
		});
		return bodyCache[key] = raw[key]();
	};
	/**
	* `.json()` can parse Request body of type `application/json`
	*
	* @see {@link https://hono.dev/docs/api/request#json}
	*
	* @example
	* ```ts
	* app.post('/entry', async (c) => {
	*   const body = await c.req.json()
	* })
	* ```
	*/
	json() {
		return this.#cachedBody("text").then((text) => JSON.parse(text));
	}
	/**
	* `.text()` can parse Request body of type `text/plain`
	*
	* @see {@link https://hono.dev/docs/api/request#text}
	*
	* @example
	* ```ts
	* app.post('/entry', async (c) => {
	*   const body = await c.req.text()
	* })
	* ```
	*/
	text() {
		return this.#cachedBody("text");
	}
	/**
	* `.arrayBuffer()` parse Request body as an `ArrayBuffer`
	*
	* @see {@link https://hono.dev/docs/api/request#arraybuffer}
	*
	* @example
	* ```ts
	* app.post('/entry', async (c) => {
	*   const body = await c.req.arrayBuffer()
	* })
	* ```
	*/
	arrayBuffer() {
		return this.#cachedBody("arrayBuffer");
	}
	/**
	* `.bytes()` parses the request body as a `Uint8Array`.
	*
	* @see {@link https://hono.dev/docs/api/request#bytes}
	*
	* @example
	* ```ts
	* app.post('/entry', async (c) => {
	*   const body = await c.req.bytes()
	* })
	* ```
	*/
	bytes() {
		return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
	}
	/**
	* Parses the request body as a `Blob`.
	* @example
	* ```ts
	* app.post('/entry', async (c) => {
	*   const body = await c.req.blob();
	* });
	* ```
	* @see https://hono.dev/docs/api/request#blob
	*/
	blob() {
		return this.#cachedBody("blob");
	}
	/**
	* Parses the request body as `FormData`.
	* @example
	* ```ts
	* app.post('/entry', async (c) => {
	*   const body = await c.req.formData();
	* });
	* ```
	* @see https://hono.dev/docs/api/request#formdata
	*/
	formData() {
		return this.#cachedBody("formData");
	}
	/**
	* Adds validated data to the request.
	*
	* @param target - The target of the validation.
	* @param data - The validated data to add.
	*/
	addValidatedData(target, data) {
		(this.#validatedData ??= {})[target] = data;
	}
	valid(target) {
		return this.#validatedData?.[target];
	}
	/**
	* `.url()` can get the request url strings.
	*
	* @see {@link https://hono.dev/docs/api/request#url}
	*
	* @example
	* ```ts
	* app.get('/about/me', (c) => {
	*   const url = c.req.url // `http://localhost:8787/about/me`
	*   ...
	* })
	* ```
	*/
	get url() {
		return this.raw.url;
	}
	/**
	* `.method()` can get the method name of the request.
	*
	* @see {@link https://hono.dev/docs/api/request#method}
	*
	* @example
	* ```ts
	* app.get('/about/me', (c) => {
	*   const method = c.req.method // `GET`
	* })
	* ```
	*/
	get method() {
		return this.raw.method;
	}
	get [GET_MATCH_RESULT]() {
		return this.#matchResult;
	}
	/**
	* `.matchedRoutes()` can return a matched route in the handler
	*
	* @deprecated
	*
	* Use matchedRoutes helper defined in "hono/route" instead.
	*
	* @see {@link https://hono.dev/docs/api/request#matchedroutes}
	*
	* @example
	* ```ts
	* app.use('*', async function logger(c, next) {
	*   await next()
	*   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
	*     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
	*     console.log(
	*       method,
	*       ' ',
	*       path,
	*       ' '.repeat(Math.max(10 - path.length, 0)),
	*       name,
	*       i === c.req.routeIndex ? '<- respond from here' : ''
	*     )
	*   })
	* })
	* ```
	*/
	get matchedRoutes() {
		return this.#matchResult[0].map(([[, route]]) => route);
	}
	/**
	* `routePath()` can retrieve the path registered within the handler
	*
	* @deprecated
	*
	* Use routePath helper defined in "hono/route" instead.
	*
	* @see {@link https://hono.dev/docs/api/request#routepath}
	*
	* @example
	* ```ts
	* app.get('/posts/:id', (c) => {
	*   return c.json({ path: c.req.routePath })
	* })
	* ```
	*/
	get routePath() {
		return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
	}
};
//#endregion
//#region node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
	Stringify: 1,
	BeforeStream: 2,
	Stream: 3
};
var raw = (value, callbacks) => {
	const escapedString = new String(value);
	escapedString.isEscaped = true;
	escapedString.callbacks = callbacks;
	return escapedString;
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
	if (typeof str === "object" && !(str instanceof String)) {
		if (!(str instanceof Promise)) str = str.toString();
		if (str instanceof Promise) str = await str;
	}
	const callbacks = str.callbacks;
	if (!callbacks?.length) return Promise.resolve(str);
	if (buffer) buffer[0] += str;
	else buffer = [str];
	const resStr = Promise.all(callbacks.map((c) => c({
		phase,
		buffer,
		context
	}))).then((res) => Promise.all(res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))).then(() => buffer[0]));
	if (preserveCallbacks) return raw(await resStr, callbacks);
	else return resStr;
};
//#endregion
//#region node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = (contentType, headers) => {
	return {
		"Content-Type": contentType,
		...headers
	};
};
var createResponseInstance = (body, init) => new Response(body, init);
var Context = class {
	#rawRequest;
	#req;
	/**
	* `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
	*
	* @see {@link https://hono.dev/docs/api/context#env}
	*
	* @example
	* ```ts
	* // Environment object for Cloudflare Workers
	* app.get('*', async c => {
	*   const counter = c.env.COUNTER
	* })
	* ```
	*/
	env = {};
	#var;
	finalized = false;
	/**
	* `.error` can get the error object from the middleware if the Handler throws an error.
	*
	* @see {@link https://hono.dev/docs/api/context#error}
	*
	* @example
	* ```ts
	* app.use('*', async (c, next) => {
	*   await next()
	*   if (c.error) {
	*     // do something...
	*   }
	* })
	* ```
	*/
	error;
	#status;
	#executionCtx;
	#res;
	#layout;
	#renderer;
	#notFoundHandler;
	#preparedHeaders;
	#matchResult;
	#path;
	/**
	* Creates an instance of the Context class.
	*
	* @param req - The Request object.
	* @param options - Optional configuration options for the context.
	*/
	constructor(req, options) {
		this.#rawRequest = req;
		if (options) {
			this.#executionCtx = options.executionCtx;
			this.env = options.env;
			this.#notFoundHandler = options.notFoundHandler;
			this.#path = options.path;
			this.#matchResult = options.matchResult;
		}
	}
	/**
	* `.req` is the instance of {@link HonoRequest}.
	*/
	get req() {
		this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
		return this.#req;
	}
	/**
	* @see {@link https://hono.dev/docs/api/context#event}
	* The FetchEvent associated with the current request.
	*
	* @throws Will throw an error if the context does not have a FetchEvent.
	*/
	get event() {
		if (this.#executionCtx && "respondWith" in this.#executionCtx) return this.#executionCtx;
		else throw Error("This context has no FetchEvent");
	}
	/**
	* @see {@link https://hono.dev/docs/api/context#executionctx}
	* The ExecutionContext associated with the current request.
	*
	* @throws Will throw an error if the context does not have an ExecutionContext.
	*/
	get executionCtx() {
		if (this.#executionCtx) return this.#executionCtx;
		else throw Error("This context has no ExecutionContext");
	}
	/**
	* @see {@link https://hono.dev/docs/api/context#res}
	* The Response object for the current request.
	*/
	get res() {
		return this.#res ||= createResponseInstance(null, { headers: this.#preparedHeaders ??= new Headers() });
	}
	/**
	* Sets the Response object for the current request.
	*
	* @param _res - The Response object to set.
	*/
	set res(_res) {
		if (this.#res && _res) {
			_res = createResponseInstance(_res.body, _res);
			for (const [k, v] of this.#res.headers.entries()) {
				if (k === "content-type") continue;
				if (k === "set-cookie") {
					const cookies = this.#res.headers.getSetCookie();
					_res.headers.delete("set-cookie");
					for (const cookie of cookies) _res.headers.append("set-cookie", cookie);
				} else _res.headers.set(k, v);
			}
		}
		this.#res = _res;
		this.finalized = true;
	}
	/**
	* `.render()` can create a response within a layout.
	*
	* @see {@link https://hono.dev/docs/api/context#render-setrenderer}
	*
	* @example
	* ```ts
	* app.get('/', (c) => {
	*   return c.render('Hello!')
	* })
	* ```
	*/
	render = (...args) => {
		this.#renderer ??= (content) => this.html(content);
		return this.#renderer(...args);
	};
	/**
	* Sets the layout for the response.
	*
	* @param layout - The layout to set.
	* @returns The layout function.
	*/
	setLayout = (layout) => this.#layout = layout;
	/**
	* Gets the current layout for the response.
	*
	* @returns The current layout function.
	*/
	getLayout = () => this.#layout;
	/**
	* `.setRenderer()` can set the layout in the custom middleware.
	*
	* @see {@link https://hono.dev/docs/api/context#render-setrenderer}
	*
	* @example
	* ```tsx
	* app.use('*', async (c, next) => {
	*   c.setRenderer((content) => {
	*     return c.html(
	*       <html>
	*         <body>
	*           <p>{content}</p>
	*         </body>
	*       </html>
	*     )
	*   })
	*   await next()
	* })
	* ```
	*/
	setRenderer = (renderer) => {
		this.#renderer = renderer;
	};
	/**
	* `.header()` can set headers.
	*
	* @see {@link https://hono.dev/docs/api/context#header}
	*
	* @example
	* ```ts
	* app.get('/welcome', (c) => {
	*   // Set headers
	*   c.header('X-Message', 'Hello!')
	*   c.header('Content-Type', 'text/plain')
	*
	*   // Append multiple headers using the append option (e.g. Vary)
	*   c.header('Vary', 'Accept-Encoding', { append: true })
	*   c.header('Vary', 'User-Agent', { append: true })
	*
	*   return c.body('Thank you for coming')
	* })
	* ```
	*/
	header = (name, value, options) => {
		if (this.finalized) this.#res = createResponseInstance(this.#res.body, this.#res);
		const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
		if (value === void 0) headers.delete(name);
		else if (options?.append) headers.append(name, value);
		else headers.set(name, value);
	};
	status = (status) => {
		this.#status = status;
	};
	/**
	* `.set()` can set the value specified by the key.
	*
	* @see {@link https://hono.dev/docs/api/context#set-get}
	*
	* @example
	* ```ts
	* app.use('*', async (c, next) => {
	*   c.set('message', 'Hono is hot!!')
	*   await next()
	* })
	* ```
	*/
	set = (key, value) => {
		this.#var ??= /* @__PURE__ */ new Map();
		this.#var.set(key, value);
	};
	/**
	* `.get()` can use the value specified by the key.
	*
	* @see {@link https://hono.dev/docs/api/context#set-get}
	*
	* @example
	* ```ts
	* app.get('/', (c) => {
	*   const message = c.get('message')
	*   return c.text(`The message is "${message}"`)
	* })
	* ```
	*/
	get = (key) => {
		return this.#var ? this.#var.get(key) : void 0;
	};
	/**
	* `.var` can access the value of a variable.
	*
	* @see {@link https://hono.dev/docs/api/context#var}
	*
	* @example
	* ```ts
	* const result = c.var.client.oneMethod()
	* ```
	*/
	get var() {
		if (!this.#var) return {};
		return Object.fromEntries(this.#var);
	}
	#newResponse(data, arg, headers) {
		let responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders;
		if (typeof arg === "object" && arg.headers) {
			responseHeaders ??= new Headers();
			for (const [key, value] of new Headers(arg.headers)) if (key === "set-cookie") responseHeaders.append(key, value);
			else responseHeaders.set(key, value);
		}
		if (headers) {
			if (!responseHeaders) {
				let count = 0;
				for (const k in headers) if (++count > 1 || typeof headers[k] !== "string") {
					responseHeaders = new Headers();
					break;
				}
			}
			if (responseHeaders) for (const k in headers) {
				const v = headers[k];
				if (typeof v === "string") responseHeaders.set(k, v);
				else {
					responseHeaders.delete(k);
					for (const v2 of v) responseHeaders.append(k, v2);
				}
			}
		}
		return createResponseInstance(data, {
			status: typeof arg === "number" ? arg : arg?.status ?? this.#status,
			headers: responseHeaders ?? headers
		});
	}
	newResponse = (...args) => this.#newResponse(...args);
	/**
	* `.body()` can return the HTTP response.
	* You can set headers with `.header()` and set HTTP status code with `.status`.
	* This can also be set in `.text()`, `.json()` and so on.
	*
	* @see {@link https://hono.dev/docs/api/context#body}
	*
	* @example
	* ```ts
	* app.get('/welcome', (c) => {
	*   // Set headers
	*   c.header('X-Message', 'Hello!')
	*   c.header('Content-Type', 'text/plain')
	*   // Set HTTP status code
	*   c.status(201)
	*
	*   // Return the response body
	*   return c.body('Thank you for coming')
	* })
	* ```
	*/
	body = (data, arg, headers) => this.#newResponse(data, arg, headers);
	/**
	* `.text()` can render text as `Content-Type:text/plain`.
	*
	* @see {@link https://hono.dev/docs/api/context#text}
	*
	* @example
	* ```ts
	* app.get('/say', (c) => {
	*   return c.text('Hello!')
	* })
	* ```
	*/
	text = (text, arg, headers) => {
		return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(text, arg, setDefaultContentType(TEXT_PLAIN, headers));
	};
	/**
	* `.json()` can render JSON as `Content-Type:application/json`.
	*
	* @see {@link https://hono.dev/docs/api/context#json}
	*
	* @example
	* ```ts
	* app.get('/api', (c) => {
	*   return c.json({ message: 'Hello!' })
	* })
	* ```
	*/
	json = (object, arg, headers) => {
		return this.#newResponse(JSON.stringify(object), arg, setDefaultContentType("application/json", headers));
	};
	html = (html, arg, headers) => {
		const res = (html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers));
		return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
	};
	/**
	* `.redirect()` can Redirect, default status code is 302.
	*
	* @see {@link https://hono.dev/docs/api/context#redirect}
	*
	* @example
	* ```ts
	* app.get('/redirect', (c) => {
	*   return c.redirect('/')
	* })
	* app.get('/redirect-permanently', (c) => {
	*   return c.redirect('/', 301)
	* })
	* ```
	*/
	redirect = (location, status) => {
		const locationString = String(location);
		this.header("Location", !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString));
		return this.newResponse(null, status ?? 302);
	};
	/**
	* `.notFound()` can return the Not Found Response.
	*
	* @see {@link https://hono.dev/docs/api/context#notfound}
	*
	* @example
	* ```ts
	* app.get('/notfound', (c) => {
	*   return c.notFound()
	* })
	* ```
	*/
	notFound = () => {
		this.#notFoundHandler ??= () => createResponseInstance();
		return this.#notFoundHandler(this);
	};
};
//#endregion
//#region node_modules/hono/dist/router.js
var METHODS = [
	"get",
	"post",
	"put",
	"delete",
	"options",
	"patch",
	"query"
];
var UnsupportedPathError = class extends Error {};
//#endregion
//#region node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";
//#endregion
//#region node_modules/hono/dist/hono-base.js
var notFoundHandler = (c) => {
	return c.text("404 Not Found", 404);
};
var errorHandler = (err, c) => {
	if ("getResponse" in err) {
		const res = err.getResponse();
		return c.newResponse(res.body, res);
	}
	console.error(err);
	return c.text("Internal Server Error", 500);
};
var Hono$1 = class _Hono {
	get;
	post;
	put;
	delete;
	options;
	patch;
	query;
	all;
	on;
	use;
	router;
	getPath;
	_basePath = "/";
	#path = "/";
	routes = [];
	constructor(options = {}) {
		[...METHODS, "all"].forEach((method) => {
			this[method] = (args1, ...args) => {
				const methodName = method.toUpperCase();
				if (typeof args1 === "string") this.#path = args1;
				else this.#addRoute(methodName, this.#path, args1);
				args.forEach((handler) => {
					this.#addRoute(methodName, this.#path, handler);
				});
				return this;
			};
		});
		this.on = (method, path, ...handlers) => {
			for (const p of [path].flat()) {
				this.#path = p;
				for (const m of [method].flat()) {
					const methodName = m.toUpperCase();
					for (const handler of handlers) this.#addRoute(methodName, this.#path, handler);
				}
			}
			return this;
		};
		this.use = (arg1, ...handlers) => {
			if (typeof arg1 === "string") this.#path = arg1;
			else {
				this.#path = "*";
				handlers.unshift(arg1);
			}
			handlers.forEach((handler) => {
				this.#addRoute("ALL", this.#path, handler);
			});
			return this;
		};
		const { strict, ...optionsWithoutStrict } = options;
		Object.assign(this, optionsWithoutStrict);
		this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
	}
	#clone() {
		const clone = new _Hono({
			router: this.router,
			getPath: this.getPath
		});
		clone.errorHandler = this.errorHandler;
		clone.#notFoundHandler = this.#notFoundHandler;
		clone.routes = this.routes;
		return clone;
	}
	#notFoundHandler = notFoundHandler;
	errorHandler = errorHandler;
	/**
	* `.route()` allows grouping other Hono instance in routes.
	*
	* @see {@link https://hono.dev/docs/api/routing#grouping}
	*
	* @param {string} path - base Path
	* @param {Hono} app - other Hono instance
	* @returns {Hono} routed Hono instance
	*
	* @example
	* ```ts
	* const app = new Hono()
	* const app2 = new Hono()
	*
	* app2.get("/user", (c) => c.text("user"))
	* app.route("/api", app2) // GET /api/user
	* ```
	*/
	route(path, app) {
		const subApp = this.basePath(path);
		app.routes.map((r) => {
			let handler;
			if (app.errorHandler === errorHandler) handler = r.handler;
			else {
				handler = async (c, next) => (await compose([], app.errorHandler)(c, () => r.handler(c, next))).res;
				handler[COMPOSED_HANDLER] = r.handler;
			}
			subApp.#addRoute(r.method, r.path, handler, r.basePath);
		});
		return this;
	}
	/**
	* `.basePath()` allows base paths to be specified.
	*
	* @see {@link https://hono.dev/docs/api/routing#base-path}
	*
	* @param {string} path - base Path
	* @returns {Hono} changed Hono instance
	*
	* @example
	* ```ts
	* const api = new Hono().basePath('/api')
	* ```
	*/
	basePath(path) {
		const subApp = this.#clone();
		subApp._basePath = mergePath(this._basePath, path);
		return subApp;
	}
	/**
	* `.onError()` handles an error and returns a customized Response.
	*
	* @see {@link https://hono.dev/docs/api/hono#error-handling}
	*
	* @param {ErrorHandler} handler - request Handler for error
	* @returns {Hono} changed Hono instance
	*
	* @example
	* ```ts
	* app.onError((err, c) => {
	*   console.error(`${err}`)
	*   return c.text('Custom Error Message', 500)
	* })
	* ```
	*/
	onError = (handler) => {
		this.errorHandler = handler;
		return this;
	};
	/**
	* `.notFound()` allows you to customize a Not Found Response.
	*
	* @see {@link https://hono.dev/docs/api/hono#not-found}
	*
	* @param {NotFoundHandler} handler - request handler for not-found
	* @returns {Hono} changed Hono instance
	*
	* @example
	* ```ts
	* app.notFound((c) => {
	*   return c.text('Custom 404 Message', 404)
	* })
	* ```
	*/
	notFound = (handler) => {
		this.#notFoundHandler = handler;
		return this;
	};
	/**
	* `.mount()` allows you to mount applications built with other frameworks into your Hono application.
	*
	* @see {@link https://hono.dev/docs/api/hono#mount}
	*
	* @param {string} path - base Path
	* @param {Function} applicationHandler - other Request Handler
	* @param {MountOptions} [options] - options of `.mount()`
	* @returns {Hono} mounted Hono instance
	*
	* @example
	* ```ts
	* import { Router as IttyRouter } from 'itty-router'
	* import { Hono } from 'hono'
	* // Create itty-router application
	* const ittyRouter = IttyRouter()
	* // GET /itty-router/hello
	* ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
	*
	* const app = new Hono()
	* app.mount('/itty-router', ittyRouter.handle)
	* ```
	*
	* @example
	* ```ts
	* const app = new Hono()
	* // Send the request to another application without modification.
	* app.mount('/app', anotherApp, {
	*   replaceRequest: (req) => req,
	* })
	* ```
	*/
	mount(path, applicationHandler, options) {
		let replaceRequest;
		let optionHandler;
		if (options) {
			if (typeof options === "function") optionHandler = options;
			else {
				optionHandler = options.optionHandler;
				if (options.replaceRequest === false) replaceRequest = (request) => request;
				else replaceRequest = options.replaceRequest;
			}
		}
		const getOptions = optionHandler ? (c) => {
			const options2 = optionHandler(c);
			return Array.isArray(options2) ? options2 : [options2];
		} : (c) => {
			let executionContext = void 0;
			try {
				executionContext = c.executionCtx;
			} catch {}
			return [c.env, executionContext];
		};
		replaceRequest ||= (() => {
			const mergedPath = mergePath(this._basePath, path);
			const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
			return (request) => {
				const url = new URL(request.url);
				url.pathname = this.getPath(request).slice(pathPrefixLength) || "/";
				return new Request(url, request);
			};
		})();
		const handler = async (c, next) => {
			const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
			if (res) return res;
			await next();
		};
		this.#addRoute("ALL", mergePath(path, "*"), handler);
		return this;
	}
	#addRoute(method, path, handler, baseRoutePath) {
		path = mergePath(this._basePath, path);
		const r = {
			basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
			path,
			method,
			handler
		};
		this.router.add(method, path, [handler, r]);
		this.routes.push(r);
	}
	#handleError(err, c) {
		if (err instanceof Error) return this.errorHandler(err, c);
		throw err;
	}
	#dispatch(request, executionCtx, env, method) {
		if (method === "HEAD") return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
		const path = this.getPath(request, { env });
		const matchResult = this.router.match(method, path);
		const c = new Context(request, {
			path,
			matchResult,
			env,
			executionCtx,
			notFoundHandler: this.#notFoundHandler
		});
		if (matchResult[0].length === 1) {
			let res;
			try {
				res = matchResult[0][0][0][0](c, async () => {
					c.res = await this.#notFoundHandler(c);
				});
			} catch (err) {
				return this.#handleError(err, c);
			}
			return res instanceof Promise ? res.then((resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
		}
		const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
		return (async () => {
			try {
				const context = await composed(c);
				if (!context.finalized) throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");
				return context.res;
			} catch (err) {
				return this.#handleError(err, c);
			}
		})();
	}
	/**
	* `.fetch()` will be entry point of your app.
	*
	* @see {@link https://hono.dev/docs/api/hono#fetch}
	*
	* @param {Request} request - request Object of request
	* @param {Env} env - env Object
	* @param {ExecutionContext} executionCtx - context of execution
	* @returns {Response | Promise<Response>} response of request
	*
	*/
	fetch = (request, ...rest) => {
		return this.#dispatch(request, rest[1], rest[0], request.method);
	};
	/**
	* `.request()` is a useful method for testing.
	* You can pass a URL or pathname to send a GET request.
	* app will return a Response object.
	* ```ts
	* test('GET /hello is ok', async () => {
	*   const res = await app.request('/hello')
	*   expect(res.status).toBe(200)
	* })
	* ```
	* @see https://hono.dev/docs/api/hono#request
	*/
	request = (input, requestInit, Env, executionCtx) => {
		if (input instanceof Request) return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
		input = input.toString();
		return this.fetch(new Request(/^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`, requestInit), Env, executionCtx);
	};
	/**
	* `.fire()` automatically adds a global fetch event listener.
	* This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
	* @deprecated
	* Use `fire` from `hono/service-worker` instead.
	* ```ts
	* import { Hono } from 'hono'
	* import { fire } from 'hono/service-worker'
	*
	* const app = new Hono()
	* // ...
	* fire(app)
	* ```
	* @see https://hono.dev/docs/api/hono#fire
	* @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
	* @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
	*/
	fire = () => {
		addEventListener("fetch", (event) => {
			event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
		});
	};
};
//#endregion
//#region node_modules/hono/dist/router/pattern-router/router.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var PatternRouter = class {
	name = "PatternRouter";
	#routes = [];
	add(method, path, handler) {
		const suffix = path.endsWith("/*") ? "(?:$|/)" : path.endsWith("*") ? "" : "/?$";
		path = path.replace(/\*$/, "");
		if (path.at(-1) === "?") {
			path = path.slice(0, -1);
			this.add(method, path.replace(/\/[^/]+$/, ""), handler);
		}
		const parts = (path.match(/\/?(:\w+(?:{(?:(?:{[\d,]+})|[^}])+})?)|\/?[^\/\?]+/g) || []).map((part) => {
			const match = part.match(/^\/:([^{]+)(?:{(.*)})?/);
			return match ? `/(?<${match[1]}>${match[2] || "[^/]+"})` : part === "/*" ? "/[^/]+" : part.replace(/[.\\+*[^\]$()]/g, "\\$&");
		});
		try {
			this.#routes.push([
				new RegExp(`^${parts.join("")}${suffix}`),
				method,
				handler
			]);
		} catch {
			throw new UnsupportedPathError();
		}
	}
	match(method, path) {
		const handlers = [];
		for (let i = 0, len = this.#routes.length; i < len; i++) {
			const [pattern, routeMethod, handler] = this.#routes[i];
			if (routeMethod === method || routeMethod === "ALL") {
				const match = pattern.exec(path);
				if (match) handlers.push([handler, match.groups || emptyParams]);
			}
		}
		return [handlers];
	}
};
//#endregion
//#region node_modules/hono/dist/preset/tiny.js
var Hono = class extends Hono$1 {
	constructor(options = {}) {
		super(options);
		this.router = new PatternRouter();
	}
};
//#endregion
//#region node_modules/@vitejs/plugin-rsc/dist/client-reference-CCekXxax.js
function createOnClientReference(onClientReference) {
	return (metadata) => {
		const deps = assetsManifest.clientReferenceDeps[metadata.id] ?? {
			js: [],
			css: []
		};
		onClientReference({
			...metadata,
			deps
		});
	};
}
//#endregion
//#region \0virtual:vite-rsc/server-references
var server_references_default = {};
//#endregion
//#region node_modules/@vitejs/plugin-rsc/dist/shared-D42sHPD1.js
setRequireModule({ load: async (id) => {
	{
		const import_ = server_references_default[id];
		if (!import_) throw new Error(`server reference not found '${id}'`);
		return import_();
	}
} });
//#endregion
//#region node_modules/@vitejs/plugin-rsc/dist/rsc/server.js
function renderToReadableStream(data, options, extraOptions) {
	return renderToReadableStream$1(data, options, { onClientReference: extraOptions?.onClientReference ? createOnClientReference(extraOptions.onClientReference) : void 0 });
}
//#endregion
//#region \0virtual:vite-rsc-waku/config
var config = {
	"basePath": "/",
	"srcDir": "src",
	"distDir": "dist",
	"privateDir": "private",
	"rscBase": "RSC",
	"unstable_adapter": "waku/adapters/node"
};
//#endregion
//#region node_modules/waku/dist/lib/constants.js
var constants_exports = /* @__PURE__ */ __exportAll({
	BUILD_METADATA_FILE: () => BUILD_METADATA_FILE,
	DEV_BUILD_ID: () => "dev",
	DIST_PUBLIC: () => DIST_PUBLIC$1,
	DIST_SERVER: () => DIST_SERVER,
	EXTENSIONS: () => EXTENSIONS,
	SRC_CLIENT_ENTRY: () => SRC_CLIENT_ENTRY,
	SRC_MIDDLEWARE: () => SRC_MIDDLEWARE,
	SRC_PAGES: () => SRC_PAGES,
	SRC_SERVER_ENTRY: () => SRC_SERVER_ENTRY
});
var EXTENSIONS = [
	".js",
	".ts",
	".tsx",
	".jsx",
	".mjs",
	".cjs"
];
var SRC_CLIENT_ENTRY = "waku.client";
var SRC_SERVER_ENTRY = "waku.server";
var SRC_PAGES = "pages";
var SRC_MIDDLEWARE = "middleware";
var DIST_PUBLIC$1 = "public";
var DIST_SERVER = "server";
var BUILD_METADATA_FILE = "__waku_build_metadata.js";
//#endregion
//#region node_modules/waku/dist/lib/env.js
function unstable_setAllEnv(newEnv) {
	const env = {};
	for (const [key, value] of Object.entries(newEnv)) if (typeof value === "string") env[key] = value;
	globalThis.__WAKU_SERVER_ENV__ = env;
}
//#endregion
//#region node_modules/waku/dist/lib/utils/log.js
var sanitizeLog = (value) => {
	return (value instanceof Error ? value.stack ?? value.message : String(value)).replace(/\p{Cc}/gu, (char) => char === "\n" ? "\\n" : `\\x${char.charCodeAt(0).toString(16).padStart(2, "0")}`);
};
//#endregion
//#region node_modules/waku/dist/lib/utils/path.js
var joinPath = (...paths) => {
	const isAbsolute = paths[0]?.startsWith("/");
	const items = [].concat(...paths.map((path) => path.split("/")));
	const stack = [];
	for (const item of items) if (item === "..") {
		if (stack.length && stack[stack.length - 1] !== "..") stack.pop();
		else if (!isAbsolute) stack.push("..");
	} else if (item && item !== ".") stack.push(item);
	return (isAbsolute ? "/" : "") + stack.join("/") || ".";
};
function removeBase(url, base) {
	if (base !== "/") {
		if (!url.startsWith(base)) throw new Error("pathname must start with basePath: " + url);
		return url.slice(base.length - 1);
	}
	return url;
}
function addBase(url, base) {
	if (base !== "/" && url.startsWith("/")) return base.slice(0, -1) + url;
	return url;
}
//#endregion
//#region node_modules/waku/dist/lib/utils/redirect.js
var hasControlCharacter = (value) => [...value].some((char) => char < " " || char === "");
var getLocationType = (location) => {
	if (/^[a-z][a-z\d+.-]*:/i.test(location)) return "absolute";
	if (location.startsWith("//")) return "authority";
	return location.startsWith("/") ? "appPath" : "relative";
};
var resolveRedirectLocation = (location, requestUrl, basePath) => {
	location = location.trim();
	const locationType = getLocationType(location);
	if (locationType === "relative") return hasControlCharacter(location) ? void 0 : location;
	const request = new URL(requestUrl);
	let target;
	try {
		target = new URL(location, request);
	} catch {
		return;
	}
	if (target.protocol !== "http:" && target.protocol !== "https:") return;
	target.username = "";
	target.password = "";
	const path = target.pathname + target.search + target.hash;
	if (target.host !== request.host) return locationType === "absolute" ? target.href : "//" + target.host + path;
	if (locationType === "absolute" && target.protocol === "https:") return target.href;
	return locationType === "appPath" ? addBase(path, basePath) : path;
};
//#endregion
//#region node_modules/waku/dist/lib/utils/render.js
var validateRscElementIds = (elements) => {
	for (const id of Object.keys(elements)) if (id.startsWith("_")) throw new Error(`RSC element IDs starting with "_" are reserved for Waku internals: ${id}`);
};
function createRenderUtils(temporaryReferences, renderToReadableStream, loadSsrEntryModule, buildId, debugChannel, debugId) {
	const onError = (e) => {
		if (e && typeof e === "object" && "digest" in e && typeof e.digest === "string") return e.digest;
		console.error("Error during rendering:", sanitizeLog(e));
	};
	return {
		async renderRsc(elements, options) {
			validateRscElementIds(elements);
			const data = buildId ? {
				...elements,
				_buildId: buildId
			} : { ...elements };
			if (options && "value" in options) data._value = options.value;
			if (options?.documentLocation) data._location = options.documentLocation;
			if (options?.etags) for (const [slotId, etag] of Object.entries(options.etags)) data[ETAG_ID_PREFIX + slotId] = etag;
			return renderToReadableStream(data, {
				temporaryReferences,
				onError,
				debugChannel
			}, { onClientReference(metadata) {
				options?.unstable_clientModuleCallback?.(metadata.deps.js);
			} });
		},
		async renderHtml(elementsStream, html, options) {
			const { INTERNAL_renderHtmlStream: renderHtmlStream } = await loadSsrEntryModule();
			const htmlResult = await renderHtmlStream(elementsStream, renderToReadableStream(html, { onError }), {
				rscPath: options.rscPath,
				formState: options.formState,
				nonce: options.nonce,
				extraScriptContent: options.unstable_extraScriptContent,
				debugId
			});
			return new Response(htmlResult.stream, {
				status: htmlResult.status || options.status || 200,
				headers: { "content-type": "text/html; charset=utf-8" }
			});
		}
	};
}
//#endregion
//#region node_modules/waku/dist/lib/utils/rsc-path.js
var encodeRscPath = (rscPath) => {
	if (rscPath === "") rscPath = "_";
	else {
		if (rscPath.startsWith("_") || rscPath.startsWith("/")) rscPath = "_" + rscPath;
		if (rscPath.endsWith("_") || rscPath.endsWith("/")) rscPath += "_";
	}
	return rscPath + ".txt";
};
var decodeRscPath = (rscPath) => {
	if (!rscPath.endsWith(".txt")) throw new Error("Invalid encoded rscPath");
	rscPath = rscPath.slice(0, -4);
	if (rscPath.startsWith("_")) rscPath = rscPath.slice(1);
	if (rscPath.endsWith("_")) rscPath = rscPath.slice(0, -1);
	return rscPath;
};
var FUNC_PREFIX = "F/";
var decodeFuncId = (encoded) => {
	if (!encoded.startsWith(FUNC_PREFIX)) return null;
	const index = encoded.lastIndexOf("/");
	const file = encoded.slice(2, index);
	const name = encoded.slice(index + 1);
	if (file.startsWith("_")) return file.slice(1) + "#" + name;
	return file + "#" + name;
};
//#endregion
//#region node_modules/waku/dist/lib/utils/request.js
async function getInput(req, config, temporaryReferences, decodeReply, decodeAction, decodeFormState, loadServerAction) {
	const url = new URL(req.url);
	const pathname = removeBase(url.pathname, config.basePath);
	const rscPathPrefix = "/" + config.rscBase + "/";
	const etags = parseClientEtags(req.headers.get(ETAGS_HEADER));
	let rscPath;
	let input;
	if (pathname.startsWith(rscPathPrefix)) {
		rscPath = decodeRscPath(pathname.slice(rscPathPrefix.length));
		const actionId = decodeFuncId(rscPath);
		if (actionId) {
			validateServerActionRequest(req);
			const args = await decodeReply(await getActionBody(req), { temporaryReferences });
			input = {
				type: "call",
				fn: await loadServerAction(actionId),
				args,
				pathname,
				req,
				etags
			};
		} else {
			let rscParams = url.searchParams;
			if (req.body) {
				validateServerActionRequest(req);
				rscParams = await decodeReply(await getActionBody(req), { temporaryReferences });
			}
			input = {
				type: "rsc",
				rscPath,
				rscParams,
				pathname,
				req,
				etags
			};
		}
	} else if (req.method === "POST") {
		const contentType = req.headers.get("content-type");
		if (typeof contentType === "string" && contentType.startsWith("multipart/form-data")) {
			let parsing;
			input = {
				type: "http",
				tryAction: () => parsing ??= (async () => {
					const formData = await getActionBody(req);
					const decodedAction = await decodeAction(formData);
					if (typeof decodedAction !== "function") return {
						action: false,
						formData
					};
					validateServerActionRequest(req);
					return {
						action: true,
						formState: await decodeFormState(await decodedAction(), formData)
					};
				})(),
				pathname,
				req,
				etags
			};
		} else input = {
			type: "http",
			pathname,
			req,
			etags
		};
	} else input = {
		type: "http",
		pathname,
		req,
		etags
	};
	return input;
}
function validateServerActionRequest(req) {
	if (req.method !== "POST") throw createCustomError("Method Not Allowed", { status: 405 });
	const origin = req.headers.get("origin");
	if (origin) {
		if (origin === "null") throw createCustomError("Forbidden", { status: 403 });
		const requestUrl = new URL(req.url);
		let originUrl;
		try {
			originUrl = new URL(origin);
		} catch {
			throw createCustomError("Forbidden", { status: 403 });
		}
		if (originUrl.origin !== requestUrl.origin && !(requestUrl.protocol === "http:" && originUrl.protocol === "https:" && originUrl.host === requestUrl.host)) throw createCustomError("Forbidden", { status: 403 });
	} else if (req.headers.get("sec-fetch-site") === "cross-site") throw createCustomError("Forbidden", { status: 403 });
}
async function getActionBody(req) {
	if (!req.body) throw new Error("missing request body for server function");
	if (req.headers.get("content-type")?.startsWith("multipart/form-data")) return req.formData();
	else return req.text();
}
//#endregion
//#region node_modules/waku/dist/lib/vite-rsc/handler.js
function loadSsrEntryModule() {
	return import("../ssr/index.js");
}
var toProcessRequest = (handleRequest) => async (req) => {
	const temporaryReferences = createTemporaryReferenceSet();
	const input = await getInput(req, config, temporaryReferences, decodeReply, decodeAction, decodeFormState, loadServerAction);
	const debugId = void 0;
	globalThis.__WAKU_DEBUG_CHANNELS__;
	const renderUtils = createRenderUtils(temporaryReferences, renderToReadableStream, loadSsrEntryModule, "b_FDD6bn", void 0, debugId);
	let res;
	try {
		res = await handleRequest(input, {
			...renderUtils,
			loadBuildMetadata: async (key) => buildMetadata.get(key)
		});
	} catch (e) {
		const info = getErrorInfo(e);
		const documentLocation = info?.location ? resolveRedirectLocation(info.location, req.url, config.basePath) : void 0;
		if (documentLocation && input.type !== "http") return new Response(await renderUtils.renderRsc({}, { documentLocation }), { headers: { "cache-control": "private, no-store" } });
		const isRefusedLocation = !!info?.location && !documentLocation;
		const redirectStatus = input.type === "http" && req.method === "POST" ? 303 : info?.status || 307;
		const status = isRefusedLocation ? 500 : documentLocation ? redirectStatus : info?.status || 500;
		let message;
		if (info) message = e?.message || String(e);
		else {
			console.warn(sanitizeLog(e));
			message = "Internal Server Error";
		}
		const body = stringToStream(message);
		return new Response(body, {
			status,
			headers: documentLocation ? {
				location: documentLocation,
				"cache-control": "private, no-store"
			} : {}
		});
	}
	if (res instanceof ReadableStream) return new Response(res);
	else if (res && res !== "fallback") return res;
	const url = new URL(req.url);
	if (res === "fallback" || !res && url.pathname === "/") {
		const { INTERNAL_renderHtmlFallback } = await loadSsrEntryModule();
		const htmlFallbackStream = await INTERNAL_renderHtmlFallback();
		return new Response(htmlFallbackStream, { headers: { "content-type": "text/html; charset=utf-8" } });
	}
	return null;
};
var toProcessBuild = (handleBuild) => async ({ emitFile, unstable_registerPrunableFile }) => {
	const renderUtils = createRenderUtils(void 0, renderToReadableStream, loadSsrEntryModule, "b_FDD6bn");
	let fallbackHtml;
	const getFallbackHtml = async () => {
		if (!fallbackHtml) fallbackHtml = await (await loadSsrEntryModule()).INTERNAL_renderHtmlFallback();
		return fallbackHtml;
	};
	const getPublicFilePath = (fileName) => {
		const filePath = joinPath(DIST_PUBLIC$1, fileName);
		if (!filePath.startsWith("public/")) throw new Error("fileName escapes the public directory: " + fileName);
		return filePath;
	};
	await handleBuild({
		renderRsc: renderUtils.renderRsc,
		renderHtml: renderUtils.renderHtml,
		rscPath2pathname: (rscPath) => joinPath(config.rscBase, encodeRscPath(rscPath)),
		saveBuildMetadata: async (key, value) => {
			buildMetadata.set(key, value);
		},
		generateFile: async (fileName, body) => {
			await emitFile(getPublicFilePath(fileName), typeof body === "string" ? stringToStream(body) : body);
		},
		generateDefaultHtml: async (fileName) => {
			await emitFile(getPublicFilePath(fileName), stringToStream(await getFallbackHtml()));
		},
		unstable_registerPrunableFile
	});
	await emitFile(joinPath(DIST_SERVER, BUILD_METADATA_FILE), stringToStream(`export const buildMetadata = new Map(${JSON.stringify(Array.from(buildMetadata))});`));
};
var createServerEntryAdapter = (fn) => (handlers, options) => {
	return fn({
		handlers,
		processRequest: toProcessRequest(handlers.handleRequest),
		processBuild: toProcessBuild(handlers.handleBuild),
		unstable_setAllEnv,
		config,
		isBuild: true,
		notFoundHtml: void 0
	}, options);
};
//#endregion
//#region node_modules/waku/dist/lib/hono/middleware.js
var middleware_exports = /* @__PURE__ */ __exportAll({
	middlewareRunner: () => middlewareRunner$1,
	rscMiddleware: () => rscMiddleware$1
});
function rscMiddleware$1({ processRequest }) {
	return async (c, next) => {
		const req = c.req.raw;
		const res = await processRequest(req);
		if (res) {
			c.res = res;
			return;
		}
		await next();
	};
}
function middlewareRunner$1(middlewareModules, opts) {
	let handlersPromise;
	return async (c, next) => {
		if (!handlersPromise) handlersPromise = Promise.all(Object.values(middlewareModules).map((m) => m().then((mod) => mod.default(opts))));
		const handlers = await handlersPromise;
		let response;
		const run = async (index) => {
			const handler = handlers[index];
			if (handler) {
				const result = await handler(c, () => run(index + 1));
				if (result && !response) response = result;
			} else await next();
		};
		await run(0);
		return response;
	};
}
//#endregion
//#region node_modules/waku/dist/adapters/node.js
var { DIST_PUBLIC } = constants_exports;
var { rscMiddleware, middlewareRunner } = middleware_exports;
var DEFAULT_BODY_LIMIT_MAX_SIZE = 104857600;
var node_default = createServerEntryAdapter(({ processRequest, processBuild, config, isBuild, notFoundHtml }, options) => {
	const { bodyLimit: bodyLimitOptions, middlewareFns = [], middlewareModules = {} } = options || {};
	const app = new Hono();
	app.notFound((c) => {
		if (notFoundHtml) return c.html(notFoundHtml, 404);
		return c.text("404 Not Found", 404);
	});
	if (isBuild) app.use(`${config.basePath}*`, serveStatic({
		root: path.join(config.distDir, DIST_PUBLIC),
		rewriteRequestPath: (path) => path.slice(config.basePath.length - 1)
	}));
	if (bodyLimitOptions !== false) app.use(bodyLimit(bodyLimitOptions ?? { maxSize: DEFAULT_BODY_LIMIT_MAX_SIZE }));
	for (const middlewareFn of middlewareFns) app.use(middlewareFn({ app }));
	app.use(middlewareRunner(middlewareModules, { app }));
	app.use(rscMiddleware({ processRequest }));
	const buildOptions = { distDir: config.distDir };
	return {
		fetch: app.fetch,
		build: processBuild,
		buildOptions,
		buildEnhancers: ["waku/adapters/node-build-enhancer"],
		serve
	};
});
//#endregion
//#region node_modules/waku/dist/main.react-server.js
var import_react_react_server = require_react_react_server();
//#endregion
//#region node_modules/fumapress/dist/router/index.js
async function createRouter(userConfig) {
	const context = await initApp(userConfig);
	function createPages$2(base, createPagesOptions) {
		const result = createPages(async (_fns) => {
			const { renderRoot, renderPage, renderNotFound } = context;
			let fns = {
				..._fns,
				unstable_getCreated() {
					return result;
				},
				createApiIsomorphic(config) {
					if (config.render === "static") _fns.createApi({
						render: "static",
						method: "GET",
						staticPaths: config.staticPaths,
						path: config.path,
						handler: config.handler,
						unstable_sourceFile: config.unstable_sourceFile
					});
					else _fns.createApi({
						render: "dynamic",
						path: config.path,
						handlers: { GET: config.handler },
						unstable_sourceFile: config.unstable_sourceFile
					});
				}
			};
			async function resolvePage(slugs, lang) {
				const page = (await context.getLoader()).getPage(slugs, lang);
				if (!page) unstable_notFound();
				return page;
			}
			for (const plugin of context.plugins) {
				const out = await plugin.prepareCreatePages?.call(context, fns);
				if (out) fns = out;
			}
			fns.createInterceptor((next) => appContext.run(context, next));
			await base?.call(context, fns);
			for (const plugin of context.plugins) await plugin.createPages?.call(context, fns);
			const staticPaths = [];
			const defaultRenderMode = context.mode === "default" ? "static" : context.mode;
			for (const page of (await context.getLoader()).getPages()) staticPaths.push(page.locale ? [page.locale, ...page.slugs] : page.slugs);
			if (context.i18nConfig) {
				fns.createRoot({
					render: defaultRenderMode,
					component: import_react_react_server.Fragment
				});
				fns.createLayout({
					render: defaultRenderMode,
					path: "/[lang]",
					component: renderRoot
				});
				fns.createPage({
					render: defaultRenderMode,
					path: "/[lang]/[...slugs]",
					staticPaths,
					async component({ slugs, lang }) {
						const page = await resolvePage(slugs, lang);
						let fallback = renderPage({
							lang,
							slugs,
							page
						});
						for (const plugin of context.plugins) {
							const res = await plugin.renderPage?.call(context, {
								fallback,
								page,
								slugs,
								lang
							});
							if (res !== void 0) fallback = res;
						}
						return fallback;
					}
				});
				fns.createPage({
					render: defaultRenderMode,
					path: "/[lang]/404",
					staticPaths: context.i18nConfig.languages,
					component: renderNotFound
				});
				if (context.mode !== "static") fns.createPage({
					render: "dynamic",
					path: "/404",
					component: () => unstable_redirect(`/${context.i18nConfig.defaultLanguage}`)
				});
			} else {
				fns.createRoot({
					render: defaultRenderMode,
					component: renderRoot
				});
				fns.createPage({
					render: defaultRenderMode,
					path: "/[...slugs]",
					staticPaths,
					async component({ slugs }) {
						const page = await resolvePage(slugs);
						let fallback = renderPage({
							slugs,
							page
						});
						for (const plugin of context.plugins) {
							const res = await plugin.renderPage?.call(context, {
								fallback,
								page,
								slugs
							});
							if (res !== void 0) fallback = res;
						}
						return fallback;
					}
				});
				fns.createPage({
					render: defaultRenderMode,
					staticPaths: [],
					path: "/404",
					component: renderNotFound
				});
			}
			return null;
		}, createPagesOptions);
		return result;
	}
	function pluginsMiddleware(opts) {
		async function init() {
			const out = [];
			const resolved = await Promise.all(context.plugins.map((plugin) => plugin.createMiddlewares?.call(context, opts)));
			for (const v of resolved) if (v) out.push(...v);
			return out;
		}
		const middlewaresPromise = init();
		return async (c, next) => {
			const middlewares = await middlewaresPromise;
			if (middlewares.length === 0) return next();
			let response;
			const run = async (index) => {
				const handler = middlewares[index];
				if (handler) {
					const result = await handler(c, () => run(index + 1));
					if (result && !response) response = result;
				} else await next();
			};
			await run(0);
			return response;
		};
	}
	function patchAdapter(adapter) {
		return (handlers, options) => {
			let entry = adapter(handlers, options);
			for (const plugin of context.plugins) if (plugin.unstable_onServerEntry) entry = plugin.unstable_onServerEntry(entry);
			return entry;
		};
	}
	return {
		createPages: createPages$2,
		patchAdapter,
		createMiddlewares() {
			return [pluginsMiddleware];
		}
	};
}
//#endregion
//#region node_modules/fumapress/dist/router/fs.js
var Methods = [
	"GET",
	"POST",
	"HEAD",
	"PUT",
	"DELETE",
	"PATCH",
	"OPTIONS"
];
var ValidMethods = new Set(Methods);
var IGNORED_PATH_PARTS = /* @__PURE__ */ new Set(["_components", "_hooks"]);
var SPECIAL_BASENAME = /* @__PURE__ */ new Set([
	"_layout",
	"index",
	"_root"
]);
/** Ignore paths like `_components` and `_hooks` in pages dir */
var isIgnoredPath = (paths) => paths.some((p) => IGNORED_PATH_PARTS.has(p));
function fsRouterFn(modules, options = {}) {
	return async function(fns) {
		const { createPage, createLayout, createRoot, createApi, createSlice } = fns;
		const { pagesDir = "pages", apiDir = "_api", slicesDir = "_slices" } = options;
		const pagesDirPrefix = pagesDir + "/";
		for (const file in modules) {
			const srcPath = new URL(file, "http://localhost:3000").pathname.slice(1);
			if (!srcPath.startsWith(pagesDirPrefix)) continue;
			const pathItems = srcPath.slice(pagesDirPrefix.length).replace(/\.\w+$/, "").split("/").filter(Boolean);
			if (isIgnoredPath(pathItems)) continue;
			const path = "/" + (SPECIAL_BASENAME.has(pathItems.at(-1)) ? pathItems.slice(0, -1) : pathItems).join("/");
			const mod = await modules[file]();
			const config = await mod.getConfig?.call(this);
			if (pathItems.at(-1) === "[path]") throw new Error("Page file cannot be named [path]. This will conflict with the path prop of the page component.");
			if (pathItems[0] === apiDir) {
				const apiPath = "/" + pathItems.slice(1).join("/");
				const renderMode = config?.render ?? (this.mode === "default" ? "dynamic" : this.mode);
				if (renderMode === "static") {
					if (Object.keys(mod).length !== 2 || !mod.GET) console.warn(`API ${path} is invalid. For static API routes, only a single GET handler is supported.`);
					createApi({
						path: apiPath,
						render: renderMode,
						method: "GET",
						handler: mod.GET.bind(this),
						unstable_sourceFile: srcPath
					});
				} else {
					const entries = [];
					for (const [exportName, handler] of Object.entries(mod)) {
						if (!(exportName === "getConfig" || exportName === "default" || ValidMethods.has(exportName))) {
							console.warn(`API ${path} has an invalid export: ${exportName}. Valid exports are: ${Methods.join(", ")}`);
							continue;
						}
						if (exportName === "default") entries.push(["all", handler.bind(this)]);
						else entries.push([exportName, handler.bind(this)]);
					}
					createApi({
						path: apiPath,
						render: renderMode,
						handlers: Object.fromEntries(entries),
						unstable_sourceFile: srcPath
					});
				}
				continue;
			}
			const component = mod.default;
			const renderMode = config?.render ?? (this.mode === "default" ? "static" : this.mode);
			if (pathItems[0] === slicesDir) {
				createSlice({
					component,
					render: renderMode,
					id: pathItems.slice(1).join("/"),
					unstable_sourceFile: srcPath
				});
				continue;
			}
			if (pathItems.at(-1) === "_root") {
				createRoot({
					component,
					render: renderMode,
					unstable_sourceFile: srcPath
				});
				continue;
			}
			const i18n = config?.autoI18n ?? true ? this.i18nConfig : void 0;
			const routePath = i18n ? joinPathname("[lang]/(fs)", path) : joinPathname("(fs)", path);
			if (pathItems.at(-1) === "_layout") {
				createLayout({
					path: routePath,
					component,
					render: renderMode,
					unstable_sourceFile: srcPath
				});
				continue;
			}
			let staticPaths = config?.staticPaths;
			if (i18n && renderMode === "static") {
				const withLang = [];
				for (const lang of i18n.languages) if (!staticPaths) withLang.push([lang]);
				else for (const item of staticPaths) withLang.push([lang].concat(item));
				staticPaths = withLang;
			}
			createPage({
				path: routePath,
				component,
				render: renderMode,
				staticPaths,
				unstable_sourceFile: srcPath
			});
		}
	};
}
//#endregion
//#region \0virtual:vite-rsc-waku/server-entry-inner
var modules = /* #__PURE__ */ Object.assign({
	"./pages/_layout.tsx": () => import("./_layout-ZWuI_69w.js"),
	"./pages/about.tsx": () => import("./about-BUjFPwNk.js"),
	"./pages/index.tsx": () => import("./pages-IcOD_0MF.js")
});
var router = await createRouter(press_config_default);
var pages = router.createPages(fsRouterFn(modules));
var middlewareFns = router.createMiddlewares();
var server_entry_inner_default = router.patchAdapter(node_default)(pages, { middlewareFns });
//#endregion
export { joinPath as n, unstable_setAllEnv as r, server_entry_inner_default as t };
