//#region node_modules/@takumi-rs/helpers/dist/fonts-CBLz8Mte.mjs
var e = class {
	signal;
	constructor(e, t) {
		let n = e.timeout ?? 3e4, r = [
			e.signal,
			t,
			n <= 0 ? void 0 : AbortSignal.timeout(n)
		].filter((e) => e != null);
		this.signal = r.length ? AbortSignal.any(r) : void 0;
	}
	waitFor(e) {
		let t = this.signal;
		return t ? new Promise((n, r) => {
			function i() {
				t?.removeEventListener(`abort`, i), r(t?.reason);
			}
			t.addEventListener(`abort`, i, { once: !0 }), e.then((e) => {
				t.removeEventListener(`abort`, i), n(e);
			}, (e) => {
				t.removeEventListener(`abort`, i), r(e);
			}), t.aborted && i();
		}) : e;
	}
};
var t = /* @__PURE__ */ new Set([
	301,
	302,
	303,
	307,
	308
]);
var n = /* @__PURE__ */ new Set([
	408,
	429,
	500,
	502,
	503,
	504
]);
async function i(e, t = {}) {
	return new a(e, t).send();
}
var a = class r {
	url;
	allowUrl;
	fetchImpl;
	init;
	constructor(t, n) {
		if (n.allowUrl && !n.allowUrl(t)) throw Error(`URL blocked by allowUrl policy: ${t}`);
		this.url = t, this.allowUrl = n.allowUrl, this.fetchImpl = n.fetch ?? globalThis.fetch, this.init = {
			...n.init,
			signal: new e(n, n.init?.signal).signal
		};
	}
	async send() {
		let e = this.allowUrl ? await this.followRedirects(this.allowUrl) : await this.attempt(this.url, this.init);
		if (!e.ok) throw Error(`HTTP ${e.status} ${e.statusText} fetching ${this.url}`);
		return e;
	}
	async attempt(e, t) {
		let r = t.method?.toUpperCase() ?? `GET`, i = r === `GET` || r === `HEAD`;
		for (let r = 0;; r++) {
			t.signal?.throwIfAborted();
			let a = 100 * 2 ** r;
			try {
				let o = await this.fetchImpl.call(void 0, e, t);
				if (t.signal?.throwIfAborted(), !i || r === 2 || !n.has(o.status)) return o;
				let s = o.headers.get(`retry-after`);
				if (s !== null) {
					let e = Number(s), t = Number.isFinite(e) ? e * 1e3 : Date.parse(s) - Date.now();
					Number.isFinite(t) && (a = Math.max(a, t));
				}
				if (a > 1e3) return o;
				o.body?.cancel().catch(() => {});
			} catch (e) {
				if (t.signal?.throwIfAborted(), !i || r === 2 || !(e instanceof Error) || e.name !== `TypeError` && e.name !== `TimeoutError`) throw e;
			}
			await this.wait(a);
		}
	}
	wait(e) {
		let t = this.init.signal;
		return t?.throwIfAborted(), new Promise((n, r) => {
			let i = setTimeout(() => {
				t?.removeEventListener(`abort`, a), n();
			}, e);
			function a() {
				clearTimeout(i), r(t?.reason);
			}
			t?.addEventListener(`abort`, a, { once: !0 });
		});
	}
	async followRedirects(e) {
		let n = this.url, i = {
			...this.init,
			headers: new Headers(this.init.headers),
			redirect: `manual`
		};
		for (let a = 0; a < 5; a++) {
			let a = await this.attempt(n, i), o = a.headers.get(`location`);
			if (!t.has(a.status) || o === null) return a;
			await a.body?.cancel().catch(() => {});
			let s = new URL(o, n);
			if (!e(s.href)) throw Error(`URL blocked by allowUrl policy: ${s.href}`);
			if (s.protocol !== `https:` && s.protocol !== `http:` || s.username || s.password) throw Error(`Invalid redirect URL: ${s.href}`);
			i = r.redirectInit(i, a.status, n, s), n = s.href;
		}
		throw Error(`Too many redirects fetching ${this.url}`);
	}
	static redirectInit(e, t, n, r) {
		if (t !== 303 && e.body instanceof ReadableStream) throw Error(`Cannot replay a streamed request body after a redirect`);
		let i = new Headers(e.headers), a = e.method?.toUpperCase() ?? `GET`, o = (t === 301 || t === 302) && a === `POST` || t === 303 && a !== `GET` && a !== `HEAD`;
		if (o) for (let e of [
			`content-encoding`,
			`content-language`,
			`content-location`,
			`content-type`,
			`content-length`
		]) i.delete(e);
		if (new URL(n).origin !== r.origin) for (let e of [
			`authorization`,
			`proxy-authorization`,
			`cookie`,
			`cookie2`
		]) i.delete(e);
		return {
			...e,
			headers: i,
			method: o ? `GET` : e.method,
			body: o ? void 0 : e.body
		};
	}
};
async function o(e, t) {
	let n = Number(e.headers.get(`content-length`));
	if (Number.isFinite(n) && n > t) throw Error(`Response exceeds ${t} bytes (content-length ${n})`);
	let r = e.body;
	if (!r) return e.arrayBuffer();
	let i = r.getReader(), a = [], o = 0;
	for (;;) {
		let { done: e, value: n } = await i.read();
		if (e) break;
		if (o += n.byteLength, o > t) throw await i.cancel().catch(() => {}), Error(`Response exceeds ${t} bytes`);
		a.push(n);
	}
	let s = new Uint8Array(o), c = 0;
	for (let e of a) s.set(e, c), c += e.byteLength;
	return s.buffer;
}
function y(e) {
	let t = /* @__PURE__ */ new Set(), n = (e) => {
		for (let n of e) t.add(n.codePointAt(0));
	}, r = (e) => {
		typeof e == `string` ? n(e) : e.type === `text` ? n(e.text) : e.type === `container` && e.children?.forEach(r);
	};
	return Array.isArray(e) ? e.forEach(r) : r(e), t;
}
function b(e, t) {
	if (e.length === 0) return !0;
	for (let n of t) for (let [t, r] of e) if (n >= t && n <= r) return !0;
	return !1;
}
function x({ fonts: e, source: t }) {
	let n = y(t);
	return e.filter((e) => b(e.ranges ?? [], n));
}
function S(e, t = {}) {
	return {
		key: e,
		data: () => i(e, t).then((e) => o(e, t.maxBytes ?? 33554432))
	};
}
//#endregion
export { x as a, o as i, e as n, i as r, S as t };
