import { o as __toESM } from "./rolldown-runtime-BMI-E3GI.js";
import { n as unstable_notFound } from "./server-BJVqT1VK.js";
import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
import { n as joinPathname } from "./pathname-BkvvRSn7.js";
import { i as o$2, n as e$2, r as i$3 } from "./fonts-CBLz8Mte-tJo9sz-D.js";
//#region node_modules/@takumi-rs/helpers/dist/helpers-CVQCT1Rh.mjs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
function e$1(e, t) {
	t && Object.keys(t).length > 0 && (e.style = t);
}
function t$1(e, t) {
	t && Object.keys(t).length > 0 && (e.preset = t);
}
function n$1(e, t) {
	t.tagName !== void 0 && (e.tagName = t.tagName), t.className !== void 0 && (e.className = t.className), t.id !== void 0 && (e.id = t.id), t.dir !== void 0 && (e.dir = t.dir), t.lang !== void 0 && (e.lang = t.lang), t.attributes !== void 0 && (e.attributes = t.attributes);
}
function r$2(r) {
	let i = {
		type: `container`,
		children: r.children
	};
	return r.tw && (i.tw = r.tw), n$1(i, r), t$1(i, r.preset), e$1(i, r.style), i;
}
function i$2(r, i) {
	if (typeof r == `string`) {
		let t = {
			type: `text`,
			text: r
		};
		return e$1(t, i), t;
	}
	let a = {
		type: `text`,
		text: r.text
	};
	return r.tw && (a.tw = r.tw), n$1(a, r), t$1(a, r.preset), e$1(a, i ?? r.style), a;
}
function a$2(r) {
	let i = {
		type: `image`,
		src: r.src,
		width: r.width,
		height: r.height
	};
	return r.tw && (i.tw = r.tw), n$1(i, r), t$1(i, r.preset), e$1(i, r.style), i;
}
function s$2(e) {
	return `${e}%`;
}
//#endregion
//#region node_modules/@takumi-rs/helpers/dist/emoji.mjs
var r$1 = /\uFE0F/g;
var i$1 = /^\p{Extended_Pictographic}/u;
var a$1 = /^\p{Emoji_Presentation}/u;
var o$1 = /^\p{Emoji_Modifier_Base}\p{Emoji_Modifier}/u;
var s$1 = /^(?:\p{Regional_Indicator}){1,2}$/u;
var c$1 = /^[#*0-9]\uFE0F?\u20E3$/u;
function l$2(e) {
	return [...e.indexOf(`‍`) < 0 ? e.replace(r$1, ``) : e].map((e) => e.codePointAt(0)?.toString(16)).join(`-`);
}
var u$2 = {
	twemoji: (e) => `https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.2/assets/svg/${e.toLowerCase()}.svg`,
	openmoji: `https://cdn.jsdelivr.net/npm/@svgmoji/openmoji@2.0.0/svg/`,
	blobmoji: `https://cdn.jsdelivr.net/npm/@svgmoji/blob@2.0.0/svg/`,
	noto: (e) => `https://cdn.jsdelivr.net/gh/googlefonts/noto-emoji@v2.051/svg/emoji_u${e.toLowerCase().replaceAll(`-`, `_`)}.svg`,
	fluent: (e) => `https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/${e.toLowerCase()}_color.svg`,
	fluentFlat: (e) => `https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/${e.toLowerCase()}_flat.svg`
};
function d$2(e, t) {
	let n = l$2(e), r = u$2[t];
	return typeof r == `function` ? r(n) : `${r}${n.toUpperCase()}.svg`;
}
var f$2 = new Intl.Segmenter(`en`, { granularity: `grapheme` });
function p$2(e) {
	return Array.from(f$2.segment(e));
}
function m$2(e) {
	return e.includes(`︎`) ? !1 : s$1.test(e) || c$1.test(e) ? !0 : i$1.test(e) && (e.includes(`️`) || e.includes(`‍`) || a$1.test(e) || o$1.test(e));
}
function h$2(n, r) {
	let i = [], a = ``, o = p$2(n.text);
	for (let { segment: n } of o) m$2(n) ? (a &&= (i.push(i$2({ text: a })), ``), i.push(a$2({
		src: d$2(n, r),
		style: {
			display: `inline-block`,
			width: `1em`,
			height: `1em`,
			margin: `0 0.05em 0 0.1em`,
			verticalAlign: `-0.1em`
		}
	}))) : a += n;
	return a && i.push(i$2({ text: a })), i;
}
function g$2(e, t) {
	if (e.type === `text`) {
		if (p$2(e.text).some(({ segment: e }) => m$2(e))) {
			let { type: r, ...i } = e;
			return r$2({
				...i,
				children: h$2(e, t)
			});
		}
	} else if (e.type === `container` && e.children) return {
		...e,
		children: e.children.map((e) => e && g$2(e, t))
	};
	return e;
}
//#endregion
//#region node_modules/@takumi-rs/helpers/dist/index.mjs
var b$2 = /url\(\s*(['"]?)(.*?)\1\s*\)/g;
function x$2(e) {
	return e.startsWith(`https://`) || e.startsWith(`http://`);
}
function S$2(e, t) {
	if (typeof e == `string`) for (let n of e.matchAll(b$2)) {
		let e = n[2]?.trim();
		e && x$2(e) && t.add(e);
	}
	else if (Array.isArray(e)) for (let n of e) S$2(n, t);
}
function C$2(e) {
	let t = /* @__PURE__ */ new Set(), n = (e) => {
		let r = (e) => {
			e && (S$2(e.backgroundImage, t), S$2(e.maskImage, t), S$2(e.listStyleImage, t));
		};
		if (r(e.style), r(e.preset), S$2(e.tw, t), e.type === `image`) {
			typeof e.src == `string` && x$2(e.src) && t.add(e.src);
			return;
		}
		if (e.type === `container`) for (let t of e.children ?? []) n(t);
	};
	return n(e), [...t];
}
function w$2(e, n, i) {
	let a = n.maxBytes ?? 33554432, { allowUrl: o } = n, c = i?.get(e);
	if (c) return new e$2(n).waitFor(c).then((t) => {
		if (o && !o(e)) throw Error(`URL blocked by allowUrl policy: ${e}`);
		if (t.byteLength > a) throw Error(`Response exceeds ${a} bytes`);
		return t;
	});
	let l = i$3(e, n).then((e) => o$2(e, a)).catch((t) => {
		throw i?.delete(e), t;
	});
	return i?.set(e, l), l;
}
async function T$2({ node: e, sources: t = [], fetchCache: n, fetch: r, timeout: i, signal: a, maxBytes: o, allowUrl: s, throwOnError: c = !0 }) {
	let l = Array.isArray(e) ? e : [e], u = /* @__PURE__ */ new Map();
	for (let e of t) u.set(e.src, e);
	let d = [...new Set(l.flatMap(C$2))].filter((e) => !u.has(e)), f = {
		fetch: r,
		timeout: i,
		signal: a,
		maxBytes: o,
		allowUrl: s
	}, p = d.map(async (e) => ({
		src: e,
		data: await w$2(e, f, n)
	})), m = c ? await Promise.all(p) : (await Promise.allSettled(p)).filter((e) => e.status === `fulfilled`).map((e) => e.value);
	return [...u.values(), ...m];
}
//#endregion
//#region node_modules/@takumi-rs/helpers/dist/utils-4GQubbLq.mjs
var e = {
	html: { display: `block` },
	head: { display: `none` },
	meta: { display: `none` },
	title: { display: `none` },
	link: { display: `none` },
	style: { display: `none` },
	script: { display: `none` },
	noscript: { display: `none` },
	datalist: { display: `none` },
	template: { display: `none` },
	body: {
		margin: 8,
		display: `block`
	},
	p: {
		marginTop: `1em`,
		marginBottom: `1em`,
		display: `block`
	},
	blockquote: {
		marginTop: `1em`,
		marginBottom: `1em`,
		marginLeft: 40,
		marginRight: 40,
		display: `block`
	},
	figure: {
		marginTop: `1em`,
		marginBottom: `1em`,
		marginLeft: 40,
		marginRight: 40,
		display: `block`
	},
	figcaption: { display: `block` },
	address: {
		fontStyle: `italic`,
		display: `block`
	},
	article: { display: `block` },
	aside: { display: `block` },
	footer: { display: `block` },
	header: { display: `block` },
	hgroup: { display: `block` },
	main: { display: `block` },
	nav: { display: `block` },
	section: { display: `block` },
	center: {
		textAlign: `center`,
		display: `block`
	},
	hr: {
		marginTop: `0.5em`,
		marginBottom: `0.5em`,
		marginLeft: `auto`,
		marginRight: `auto`,
		borderWidth: 1,
		display: `block`
	},
	ul: {
		marginTop: `1em`,
		marginBottom: `1em`,
		paddingInlineStart: 40,
		display: `block`,
		listStyleType: `disc`
	},
	ol: {
		marginTop: `1em`,
		marginBottom: `1em`,
		paddingInlineStart: 40,
		display: `block`,
		listStyleType: `decimal`
	},
	menu: {
		marginTop: `1em`,
		marginBottom: `1em`,
		paddingInlineStart: 40,
		display: `block`,
		listStyleType: `disc`
	},
	li: { display: `list-item` },
	dl: {
		marginTop: `1em`,
		marginBottom: `1em`,
		display: `block`
	},
	dt: { display: `block` },
	dd: {
		marginLeft: 40,
		display: `block`
	},
	form: { display: `block` },
	fieldset: {
		marginLeft: 2,
		marginRight: 2,
		paddingTop: `0.35em`,
		paddingRight: `0.75em`,
		paddingBottom: `0.625em`,
		paddingLeft: `0.75em`,
		borderWidth: 2,
		display: `block`
	},
	legend: {
		paddingLeft: 2,
		paddingRight: 2,
		display: `block`
	},
	details: { display: `block` },
	summary: { display: `block` },
	search: { display: `block` },
	h1: {
		fontSize: `2em`,
		marginTop: `0.67em`,
		marginBottom: `0.67em`,
		marginLeft: 0,
		marginRight: 0,
		fontWeight: `bold`,
		display: `block`
	},
	h2: {
		fontSize: `1.5em`,
		marginTop: `0.83em`,
		marginBottom: `0.83em`,
		marginLeft: 0,
		marginRight: 0,
		fontWeight: `bold`,
		display: `block`
	},
	h3: {
		fontSize: `1.17em`,
		marginTop: `1em`,
		marginBottom: `1em`,
		marginLeft: 0,
		marginRight: 0,
		fontWeight: `bold`,
		display: `block`
	},
	h4: {
		marginTop: `1.33em`,
		marginBottom: `1.33em`,
		marginLeft: 0,
		marginRight: 0,
		fontWeight: `bold`,
		display: `block`
	},
	h5: {
		fontSize: `0.83em`,
		marginTop: `1.67em`,
		marginBottom: `1.67em`,
		marginLeft: 0,
		marginRight: 0,
		fontWeight: `bold`,
		display: `block`
	},
	h6: {
		fontSize: `0.67em`,
		marginTop: `2.33em`,
		marginBottom: `2.33em`,
		marginLeft: 0,
		marginRight: 0,
		fontWeight: `bold`,
		display: `block`
	},
	u: { textDecoration: `underline` },
	ins: { textDecoration: `underline` },
	strong: { fontWeight: `bolder` },
	b: { fontWeight: `bolder` },
	i: { fontStyle: `italic` },
	em: { fontStyle: `italic` },
	cite: { fontStyle: `italic` },
	dfn: { fontStyle: `italic` },
	code: { fontFamily: `monospace` },
	kbd: { fontFamily: `monospace` },
	samp: { fontFamily: `monospace` },
	pre: {
		fontFamily: `monospace`,
		whiteSpace: `pre`,
		margin: `1em 0`,
		display: `block`
	},
	br: { whiteSpace: `pre` },
	mark: {
		backgroundColor: `yellow`,
		color: `black`
	},
	big: { fontSize: `larger` },
	small: { fontSize: `smaller` },
	s: { textDecoration: `line-through` },
	del: { textDecoration: `line-through` },
	sub: {
		fontSize: `smaller`,
		verticalAlign: `sub`
	},
	sup: {
		fontSize: `smaller`,
		verticalAlign: `super`
	},
	div: { display: `block` },
	table: {
		display: `table`,
		boxSizing: `border-box`,
		borderSpacing: `2px`
	},
	thead: { display: `table-header-group` },
	tbody: { display: `table-row-group` },
	tfoot: { display: `table-footer-group` },
	tr: { display: `table-row` },
	td: {
		display: `table-cell`,
		padding: 1
	},
	th: {
		display: `table-cell`,
		padding: 1,
		fontWeight: `bold`,
		textAlign: `center`
	},
	caption: {
		display: `table-caption`,
		textAlign: `center`
	}
};
function t(t) {
	if (t !== !1) return t ?? e;
}
function n(e, t) {
	let n;
	for (let r in e) {
		if (!Object.hasOwn(e, r)) continue;
		let i = e[r];
		r !== `children` && r !== `className` && r !== `class` && r !== `id` && r !== `style` && r !== t && r !== `ref` && r !== `key` && r !== `dangerouslySetInnerHTML` && r !== `suppressHydrationWarning` && i != null && i !== !1 && typeof i != `function` && typeof i != `symbol` && typeof i != `object` && (n ??= {}, n[r] = i === !0 ? `` : String(i));
	}
	return n;
}
var r = !1;
function i(e) {
	Object.defineProperty(e, "stylesheets", { enumerable: !1 });
}
function a() {
	r || (r = !0, console.warn("takumi: the `stylesheets` result field is deprecated, use `css` instead."));
}
var o = /* @__PURE__ */ new Set([
	`head`,
	`meta`,
	`link`,
	`style`,
	`script`
]);
function s(e) {
	return o.has(e);
}
function c(e, t) {
	return e.type === t && `props` in e;
}
function l$1(e) {
	return e.replace(/([A-Z])/g, `-$1`).toLowerCase();
}
function u$1(e) {
	return typeof e == `object` && !!e && `type` in e;
}
function d$1(e) {
	return typeof e == `function`;
}
var f$1 = Symbol.for(`react.forward_ref`);
var p$1 = Symbol.for(`react.memo`);
var m$1 = Symbol.for(`react.fragment`);
function h$1(e, t) {
	return typeof e == `object` && !!e && `$$typeof` in e && e.$$typeof === t;
}
function g$1(e) {
	return h$1(e, f$1) && `render` in e && typeof e.render == `function`;
}
function _$2(e) {
	return h$1(e, p$1) && `type` in e;
}
function v$2(e) {
	return e.type === m$1;
}
//#endregion
//#region node_modules/@takumi-rs/helpers/dist/jsx.mjs
var _$1;
function v$1(e, t) {
	return typeof e == `object` && e && t in e ? e[t] : void 0;
}
function y$1(e) {
	return typeof e == `object` && !!e && `then` in e && typeof e.then == `function`;
}
function ee(e) {
	let t = v$1(e, `__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE`);
	if (typeof t == `object` && t && `H` in t) {
		let e = t;
		return {
			get: () => e.H,
			set: (t) => {
				e.H = t;
			}
		};
	}
	let n = v$1(v$1(e, `__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED`), `ReactCurrentDispatcher`);
	if (typeof n == `object` && n && `current` in n) {
		let e = n;
		return {
			get: () => e.current,
			set: (t) => {
				e.current = t;
			}
		};
	}
	return null;
}
function b$1() {
	return _$1 ??= import("./react.react-server-D8QgfE43.js").then((m) => /* @__PURE__ */ __toESM(m.default, 1)).then((e) => ee(e.default ?? e)).catch(() => null), _$1;
}
function x$1(e, t) {
	return e.contexts.has(t) ? e.contexts.get(t) : v$1(t, `_currentValue`);
}
var S$1 = () => {};
function C$1(e, t) {
	let n = (t) => x$1(e, t), r = 0;
	return {
		readContext: n,
		useContext: n,
		use: (e) => {
			if (y$1(e)) {
				if (e.status === `fulfilled`) return e.value;
				throw e.status === `rejected` ? e.reason : e;
			}
			return n(e);
		},
		useState: (e) => [typeof e == `function` ? e() : e, S$1],
		useReducer: (e, t, n) => [n ? n(t) : t, S$1],
		useMemo: (e) => e(),
		useCallback: (e) => e,
		useRef: (e) => ({ current: e }),
		useEffect: S$1,
		useLayoutEffect: S$1,
		useInsertionEffect: S$1,
		useImperativeHandle: S$1,
		useDebugValue: S$1,
		useDeferredValue: (e) => e,
		useTransition: () => [!1, S$1],
		useOptimistic: (e) => [e, S$1],
		useActionState: (e, t) => [
			t,
			S$1,
			!1
		],
		useSyncExternalStore: (e, t, n) => (n ?? t)(),
		useId: () => `:t${t}-${r++}:`,
		useCacheRefresh: () => S$1,
		useHostTransitionStatus: () => ({
			pending: !1,
			data: null,
			method: null,
			action: null
		})
	};
}
async function w$1(e, t, n) {
	let r = await b$1();
	if (!r) return e(t);
	let i = n.ids.current++;
	for (let a = 0;; a++) {
		let o = r.get();
		r.set(C$1(n, i));
		let s;
		try {
			return e(t);
		} catch (e) {
			s = e;
		} finally {
			r.set(o);
		}
		if (!y$1(s) || a >= 64) throw s;
		await T$1(s);
	}
}
async function T$1(e) {
	try {
		e.value = await e, e.status = `fulfilled`;
	} catch (t) {
		e.reason = t, e.status = `rejected`;
	}
}
function E$1(e) {
	return typeof e == `string` || typeof e == `number`;
}
function D$1(e) {
	return e.replace(/&/g, `&amp;`).replace(/"/g, `&quot;`).replace(/</g, `&lt;`).replace(/>/g, `&gt;`);
}
function O$1(e) {
	let t = [];
	for (let n in e) Object.hasOwn(e, n) && t.push(`${l$1(n)}:${String(e[n]).trim()}`);
	return t.join(`;`);
}
var k$1 = new Set(`stopColor.stopOpacity.strokeWidth.strokeDasharray.strokeDashoffset.strokeLinecap.strokeLinejoin.fillRule.clipRule.colorInterpolationFilters.floodColor.floodOpacity.accentHeight.alignmentBaseline.arabicForm.baselineShift.capHeight.clipPath.clipPathUnits.colorInterpolation.colorProfile.colorRendering.enableBackground.fillOpacity.fontFamily.fontSize.fontSizeAdjust.fontStretch.fontStyle.fontVariant.fontWeight.glyphName.glyphOrientationHorizontal.glyphOrientationVertical.horizAdvX.horizOriginX.imageRendering.letterSpacing.lightingColor.markerEnd.markerMid.markerStart.overlinePosition.overlineThickness.paintOrder.preserveAspectRatio.pointerEvents.shapeRendering.strokeMiterlimit.strokeOpacity.textAnchor.textDecoration.textRendering.transformOrigin.underlinePosition.underlineThickness.unicodeBidi.unicodeRange.unitsPerEm.vectorEffect.vertAdvY.vertOriginX.vertOriginY.vAlphabetic.vHanging.vIdeographic.vMathematical.wordSpacing.writingMode`.split(`.`));
function A$1(e, t) {
	if (e === `children` || t == null) return;
	let n;
	if (n = e === `className` ? `class` : k$1.has(e) ? l$1(e) : e, typeof t == `boolean`) return `${n}="${String(t)}"`;
	if (e === `style` && typeof t == `object`) {
		let e = O$1(t);
		if (e) return `style="${D$1(e)}"`;
	}
	return `${n}="${D$1(String(t))}"`;
}
function j$1(e, t, n) {
	let r = !1;
	for (let n in e) {
		if (!Object.hasOwn(e, n)) continue;
		let i = A$1(n, e[n]);
		i !== void 0 && (t.push(` `, i), n === `xmlns` && (r = !0));
	}
	n && !r && t.push(` xmlns="http://www.w3.org/2000/svg"`);
}
var M$1 = (e, t, n) => {
	let r = e.props || {};
	if (d$1(e.type)) {
		N$1(e.type(e.props), t, !1);
		return;
	}
	if (typeof e.type == `symbol`) {
		N$1(r.children, t, !1);
		return;
	}
	if (g$1(e.type)) {
		N$1(e.type.render(e.props, null), t, !1);
		return;
	}
	if (_$2(e.type)) {
		M$1({
			...e,
			type: e.type.type
		}, t, n);
		return;
	}
	if (typeof e.type != `string`) return;
	t.push(`<`, e.type), j$1(r, t, n && e.type === `svg`);
	let a = r.children;
	t.push(`>`), N$1(a, t, !1), t.push(`</`, e.type, `>`);
};
function N$1(e, t, n) {
	if (e != null && e !== !1) {
		if (E$1(e)) {
			t.push(String(e));
			return;
		}
		if (Array.isArray(e)) {
			for (let n of e) N$1(n, t, !1);
			return;
		}
		u$1(e) && M$1(e, t, n);
	}
}
function te(e) {
	let t = [];
	return N$1(e, t, !0), t.join(``);
}
function P$1() {
	return {
		nodes: [],
		css: []
	};
}
async function F$1(t$3, n) {
	let i$5 = await I$1(t$3, {
		defaultStyles: L$1(n),
		presets: t(n?.defaultStyles),
		tailwindClassesProperty: n?.tailwindClassesProperty ?? `tw`,
		contexts: /* @__PURE__ */ new Map(),
		ids: { current: 0 }
	}), a$4 = i$5.nodes, o;
	o = a$4.length === 0 ? r$2({}) : a$4.length === 1 && a$4[0] !== void 0 ? a$4[0] : r$2({
		children: a$4,
		style: {
			display: `block`,
			width: s$2(100),
			height: s$2(100)
		}
	});
	let c = i$5.css, u = {
		node: o,
		css: c,
		get stylesheets() {
			return a(), c;
		}
	};
	return i(u), u;
}
async function I$1(e, t) {
	return e == null || e === !1 ? P$1() : e instanceof Promise ? I$1(await e, t) : typeof e == `object` && Symbol.iterator in e ? se(e, t) : u$1(e) ? await Z(e, t) : {
		nodes: [i$2({
			text: String(e),
			preset: t.presets?.span
		})],
		css: []
	};
}
function L$1(e$3) {
	return e$3 && `defaultStyles` in e$3 ? e$3.defaultStyles ?? e : e;
}
var R$1 = Symbol.for(`react.context`);
var z$1 = Symbol.for(`react.provider`);
var B$1 = Symbol.for(`react.consumer`);
function V$1(e, t) {
	let n = e.type;
	if (typeof n != `object` || !n) return;
	let r = v$1(n, `$$typeof`);
	if (r === z$1) return H$1(e, v$1(n, `_context`), t);
	if (r === B$1) return U$1(e, v$1(n, `_context`) ?? n, t);
	if (r === R$1) return typeof K$1(e) == `function` ? U$1(e, n, t) : H$1(e, n, t);
}
function H$1(e, t, n) {
	let r = new Map(n.contexts);
	return r.set(t, v$1(e.props, `value`)), $(e, {
		...n,
		contexts: r
	});
}
function U$1(e, t, n) {
	let r = K$1(e);
	return d$1(r) ? I$1(r(x$1(n, t)), n) : $(e, n);
}
async function W$1(e, t, n) {
	return I$1(await w$1(e, t, n), n);
}
function G$1(e, t) {
	if (g$1(e.type)) {
		let { render: n } = e.type;
		return W$1((e) => n(e, null), e.props, t);
	}
	if (_$2(e.type)) {
		let n = e.type.type;
		return d$1(n) ? W$1(n, e.props, t) : Z({
			...e,
			type: n
		}, t);
	}
}
function K$1(e) {
	if (typeof e.props == `object` && e.props !== null && `children` in e.props) return e.props.children;
}
function q$1(e) {
	if (!u$1(e)) return;
	let t = K$1(e);
	if (typeof t == `string`) return t;
	if (typeof t == `number`) return String(t);
	if (Array.isArray(t) || typeof t == `object` && t && Symbol.iterator in t) return X(t);
	if (u$1(t) && v$2(t)) return q$1(t);
}
function J(e) {
	let t = [];
	for (let n of e) {
		let e = Y(n);
		if (e === void 0) return;
		t.push(e);
	}
	return t.join(``);
}
function Y(e) {
	if (typeof e == `string`) return e;
	if (typeof e == `number`) return String(e);
	if (e == null || typeof e == `boolean` || typeof e == `symbol`) return ``;
	if (typeof e == `object` && Symbol.iterator in e) return J(e);
	if (!u$1(e)) return;
	if (v$2(e)) return Y(K$1(e));
	let t = K$1(e);
	return t === void 0 ? `` : typeof t == `object` && t && Symbol.iterator in t ? J(t) : Y(t);
}
function X(e) {
	let t = [], n = !1;
	for (let r of e) {
		if (u$1(r)) return;
		if (typeof r == `string`) {
			n = !0, t.push(r);
			continue;
		}
		if (typeof r == `number`) {
			n = !0, t.push(String(r));
			continue;
		}
		return;
	}
	if (n) return t.join(``);
}
async function Z(e, t) {
	let i = V$1(e, t);
	if (i !== void 0) return i;
	if (d$1(e.type)) return W$1(e.type, e.props, t);
	let a = G$1(e, t);
	if (a !== void 0) return a;
	if (v$2(e)) return $(e, t);
	if (c(e, `style`)) {
		let t = Y(K$1(e));
		return {
			nodes: [],
			css: t && t.length > 0 ? [t] : []
		};
	}
	if (c(e, `head`)) return {
		nodes: [],
		css: (await $(e, t)).css
	};
	if (typeof e.type != `string` || s(e.type)) return P$1();
	let o = Q(e, t);
	if (c(e, `br`)) return {
		nodes: [i$2({
			text: `
`,
			preset: t.presets?.br,
			...o
		})],
		css: []
	};
	if (c(e, `img`)) return {
		nodes: [re(e, t)],
		css: []
	};
	if (c(e, `svg`)) return {
		nodes: [ie(e, t)],
		css: []
	};
	let s$4 = q$1(e);
	if (s$4 !== void 0) return {
		nodes: [i$2({
			text: s$4,
			...o
		})],
		css: []
	};
	let l = await $(e, t);
	return {
		nodes: [r$2({
			children: l.nodes,
			...o
		})],
		css: l.css
	};
}
function re(e, n) {
	if (!e.props.src) throw Error(`Image element must have a 'src' prop.`);
	let r = Q(e, n), i = e.props.width === void 0 ? void 0 : Number(e.props.width), a = e.props.height === void 0 ? void 0 : Number(e.props.height);
	return a$2({
		src: e.props.src,
		width: i,
		height: a,
		...r
	});
}
function ie(e, n) {
	let r = Q(e, n);
	return a$2({
		src: te(e),
		width: e.props.width === void 0 ? void 0 : Number(e.props.width),
		height: e.props.height === void 0 ? void 0 : Number(e.props.height),
		...r
	});
}
function ae(e, t, n) {
	let r = n.presets, i = r && e !== void 0 && e in r ? r[e] : void 0;
	if (typeof t != `object` || !t) return { preset: i };
	for (let e in t) if (Object.hasOwn(t, e)) return {
		preset: i,
		style: t
	};
	return { preset: i };
}
function oe(e, t) {
	let n = t.tailwindClassesProperty;
	if (typeof e.props != `object` || e.props === null || !(n in e.props)) return;
	let r = e.props[n];
	if (typeof r == `string`) return r;
}
function Q(e, t) {
	let n$3 = e.props, r = typeof e.type == `string` ? e.type : void 0, { preset: i, style: a } = ae(r, n$3.style, t), s = oe(e, t), c = n(n$3, t.tailwindClassesProperty);
	return {
		tagName: r,
		className: n$3.className ?? n$3.class,
		id: n$3.id,
		dir: n$3.dir,
		lang: n$3.lang,
		attributes: c,
		tw: s,
		style: a,
		preset: i
	};
}
function $(e, t) {
	let n = K$1(e);
	return n === void 0 ? Promise.resolve(P$1()) : I$1(n, t);
}
async function se(e, t) {
	let n = [], r = /* @__PURE__ */ new Set(), i = 0;
	for (let a of e) {
		let e = i;
		i += 1;
		let o = I$1(a, t).then((t) => {
			n[e] = t;
		}).finally(() => r.delete(o));
		r.add(o), r.size >= 8 && await Promise.race(r);
	}
	await Promise.all(r);
	let a = [], o = [];
	for (let e of n) e && (a.push(...e.nodes), o.push(...e.css));
	return {
		nodes: a,
		css: o
	};
}
//#endregion
//#region node_modules/takumi-js/dist/backend/node.mjs
var loadNative = () => import("./export-B0e3F2HU.js").catch((cause) => {
	throw new Error("Failed to load the native @takumi-rs/core backend. On a runtime without the native addon, pass a `module` (a WASM binary) to render with the WASM backend instead.", { cause });
});
var loadWasm = (module) => import("./wasm-node-BsD8jxba-DSzwe6Fq.js").then((backend) => backend.loadBackend(module));
var loadBackend = (module) => typeof process !== "undefined" && process.versions?.webcontainer ? loadWasm(module) : loadNative(module);
//#endregion
//#region node_modules/@takumi-rs/helpers/dist/html.mjs
var l = Symbol(`Fragment`);
var u = /* @__PURE__ */ new Set([
	`area`,
	`base`,
	`br`,
	`col`,
	`embed`,
	`hr`,
	`img`,
	`input`,
	`keygen`,
	`link`,
	`meta`,
	`param`,
	`source`,
	`track`,
	`wbr`
]);
var d = /* @__PURE__ */ new Set([`script`, `style`]);
var f = /(?:<(\/?)([a-zA-Z][a-zA-Z0-9\:-]*)(?:\s([^>]*?))?((?:\s*\/)?)>|(<\!\-\-)([\s\S]*?)(\-\->)|(<\!)([\s\S]*?)(>))/gm;
var p = 64;
var m = 46;
var h = 45;
var g = 58;
var _ = 95;
var v = 61;
var y = 34;
var b = 39;
var x = 92;
function S(e) {
	return e >= 97 && e <= 122 || e >= 65 && e <= 90 || e >= 48 && e <= 57 || e === p || e === m || e === h || e === g || e === _;
}
function C(e) {
	let t = {};
	if (e) {
		let n = `none`, r, i = ``, a;
		for (let o = 0; o < e.length; o++) {
			let s = e.charCodeAt(o);
			if (n === `none`) S(s) ? (r && (t[r] = i, r = void 0, i = ``), a = o, n = `key`) : s === v && r && (n = `value`);
			else if (n === `key`) S(s) || (r = e.substring(a, o), n = s === v ? `value` : `none`);
			else if (s === y || s === b) {
				let t = s === y ? `"` : `'`, r = o + 1, a = e.indexOf(t, r);
				for (; a > 0 && e.charCodeAt(a - 1) === x;) a = e.indexOf(t, a + 1);
				if (a === -1) break;
				i = e.substring(r, a), o = a, n = `none`;
			}
		}
		n === `key` && a != null && a < e.length && (r = e.substring(a, e.length)), r && (t[r] = i);
	}
	return t;
}
function w(e) {
	let t = typeof e == `string` ? e : e.value, n, r, i, a, o, s, c, l, p, m = [];
	f.lastIndex = 0, r = n = {
		type: 0,
		children: []
	};
	let h = 0;
	function g() {
		a = t.substring(h, f.lastIndex - i[0].length), a && r.children.push({
			type: 2,
			value: a,
			parent: r
		});
	}
	for (; i = f.exec(t);) {
		if (s = i[5] || i[8], c = i[6] || i[9], l = i[7] || i[10], d.has(r.name) && i[2] !== r.name) {
			o = f.lastIndex - i[0].length, r.children.length > 0 && (r.children[0].value += i[0]);
			continue;
		}
		if (s === `<!--`) {
			if (o = f.lastIndex - i[0].length, d.has(r.name)) continue;
			p = {
				type: 3,
				value: c,
				parent: r,
				loc: [{
					start: o,
					end: o + s.length
				}, {
					start: f.lastIndex - l.length,
					end: f.lastIndex
				}]
			}, m.push(p), p.parent.children.push(p);
		} else if (s === `<!`) o = f.lastIndex - i[0].length, p = {
			type: 4,
			value: c,
			parent: r,
			loc: [{
				start: o,
				end: o + s.length
			}, {
				start: f.lastIndex - l.length,
				end: f.lastIndex
			}]
		}, m.push(p), p.parent.children.push(p);
		else if (i[1] !== `/`) {
			if (g(), d.has(r.name)) {
				h = f.lastIndex, g();
				continue;
			}
			p = {
				type: 1,
				name: i[2] + ``,
				attributes: C(i[3]),
				parent: r,
				children: [],
				loc: [{
					start: f.lastIndex - i[0].length,
					end: f.lastIndex
				}]
			}, m.push(p), p.parent.children.push(p), i[4] && i[4].indexOf(`/`) > -1 || u.has(p.name) ? (p.loc[1] = p.loc[0], p.isSelfClosingTag = !0) : r = p;
		} else g(), i[2] + `` === r.name ? (p = r, r = p.parent, p.loc.push({
			start: f.lastIndex - i[0].length,
			end: f.lastIndex
		}), a = t.substring(p.loc[0].end, p.loc[1].start), p.children.length === 0 && p.children.push({
			type: 2,
			value: a,
			parent: r
		})) : i[2] + `` === m[m.length - 1].name && m[m.length - 1].isSelfClosingTag === !0 && (p = m[m.length - 1], p.loc.push({
			start: f.lastIndex - i[0].length,
			end: f.lastIndex
		}));
		h = f.lastIndex;
	}
	return a = t.slice(h), r.children.push({
		type: 2,
		value: a,
		parent: r
	}), n;
}
var T = Symbol(`HTMLString`);
var E = Symbol(`RenderFn`);
function D(e, t = [T]) {
	let n = { value: e };
	for (let e of t) Object.defineProperty(n, e, {
		value: !0,
		enumerable: !1,
		writable: !1
	});
	return n;
}
var O = {
	"&": `&amp;`,
	"<": `&lt;`,
	">": `&gt;`
};
function k(e) {
	return e.replace(/[&<>]/g, (e) => O[e] || e);
}
function A(e) {
	let t = ``;
	for (let [n, r] of Object.entries(e)) t += ` ${n}="${r}"`;
	return t;
}
function j(e) {
	if (e.children.length === 0) {
		let t = e;
		for (; t = t.parent;) if (t.name === `svg`) return !0;
	}
	return !1;
}
function M(e) {
	let { name: t, attributes: n = {} } = e, r = e.children.map((e) => N(e)).join(``);
	if (E in e) {
		let t = e[E](n, D(r));
		return t && t[T] ? t.value : k(String(t));
	}
	if (t === l) return r;
	let i = j(e);
	return i || u.has(t) ? `<${e.name}${A(n)}${i ? ` /` : ``}>` : `<${e.name}${A(n)}>${r}</${e.name}>`;
}
function N(e) {
	switch (e.type) {
		case 0: return e.children.map((e) => N(e)).join(``);
		case 1: return M(e);
		case 2: return `${e.value}`;
		case 3: return `<!--${e.value}-->`;
		case 4: return `<!${e.value}>`;
	}
}
var P = {
	quot: `"`,
	amp: `&`,
	lt: `<`,
	gt: `>`,
	apos: `'`,
	nbsp: `\xA0`,
	iexcl: `¡`,
	cent: `¢`,
	pound: `£`,
	curren: `¤`,
	yen: `¥`,
	brvbar: `¦`,
	sect: `§`,
	uml: `¨`,
	copy: `©`,
	ordf: `ª`,
	laquo: `«`,
	not: `¬`,
	shy: `­`,
	reg: `®`,
	macr: `¯`,
	deg: `°`,
	plusmn: `±`,
	sup2: `²`,
	sup3: `³`,
	acute: `´`,
	micro: `µ`,
	para: `¶`,
	middot: `·`,
	cedil: `¸`,
	sup1: `¹`,
	ordm: `º`,
	raquo: `»`,
	frac14: `¼`,
	frac12: `½`,
	frac34: `¾`,
	iquest: `¿`,
	Agrave: `À`,
	Aacute: `Á`,
	Acirc: `Â`,
	Atilde: `Ã`,
	Auml: `Ä`,
	Aring: `Å`,
	AElig: `Æ`,
	Ccedil: `Ç`,
	Egrave: `È`,
	Eacute: `É`,
	Ecirc: `Ê`,
	Euml: `Ë`,
	Igrave: `Ì`,
	Iacute: `Í`,
	Icirc: `Î`,
	Iuml: `Ï`,
	ETH: `Ð`,
	Ntilde: `Ñ`,
	Ograve: `Ò`,
	Oacute: `Ó`,
	Ocirc: `Ô`,
	Otilde: `Õ`,
	Ouml: `Ö`,
	times: `×`,
	Oslash: `Ø`,
	Ugrave: `Ù`,
	Uacute: `Ú`,
	Ucirc: `Û`,
	Uuml: `Ü`,
	Yacute: `Ý`,
	THORN: `Þ`,
	szlig: `ß`,
	agrave: `à`,
	aacute: `á`,
	acirc: `â`,
	atilde: `ã`,
	auml: `ä`,
	aring: `å`,
	aelig: `æ`,
	ccedil: `ç`,
	egrave: `è`,
	eacute: `é`,
	ecirc: `ê`,
	euml: `ë`,
	igrave: `ì`,
	iacute: `í`,
	icirc: `î`,
	iuml: `ï`,
	eth: `ð`,
	ntilde: `ñ`,
	ograve: `ò`,
	oacute: `ó`,
	ocirc: `ô`,
	otilde: `õ`,
	ouml: `ö`,
	divide: `÷`,
	oslash: `ø`,
	ugrave: `ù`,
	uacute: `ú`,
	ucirc: `û`,
	uuml: `ü`,
	yacute: `ý`,
	thorn: `þ`,
	yuml: `ÿ`,
	fnof: `ƒ`,
	Alpha: `Α`,
	Beta: `Β`,
	Gamma: `Γ`,
	Delta: `Δ`,
	Epsilon: `Ε`,
	Zeta: `Ζ`,
	Eta: `Η`,
	Theta: `Θ`,
	Iota: `Ι`,
	Kappa: `Κ`,
	Lambda: `Λ`,
	Mu: `Μ`,
	Nu: `Ν`,
	Xi: `Ξ`,
	Omicron: `Ο`,
	Pi: `Π`,
	Rho: `Ρ`,
	Sigma: `Σ`,
	Tau: `Τ`,
	Upsilon: `Υ`,
	Phi: `Φ`,
	Chi: `Χ`,
	Psi: `Ψ`,
	Omega: `Ω`,
	alpha: `α`,
	beta: `β`,
	gamma: `γ`,
	delta: `δ`,
	epsilon: `ε`,
	zeta: `ζ`,
	eta: `η`,
	theta: `θ`,
	iota: `ι`,
	kappa: `κ`,
	lambda: `λ`,
	mu: `μ`,
	nu: `ν`,
	xi: `ξ`,
	omicron: `ο`,
	pi: `π`,
	rho: `ρ`,
	sigmaf: `ς`,
	sigma: `σ`,
	tau: `τ`,
	upsilon: `υ`,
	phi: `φ`,
	chi: `χ`,
	psi: `ψ`,
	omega: `ω`,
	thetasym: `ϑ`,
	upsih: `ϒ`,
	piv: `ϖ`,
	bull: `•`,
	hellip: `…`,
	prime: `′`,
	Prime: `″`,
	oline: `‾`,
	frasl: `⁄`,
	weierp: `℘`,
	image: `ℑ`,
	real: `ℜ`,
	trade: `™`,
	alefsym: `ℵ`,
	larr: `←`,
	uarr: `↑`,
	rarr: `→`,
	darr: `↓`,
	harr: `↔`,
	crarr: `↵`,
	lArr: `⇐`,
	uArr: `⇑`,
	rArr: `⇒`,
	dArr: `⇓`,
	hArr: `⇔`,
	forall: `∀`,
	part: `∂`,
	exist: `∃`,
	empty: `∅`,
	nabla: `∇`,
	isin: `∈`,
	notin: `∉`,
	ni: `∋`,
	prod: `∏`,
	sum: `∑`,
	minus: `−`,
	lowast: `∗`,
	radic: `√`,
	prop: `∝`,
	infin: `∞`,
	ang: `∠`,
	and: `∧`,
	or: `∨`,
	cap: `∩`,
	cup: `∪`,
	int: `∫`,
	there4: `∴`,
	sim: `∼`,
	cong: `≅`,
	asymp: `≈`,
	ne: `≠`,
	equiv: `≡`,
	le: `≤`,
	ge: `≥`,
	sub: `⊂`,
	sup: `⊃`,
	nsub: `⊄`,
	sube: `⊆`,
	supe: `⊇`,
	oplus: `⊕`,
	otimes: `⊗`,
	perp: `⊥`,
	sdot: `⋅`,
	lceil: `⌈`,
	rceil: `⌉`,
	lfloor: `⌊`,
	rfloor: `⌋`,
	lang: `⟨`,
	rang: `⟩`,
	loz: `◊`,
	spades: `♠`,
	clubs: `♣`,
	hearts: `♥`,
	diams: `♦`,
	OElig: `Œ`,
	oelig: `œ`,
	Scaron: `Š`,
	scaron: `š`,
	Yuml: `Ÿ`,
	circ: `ˆ`,
	tilde: `˜`,
	ensp: ` `,
	emsp: ` `,
	thinsp: ` `,
	zwnj: `‌`,
	zwj: `‍`,
	lrm: `‎`,
	rlm: `‏`,
	ndash: `–`,
	mdash: `—`,
	lsquo: `‘`,
	rsquo: `’`,
	sbquo: `‚`,
	ldquo: `“`,
	rdquo: `”`,
	bdquo: `„`,
	dagger: `†`,
	Dagger: `‡`,
	permil: `‰`,
	lsaquo: `‹`,
	rsaquo: `›`,
	euro: `€`
};
function F(e) {
	return e.includes(`&`) ? e.replace(/&(?:#(\d+)|#[xX]([\da-fA-F]+)|([a-zA-Z][\w-]+));/g, (e, t, n, r) => t ? I(Number(t)) ?? e : n ? I(Number.parseInt(n, 16)) ?? e : Object.hasOwn(P, r) ? P[r] ?? e : e) : e;
}
function I(e) {
	if (!(!Number.isInteger(e) || e < 0 || e > 1114111) && !(e >= 55296 && e <= 57343)) {
		if (e === 0) return `�`;
		if (e >= 128 && e <= 159) return `€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ`[e - 128];
		try {
			return String.fromCodePoint(e);
		} catch {
			return;
		}
	}
}
function L(e, t$2) {
	let n = w(e), r = {
		nodes: [],
		css: []
	}, i = t(t$2?.defaultStyles), o = t$2?.tailwindClassesProperty ?? `tw`;
	for (let e of n.children) R(e, i, o, r.nodes, r.css);
	return r;
}
function R(e, i, a, s$3, c) {
	if (e.type === 3) return;
	if (e.type === 2) {
		let t = F(e.value ?? ``);
		t && s$3.push(i$2({
			text: t,
			preset: i?.span
		}));
		return;
	}
	if (e.type === 0) {
		for (let t of e.children) R(t, i, a, s$3, c);
		return;
	}
	if (e.type !== 1) return;
	let l = e;
	if (l.name === `style`) {
		let e = ``;
		for (let t of l.children) t.type === 2 && typeof t.value == `string` && (e += t.value);
		e && c.push(e);
		return;
	}
	if (l.name === `head`) {
		let e = [];
		for (let t of l.children) R(t, i, a, e, c);
		return;
	}
	let u = z(l, i, a);
	if (l.name === `br`) {
		s$3.push(i$2({
			text: `
`,
			preset: i?.br,
			...u
		}));
		return;
	}
	if (l.name === `img`) {
		let e = l.attributes?.src;
		if (!e) throw Error(`Image element must have a 'src' prop.`);
		s$3.push(a$2({
			src: e,
			width: G(l.attributes?.width),
			height: G(l.attributes?.height),
			...u
		}));
		return;
	}
	if (s(l.name)) return;
	if (l.name === `svg`) {
		s$3.push(a$2({
			src: N(l),
			width: G(l.attributes?.width),
			height: G(l.attributes?.height),
			...u
		}));
		return;
	}
	let d = !0, f = ``;
	for (let e of l.children) if (e.type !== 3) {
		if (e.type !== 2) {
			d = !1;
			break;
		}
		f += e.value ?? ``;
	}
	if (d && f) {
		s$3.push(i$2({
			text: F(f),
			...u
		}));
		return;
	}
	let p = [];
	for (let e of l.children) R(e, i, a, p, c);
	s$3.push(r$2({
		children: p,
		...u
	}));
}
function z(e, t, n$2) {
	let r = e.attributes ? B(e.attributes) : {}, a = typeof r.style == `string` ? V(r.style) : void 0, o = n(r, n$2), s = typeof r[n$2] == `string` ? r[n$2] : void 0, c = t && e.name in t ? t[e.name] : void 0;
	return {
		tagName: e.name,
		className: r.class,
		id: r.id,
		dir: r.dir,
		lang: r.lang,
		attributes: o,
		tw: s,
		style: a,
		preset: c
	};
}
function B(e) {
	let t = {};
	for (let n in e) {
		let r = e[n];
		r !== void 0 && (t[n] = F(r));
	}
	return t;
}
function V(e) {
	let t = {}, n = 0, r = -1, i = 0, a = (i) => {
		if (r < 0) return;
		let a = e.slice(n, r).trim(), o = e.slice(r + 1, i).trim();
		a && o && (t[W(a)] = o);
	};
	for (let t = 0; t < e.length; t += 1) {
		let o = e[t];
		if (o === `\\`) t += 1;
		else if (o === `"` || o === `'`) t = H(e, t);
		else if (o === `/` && e[t + 1] === `*`) t = U(e, t);
		else if (o === `(`) i += 1;
		else if (o === `)`) i = Math.max(0, i - 1);
		else if (i > 0) continue;
		else o === `:` && r < 0 ? r = t : o === `;` && (a(t), n = t + 1, r = -1);
	}
	return a(e.length), Object.keys(t).length > 0 ? t : void 0;
}
function H(e, t) {
	let n = e[t];
	for (let r = t + 1; r < e.length; r += 1) if (e[r] === `\\`) r += 1;
	else if (e[r] === n) return r;
	return e.length;
}
function U(e, t) {
	let n = e.indexOf(`*/`, t + 2);
	return n < 0 ? e.length : n + 1;
}
function W(e) {
	return e.startsWith(`--`) ? e : e.replace(/-([a-z])/g, (e, t) => t.toUpperCase());
}
function G(e) {
	if (!e) return;
	let t = Number(e);
	return Number.isFinite(t) ? t : void 0;
}
var K = (e) => `text` in e && typeof e.text == `string` && e.text.trim() === ``;
function q(t) {
	let { nodes: n, css: i$4 } = L(t);
	for (; n[0] && K(n[0]);) n.shift();
	for (; n.at(-1) && K(n.at(-1));) n.pop();
	let a$3;
	a$3 = n.length === 0 ? r$2({}) : n.length === 1 && n[0] ? n[0] : r$2({
		style: {
			display: `block`,
			width: s$2(100),
			height: s$2(100)
		},
		children: n
	});
	let o = {
		node: a$3,
		css: i$4,
		get stylesheets() {
			return a(), i$4;
		}
	};
	return i(o), o;
}
var RendererProvider = class {
	load;
	backend;
	renderer;
	constructor(load) {
		this.load = load;
	}
	async get(module) {
		this.backend ??= this.load(module).catch((error) => {
			this.backend = void 0;
			throw error;
		});
		const backend = await this.backend;
		return this.renderer ??= new backend.Renderer();
	}
};
var defaultRenderer = new RendererProvider(async (module) => {
	return await (module === void 0 ? loadBackend() : import("./wasm-init-DzwbPAKW-BLxwjuuK.js").then((n) => n.n).then(({ initWasm }) => initWasm(module)));
});
function isTakumiNode(element) {
	if (typeof element !== "object" || element === null || !("type" in element)) return false;
	return element.type === "container" || element.type === "text" || element.type === "image";
}
async function transformElement(element, options) {
	if (isTakumiNode(element)) return {
		node: element,
		css: []
	};
	if (typeof element === "string") return q(element);
	return F$1(element, options?.jsx);
}
/** Resolves a caller-supplied renderer or the default provider. */
async function resolveRenderer(options) {
	if (options && "renderer" in options && options.renderer) return options.renderer;
	return defaultRenderer.get(options?.module);
}
/** Transforms an input into a node tree and extracts its emojis. */
async function resolveContent(element, options) {
	const { node: originalNode, css } = await transformElement(element, options);
	const emojiType = options?.emoji ?? "twemoji";
	return {
		node: emojiType !== "from-font" ? g$2(originalNode, emojiType) : originalNode,
		css
	};
}
/** Resolves the render's `images` option into concrete entries via {@link prepareImages}. */
async function collectImages(node, options) {
	const images = options?.images;
	const { sources, fetchCache, fetch, timeout, maxBytes, allowUrl, cache } = Array.isArray(images) ? { sources: images } : images ?? {};
	const prepared = await T$2({
		node,
		sources,
		fetchCache,
		fetch,
		timeout,
		maxBytes,
		allowUrl,
		signal: options?.signal
	});
	return cache ? prepared.map((image) => ({
		...image,
		cache: ("cache" in image ? image.cache : void 0) ?? cache
	})) : prepared;
}
var warnedStylesheets = false;
function warnStylesheetsDeprecated() {
	if (warnedStylesheets) return;
	warnedStylesheets = true;
	console.warn("takumi: the `stylesheets` option is deprecated, use `css` instead.");
}
/** Narrows the `css` option, which takes one entry or a list of them. */
function isCssList(css) {
	return Array.isArray(css);
}
function mergeCss(options, extra) {
	if (options?.css !== void 0 && options?.stylesheets !== void 0) throw new Error("pass either `css` or `stylesheets`, not both");
	if (options?.stylesheets !== void 0) warnStylesheetsDeprecated();
	return [...options?.css !== void 0 ? isCssList(options.css) ? options.css : [options.css] : options?.stylesheets ?? [], ...extra];
}
/**
* Renders a React element, HTML string, or Takumi node tree into an image.
*
* This function automatically detects the best renderer for your environment (native Rust on Node.js,
* WASM on Edge/Workers) and handles fetching fonts and images, and emoji extraction.
*
* @example
* ```tsx
* import { render } from "takumi-js";
*
* const buffer = await render(
*   <div tw="bg-blue-500 text-white p-4">Hello World</div>,
*   { width: 1200, height: 630 }
* );
* ```
*
* @param element - The content to render. Can be a JSX element (React-like), an HTML string, or a pre-constructed node tree.
* @param options - Configuration for rendering, including dimensions, format, fonts, and more.
* @returns A promise that resolves to the rendered image data (Buffer/Uint8Array).
*/
async function render(element, options) {
	options?.signal?.throwIfAborted();
	const renderer = await resolveRenderer(options);
	const { node, css: extractedCss } = await resolveContent(element, options);
	const images = await collectImages(node, options);
	options?.signal?.throwIfAborted();
	const { css: _, stylesheets: _alias, ...forward } = options ?? {};
	return renderer.render(node, {
		...forward,
		images,
		css: mergeCss(options, extractedCss)
	});
}
//#endregion
//#region node_modules/takumi-js/dist/response.mjs
var contentTypeMap = {
	png: "image/png",
	jpeg: "image/jpeg",
	webp: "image/webp",
	ico: "image/x-icon",
	raw: "application/octet-stream"
};
function defaultErrorHandler(error) {
	console.error("Failed to render image.");
	console.error(error);
}
function buildImageResponse(element, options) {
	let resolveReady;
	let rejectReady;
	const ready = new Promise((resolve, reject) => {
		resolveReady = resolve;
		rejectReady = reject;
	});
	ready.catch(() => {});
	const stream = new ReadableStream({ async start(controller) {
		try {
			const image = await render(element, options);
			controller.enqueue(image);
			controller.close();
			resolveReady();
		} catch (error) {
			controller.error(error);
			rejectReady(error);
			await (options?.onError ?? defaultErrorHandler)(error);
		}
	} });
	const headers = new Headers(options?.headers);
	if (!headers.get("content-type")) headers.set("content-type", contentTypeMap[options?.format ?? "png"]);
	const response = new Response(stream, {
		headers,
		status: options?.status,
		statusText: options?.statusText
	});
	return Object.defineProperty(response, "ready", {
		enumerable: false,
		value: ready,
		writable: false
	});
}
/**
* A universal ImageResponse class for generating images in API routes.
*
* Drop-in compatible with `next/og`'s `ImageResponse`. It supports React elements,
* custom fonts, Tailwind CSS (via `tw` prop), and various image formats.
*
* @example
* ```tsx
* import { ImageResponse } from "takumi-js/response";
*
* export function GET() {
*   return new ImageResponse(
*     <div tw="flex h-full w-full items-center justify-center bg-white">
*       <h1 tw="text-6xl font-bold">Hello World</h1>
*     </div>,
*     { width: 1200, height: 630 }
*   );
* }
* ```
*
* @param component - The JSX element to render.
* @param options - Rendering and response options.
*/
var ImageResponse = class extends Response {
	ready;
	constructor(component, options) {
		const response = buildImageResponse(component, options);
		super(response.body, response);
		this.ready = response.ready;
	}
};
//#endregion
//#region node_modules/fumapress/dist/plugins/takumi.js
function takumiPlugin(options = {}) {
	const { width = 1200, height = 630, generate = function fn(page) {
		return { node: generateDefault({
			title: page.data.title,
			description: page.data.description,
			site: this.siteConfig.name
		}) };
	} } = options;
	let basePath;
	function slugsToImagePath(slugs, lang) {
		const segments = [...slugs];
		if (segments.length === 0) segments.push("index.webp");
		else segments[segments.length - 1] += ".webp";
		return {
			staticPath: lang ? [lang, ...segments] : segments,
			pathname: joinPathname(lang ?? "", basePath, ...segments)
		};
	}
	function imagePathToSlugs(segs) {
		if (segs.length === 0) return segs;
		const slugs = [...segs];
		slugs[slugs.length - 1] = slugs[slugs.length - 1].replace(/\.webp$/, "");
		if (slugs.length === 1 && slugs[0] === "index") slugs.pop();
		return slugs;
	}
	return {
		name: "core:takumi",
		init() {
			const renderMode = this.mode === "default" ? "static" : this.mode;
			basePath = options.basePath ?? (renderMode === "dynamic" ? "/_takumi" : "/");
			this.interceptPageMeta(({ page, next }) => {
				const pathname = slugsToImagePath(page.slugs, page.locale).pathname;
				return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
					next(),
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
						property: "og:image",
						content: this.siteConfig.baseUrl ? new URL(pathname, this.siteConfig.baseUrl).href : pathname
					}),
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
						property: "og:image:width",
						content: `${width}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
						property: "og:image:height",
						content: `${height}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
						property: "twitter:card",
						content: "summary_large_image"
					})
				] });
			});
		},
		async createPages({ createApiIsomorphic }) {
			createApiIsomorphic({
				render: this.mode === "default" ? "static" : this.mode,
				path: joinPathname(this.i18nConfig ? "[lang]" : "", basePath, "[...slugs]"),
				staticPaths: (await this.getLoader()).getPages().map((page) => slugsToImagePath(page.slugs, page.locale).staticPath),
				handler: async (_, { params }) => {
					const page = (await this.getLoader()).getPage(imagePathToSlugs(params.slugs), params.lang);
					if (!page) unstable_notFound();
					const { node, options } = await generate.call(this, page);
					return new ImageResponse(node, {
						width,
						height,
						...options,
						format: "webp"
					});
				}
			});
		}
	};
}
function generateDefault({ site, title, description }) {
	const primaryColor = "rgba(255,150,255,0.3)";
	const primaryTextColor = "rgb(255,150,255)";
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
		style: {
			display: "flex",
			flexDirection: "column",
			width: "100%",
			height: "100%",
			color: "white",
			padding: "4rem",
			backgroundColor: "#0c0c0c",
			borderBottom: `18px solid ${primaryColor}`
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
				style: {
					fontWeight: 800,
					fontSize: "82px",
					margin: 0
				},
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
				style: {
					fontSize: "52px",
					color: "rgba(240,240,240,0.8)",
					margin: 0,
					marginTop: "16px",
					paddingBottom: "28px",
					borderBottom: `10px dashed ${primaryColor}`
				},
				children: description
			}),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
				style: {
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
					gap: "20px",
					marginTop: "auto",
					color: primaryTextColor
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("svg", {
					xmlns: "http://www.w3.org/2000/svg",
					width: "56",
					height: "56",
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "2",
					strokeLinecap: "round",
					strokeLinejoin: "round",
					className: "lucide lucide-book-icon lucide-book",
					children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("circle", {
						cx: "12",
						cy: "12",
						r: "11",
						stroke: primaryTextColor,
						strokeWidth: "2"
					})
				}), site && /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
					style: {
						fontSize: "56px",
						fontWeight: 600,
						margin: 0
					},
					children: site
				})]
			})
		]
	});
}
//#endregion
export { takumiPlugin as t };
