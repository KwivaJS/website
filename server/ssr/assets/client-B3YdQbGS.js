import { i as __toESM } from "./rolldown-runtime-B4iAMlE-.js";
import { t as require_jsx_runtime } from "./jsx-runtime-BqLYtsoi.js";
import { t as require_react } from "./react-SLAb4Nsi.js";
import { t as Link$1 } from "./link-BAuMaYNz.js";
import { n as Reveal, t as CopyButton } from "./interactive-Bpswt2hH.js";
//#region src/components/home/motion.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime(), 1);
var listeners = /* @__PURE__ */ new Set();
var rafHandle = null;
function flush() {
	rafHandle = null;
	for (const listener of listeners) listener();
}
function schedule() {
	if (rafHandle === null) rafHandle = requestAnimationFrame(flush);
}
function subscribeToScroll(listener) {
	if (typeof window === "undefined") return () => {};
	if (listeners.size === 0) {
		window.addEventListener("scroll", schedule, { passive: true });
		window.addEventListener("resize", schedule, { passive: true });
	}
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
		if (listeners.size === 0) {
			window.removeEventListener("scroll", schedule);
			window.removeEventListener("resize", schedule);
		}
	};
}
function usePrefersReducedMotion() {
	const [reduced, setReduced] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined" || !("matchMedia" in window)) return;
		const query = window.matchMedia("(prefers-reduced-motion: reduce)");
		setReduced(query.matches);
		const onChange = (e) => setReduced(e.matches);
		query.addEventListener("change", onChange);
		return () => query.removeEventListener("change", onChange);
	}, []);
	return reduced;
}
function ScrollRail({ sections }) {
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [activeId, setActiveId] = (0, import_react.useState)(sections[0]?.id ?? "");
	const [tickOffsets, setTickOffsets] = (0, import_react.useState)([]);
	const reducedMotion = usePrefersReducedMotion();
	(0, import_react.useEffect)(() => {
		const measure = () => {
			const max = document.documentElement.scrollHeight - window.innerHeight;
			if (max <= 0) return;
			setTickOffsets(sections.map((s) => {
				const el = document.getElementById(s.id);
				return el ? Math.min(1, Math.max(0, el.offsetTop / max)) : 0;
			}));
		};
		measure();
		window.addEventListener("resize", measure);
		return () => window.removeEventListener("resize", measure);
	}, [sections]);
	(0, import_react.useEffect)(() => {
		const update = () => {
			const max = document.documentElement.scrollHeight - window.innerHeight;
			setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
		};
		update();
		return subscribeToScroll(update);
	}, []);
	(0, import_react.useEffect)(() => {
		if (typeof IntersectionObserver === "undefined") return;
		const isVisible = /* @__PURE__ */ new Map();
		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) isVisible.set(entry.target.id, entry.isIntersecting);
			const current = sections.map((s) => s.id).filter((id) => isVisible.get(id));
			if (current.length > 0) setActiveId(current[current.length - 1]);
		}, {
			rootMargin: "-15% 0px -70% 0px",
			threshold: 0
		});
		for (const s of sections) {
			const el = document.getElementById(s.id);
			if (el) observer.observe(el);
		}
		return () => observer.disconnect();
	}, [sections]);
	const goTo = (id) => {
		document.getElementById(id)?.scrollIntoView({
			behavior: reducedMotion ? "auto" : "smooth",
			block: "start"
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		"aria-label": "Section progress",
		className: "fixed inset-y-0 left-5 z-30 hidden py-28 xl:flex",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "kw-rail-track",
			style: { "--rail-progress": progress },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "kw-rail-fill" }), sections.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => goTo(s.id),
				"data-active": activeId === s.id,
				"aria-current": activeId === s.id ? "true" : void 0,
				"aria-label": s.label,
				className: "kw-rail-tick",
				style: { top: `${(tickOffsets[i] ?? i / Math.max(1, sections.length - 1)) * 100}%` },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "kw-rail-dot",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "kw-rail-tick-label",
					children: s.label
				})]
			}, s.id))]
		})
	});
}
function Parallax({ children, strength = 14, className = "" }) {
	const ref = (0, import_react.useRef)(null);
	const reducedMotion = usePrefersReducedMotion();
	(0, import_react.useEffect)(() => {
		if (reducedMotion) return;
		const el = ref.current;
		if (!el) return;
		const update = () => {
			const rect = el.getBoundingClientRect();
			const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight * strength;
			el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
		};
		update();
		return subscribeToScroll(update);
	}, [reducedMotion, strength]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		"data-parallax": "true",
		"aria-hidden": "true",
		className,
		style: { willChange: "transform" },
		children
	});
}
//#endregion
//#region \0virtual:vite-rsc/client-references/group/shared:node_modules/fumapress/dist/client.js
var export_2dd9a6bf4c04 = { Link: Link$1 };
var export_3596b55eceb0 = {
	CopyButton,
	Reveal
};
var export_bbc501ebc8d1 = {
	Parallax,
	ScrollRail
};
//#endregion
export { export_2dd9a6bf4c04, export_3596b55eceb0, export_bbc501ebc8d1 };
