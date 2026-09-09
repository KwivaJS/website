import { a as x, t as S } from "./fonts-CBLz8Mte-tJo9sz-D.js";
//#region node_modules/@takumi-rs/helpers/dist/renderer.mjs
function n(e) {
	return e instanceof Uint8Array || e instanceof ArrayBuffer || typeof Buffer < `u` && Buffer.isBuffer(e);
}
function r(e) {
	return e instanceof ArrayBuffer ? new Uint8Array(e) : e;
}
function i(e) {
	return n(e) ? e : typeof e.data == `function` ? e.data() : e.data;
}
function a(e) {
	return n(e) ? e : `key` in e && e.key ? e.key : typeof e.data == `function` ? `${e.name ?? ``}:${e.weight ?? ``}:${e.style ?? ``}` : e.data;
}
async function o(e) {
	let { sources: t = [], cache: n } = Array.isArray(e) ? { sources: e } : e, i = /* @__PURE__ */ new Map();
	for (let e of t) i.set(e.src, e);
	return Promise.all([...i.values()].map(async ({ src: e, data: t, cache: i }) => ({
		src: e,
		data: r(typeof t == `function` ? await t() : t),
		cache: i ?? n
	})));
}
var s = class {
	registerInner;
	byKey = /* @__PURE__ */ new Map();
	byData = /* @__PURE__ */ new WeakMap();
	constructor(e) {
		this.registerInner = e;
	}
	getFont(e) {
		return typeof e == `string` ? this.byKey.get(e) : this.byData.get(e);
	}
	setFont(e, t) {
		typeof e == `string` ? this.byKey.set(e, t) : this.byData.set(e, t);
	}
	deleteFont(e) {
		typeof e == `string` ? this.byKey.delete(e) : this.byData.delete(e);
	}
	async register(e) {
		let o = typeof e == `string` ? S(e) : e, s = a(o), c = this.getFont(s);
		if (c) return c;
		let l = i(o), u = Promise.resolve(l).then((e) => {
			let t = r(e);
			return this.registerInner(n(o) ? t : {
				...o,
				data: t
			});
		}).catch((e) => {
			throw this.deleteFont(s), e;
		});
		return this.setFont(s, u), u;
	}
	async prepareFonts(e) {
		if (!e) return;
		let t = await Promise.all(e.map((e) => this.register(e)));
		return [...new Set(t.flat().map((e) => e.name))];
	}
	async resolveResources(e, t, n) {
		let r = await this.prepareFonts(e);
		return {
			images: t ? await o(t) : void 0,
			fontFamilies: n ?? r
		};
	}
};
async function c(t, n, r) {
	let { fonts: i, fontFamilies: a, signal: o, images: s, ...c } = n;
	o?.throwIfAborted();
	let l = await i, u = await t.resolveResources(l && x({
		fonts: l,
		source: [...Array.isArray(r) ? r : [r], `•◦■▪▸◂▾ 0123456789.-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`]
	}), s, a);
	return o?.throwIfAborted(), {
		options: {
			...c,
			...u
		},
		signal: o
	};
}
//#endregion
export { s as n, c as t };
