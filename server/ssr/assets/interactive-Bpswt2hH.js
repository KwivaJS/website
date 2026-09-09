import { i as __toESM } from "./rolldown-runtime-B4iAMlE-.js";
import { t as require_jsx_runtime } from "./jsx-runtime-BqLYtsoi.js";
import { t as require_react } from "./react-SLAb4Nsi.js";
import { t as Check } from "./check-C0qe87e9.js";
import { t as Copy } from "./copy-DYT4UPuF.js";
//#region src/components/home/interactive.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime(), 1);
function Reveal({ children, className = "", delay = 0 }) {
	const ref = (0, import_react.useRef)(null);
	const [shown, setShown] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const el = ref.current;
		if (!el) return;
		if (typeof IntersectionObserver === "undefined") {
			setShown(true);
			return;
		}
		const io = new IntersectionObserver((entries) => {
			if (entries[0]?.isIntersecting) {
				setShown(true);
				io.disconnect();
			}
		}, {
			rootMargin: "0px 0px -6% 0px",
			threshold: .05
		});
		io.observe(el);
		return () => io.disconnect();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		style: shown && delay ? { transitionDelay: `${delay}ms` } : void 0,
		className: `transition-all duration-500 ease-out will-change-transform ${shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"} ${className}`,
		children
	});
}
function CopyButton({ value, label = "copy", variant = "default", className = "" }) {
	const [copied, setCopied] = (0, import_react.useState)(false);
	const onCopy = async () => {
		try {
			await navigator.clipboard.writeText(value);
		} catch {
			const textarea = document.createElement("textarea");
			textarea.value = value;
			textarea.style.position = "fixed";
			textarea.style.opacity = "0";
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			textarea.remove();
		}
		setCopied(true);
		setTimeout(() => setCopied(false), 1600);
	};
	const styles = variant === "inverse" ? "border-white/25 bg-white/10 text-white/85 hover:bg-white/20 hover:text-white" : variant === "ghost" ? "border-transparent bg-transparent text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground" : "border-fd-border bg-fd-secondary/60 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onCopy,
		"aria-label": copied ? "Copied to clipboard" : `Copy ${label}`,
		className: `inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kwiva-500 ${styles} ${className}`,
		children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 text-emerald-500" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }), copied ? "copied" : label]
	});
}
//#endregion
export { Reveal as n, CopyButton as t };
