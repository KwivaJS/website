import { i as __toESM } from "./rolldown-runtime-B4iAMlE-.js";
import { t as require_jsx_runtime } from "./jsx-runtime-BqLYtsoi.js";
import { t as require_react } from "./react-SLAb4Nsi.js";
import { t as cn } from "./dist-UQZjX_nd.js";
import { n as cva, t as buttonVariants } from "./button-Cpca6tPg.js";
import { i as shift, o as useFloating, r as offset, s as autoUpdate, t as flip } from "./floating-ui.react-dom-DpBhZTYb.js";
import { t as createLucideIcon } from "./createLucideIcon-CUS0Rvh9.js";
import { c as useTranslations, i as usePathname } from "./framework-BVFfi5Qn.js";
import { An as clone, Bt as $ZodObject, En as $constructor, Fn as installLazyProp, Ht as $ZodOptional, Mn as extend$1, Un as own, Vn as normalizeParams, W as _string, Xt as $ZodType, bn as safeParse, i as _boolean, qt as $ZodString, st as $ZodBoolean, vn as parse, xn as safeParseAsync, yn as parseAsync, yt as $ZodEnum } from "./api-BiIWyC3N.js";
import { n as CollapsibleContent, t as Collapsible } from "./collapsible-BTQIwl1c.js";
//#region node_modules/lucide-react/dist/esm/icons/corner-down-right.mjs
/**
* @license lucide-react v1.43.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var __iconData$2 = {
	name: "corner-down-right",
	size: 24,
	node: [["path", {
		d: "m15 10 5 5-5 5",
		key: "qqa56n"
	}], ["path", {
		d: "M4 4v7a4 4 0 0 0 4 4h12",
		key: "z08zvw"
	}]]
};
__iconData$2.node;
var CornerDownRight = createLucideIcon(__iconData$2);
//#endregion
//#region node_modules/lucide-react/dist/esm/icons/thumbs-down.mjs
/**
* @license lucide-react v1.43.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var __iconData$1 = {
	name: "thumbs-down",
	size: 24,
	node: [["path", {
		d: "M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z",
		key: "m61m77"
	}], ["path", {
		d: "M17 14V2",
		key: "8ymqnk"
	}]]
};
__iconData$1.node;
var ThumbsDown = createLucideIcon(__iconData$1);
//#endregion
//#region node_modules/lucide-react/dist/esm/icons/thumbs-up.mjs
/**
* @license lucide-react v1.43.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var __iconData = {
	name: "thumbs-up",
	size: 24,
	node: [["path", {
		d: "M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z",
		key: "emmmcr"
	}], ["path", {
		d: "M7 10v12",
		key: "1qc93n"
	}]]
};
__iconData.node;
var ThumbsUp = createLucideIcon(__iconData);
//#endregion
//#region node_modules/zod/v4/mini/schemas.js
var ZodMiniType = /*@__PURE__*/ $constructor("ZodMiniType", (inst, def) => {
	if (!inst._zod) throw new Error("Uninitialized schema in ZodMiniType.");
	$ZodType.init(inst, def);
	inst.def = def;
	inst.type = def.type;
}, {
	get with() {
		return this.check;
	},
	set with(value) {
		own(this, "with", value);
	},
	parse(data, params) {
		return parse(this, data, params, { callee: this.parse });
	},
	parseAsync(data, params) {
		return parseAsync(this, data, params, { callee: this.parseAsync });
	},
	safeParse(data, params) {
		return safeParse(this, data, params);
	},
	safeParseAsync(data, params) {
		return safeParseAsync(this, data, params);
	},
	check(...checks) {
		const def = this.def;
		return this.clone({
			...def,
			checks: [...def.checks ?? [], ...checks.map((ch) => typeof ch === "function" ? { _zod: {
				check: ch,
				def: { check: "custom" },
				onattach: []
			} } : ch)]
		}, { parent: true });
	},
	clone(_def, params) {
		return clone(this, _def, params);
	},
	brand() {
		return this;
	},
	register(reg, meta) {
		reg.add(this, meta);
		return this;
	},
	apply(fn, ...args) {
		return args.length === 0 ? fn(this) : fn(this, ...args);
	}
});
var ZodMiniString = /*@__PURE__*/ $constructor("ZodMiniString", (inst, def) => {
	$ZodString.init(inst, def);
	ZodMiniType.init(inst, def);
});
// @__NO_SIDE_EFFECTS__
function string(params) {
	return _string(ZodMiniString, params);
}
var ZodMiniBoolean = /*@__PURE__*/ $constructor("ZodMiniBoolean", (inst, def) => {
	$ZodBoolean.init(inst, def);
	ZodMiniType.init(inst, def);
});
// @__NO_SIDE_EFFECTS__
function boolean(params) {
	return _boolean(ZodMiniBoolean, params);
}
var ZodMiniObject = /*@__PURE__*/ $constructor("ZodMiniObject", (inst, def) => {
	$ZodObject.init(inst, def);
	ZodMiniType.init(inst, def);
	installLazyProp(inst, "shape", (self) => self._zod.def.shape, false);
});
// @__NO_SIDE_EFFECTS__
function object(shape, params) {
	return new ZodMiniObject({
		type: "object",
		shape: shape ?? {},
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function extend(schema, shape) {
	return extend$1(schema, shape);
}
var ZodMiniEnum = /*@__PURE__*/ $constructor("ZodMiniEnum", (inst, def) => {
	$ZodEnum.init(inst, def);
	ZodMiniType.init(inst, def);
	inst.options = Object.values(def.entries);
});
// @__NO_SIDE_EFFECTS__
function _enum(values, params) {
	return new ZodMiniEnum({
		type: "enum",
		entries: Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values,
		...normalizeParams(params)
	});
}
var ZodMiniOptional = /*@__PURE__*/ $constructor("ZodMiniOptional", (inst, def) => {
	$ZodOptional.init(inst, def);
	ZodMiniType.init(inst, def);
});
// @__NO_SIDE_EFFECTS__
function optional(innerType) {
	return new ZodMiniOptional({
		type: "optional",
		innerType
	});
}
//#endregion
//#region node_modules/@fumapress/feedback/dist/components/feedback/schema.mjs
var blockFeedback = /* @__PURE__ */ object({
	/** full URL of page where fired */
	url: /* @__PURE__ */ string(),
	blockId: /* @__PURE__ */ string(),
	message: /* @__PURE__ */ string(),
	/** the referenced text of block */
	blockBody: /* @__PURE__ */ string()
});
var pageFeedback = /* @__PURE__ */ object({
	opinion: /* @__PURE__ */ _enum(["good", "bad"]),
	/** full URL of page where fired */
	url: /* @__PURE__ */ string(),
	message: /* @__PURE__ */ string()
});
var actionResponse = /* @__PURE__ */ object({
	githubUrl: /* @__PURE__ */ optional(/* @__PURE__ */ string()),
	emailSent: /* @__PURE__ */ optional(/* @__PURE__ */ boolean())
});
//#endregion
//#region node_modules/@fumapress/feedback/dist/components/feedback/client.mjs
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime(), 1);
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var rateButtonVariants = cva("inline-flex items-center gap-2 px-3 py-2 rounded-full font-medium border text-sm [&_svg]:size-4 disabled:cursor-not-allowed", { variants: { active: {
	true: "bg-fd-accent text-fd-accent-foreground [&_svg]:fill-current",
	false: "text-fd-muted-foreground"
} } });
var pageFeedbackResult = /* @__PURE__ */ extend(pageFeedback, { response: actionResponse });
var blockFeedbackResult = /* @__PURE__ */ extend(blockFeedback, { response: actionResponse });
/**
* A feedback component to be attached at the end of page
*/
function Feedback({ onSendAction }) {
	const t = useTranslations({ note: "feedback" });
	const { previous, setPrevious } = useSubmissionStorage(usePathname(), (v) => {
		const result = pageFeedbackResult.safeParse(v);
		return result.success ? result.data : null;
	});
	const [opinion, setOpinion] = (0, import_react.useState)(null);
	const [message, setMessage] = (0, import_react.useState)("");
	const [isPending, startTransition] = (0, import_react.useTransition)();
	function submit(e) {
		if (opinion == null) return;
		startTransition(async () => {
			const feedback = {
				url: location.href,
				opinion,
				message
			};
			const response = await onSendAction(feedback);
			setPrevious({
				response,
				...feedback
			});
			setMessage("");
			setOpinion(null);
		});
		e?.preventDefault();
	}
	const activeOpinion = previous?.opinion ?? opinion;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Collapsible, {
		open: opinion !== null || previous !== null,
		onOpenChange: (v) => {
			if (!v) setOpinion(null);
		},
		className: "border-y py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-row items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium pe-2",
					children: t("How is this guide?")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					disabled: previous !== null,
					className: cn(rateButtonVariants({ active: activeOpinion === "good" })),
					onClick: () => {
						setOpinion("good");
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, {}), t("Good")]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					disabled: previous !== null,
					className: cn(rateButtonVariants({ active: activeOpinion === "bad" })),
					onClick: () => {
						setOpinion("bad");
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsDown, {}), t("Bad")]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleContent, {
			className: "mt-3",
			children: previous ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-3 py-6 flex flex-col items-center gap-3 bg-fd-card text-fd-muted-foreground text-sm text-center rounded-xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("Thank you for your feedback!") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-row items-center gap-2",
					children: [previous.response?.githubUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: previous.response.githubUrl,
						rel: "noreferrer noopener",
						target: "_blank",
						className: cn(buttonVariants({ color: "primary" }), "text-xs"),
						children: t("View on GitHub")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: cn(buttonVariants({ color: "secondary" }), "text-xs"),
						onClick: () => {
							setOpinion(previous.opinion);
							setPrevious(null);
						},
						children: t("Submit Again")
					})]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-3",
				onSubmit: submit,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					autoFocus: true,
					required: true,
					value: message,
					onChange: (e) => setMessage(e.target.value),
					className: "border rounded-lg bg-fd-secondary text-fd-secondary-foreground p-3 resize-none focus-visible:outline-none placeholder:text-fd-muted-foreground",
					placeholder: t("Leave your feedback...", { note: "input placeholder" }),
					onKeyDown: (e) => {
						if (!e.shiftKey && e.key === "Enter") submit(e);
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					className: cn(buttonVariants({ color: "outline" }), "w-fit px-3"),
					disabled: isPending,
					children: t("Submit")
				})]
			})
		})]
	});
}
/**
* A feedback component for each content block in page, should be used with `remark-feedback-block`.
*
* See https://fumadocs.dev/docs/integrations/feedback.
*/
function FeedbackText({ onSendAction, children }) {
	const t = useTranslations({ note: "feedback popover" });
	const [popup, _setPopup] = (0, import_react.useState)(null);
	const containerRef = (0, import_react.useRef)(null);
	const { refs, floatingStyles } = useFloating({
		open: popup !== null,
		placement: "bottom",
		middleware: [
			offset(6),
			flip(),
			shift({ padding: 8 })
		],
		whileElementsMounted: autoUpdate
	});
	function expandPopup() {
		if (popup?.mode !== "tooltip") return;
		const highlight = new Highlight(popup.range);
		CSS.highlights.set("fd-feedback-text", highlight);
		_setPopup({
			...popup,
			mode: "expanded"
		});
	}
	function closePopup() {
		if (popup?.mode === "expanded") CSS.highlights.delete("fd-feedback-text");
		_setPopup(null);
	}
	const updateSelectionPopover = (0, import_react.useEffectEvent)(() => {
		if (popup && popup.mode === "expanded") return;
		const container = containerRef.current;
		const selection = window.getSelection();
		if (!container || !selection || selection.isCollapsed || selection.rangeCount === 0) {
			closePopup();
			return;
		}
		const range = selection.getRangeAt(0).cloneRange();
		if (!container.contains(range.commonAncestorContainer)) {
			closePopup();
			return;
		}
		const selectionText = selection.toString().trim();
		if (selectionText.length === 0 || selectionText.includes("\n")) {
			closePopup();
			return;
		}
		const blockId = (range.startContainer instanceof Element ? range.startContainer : range.startContainer.parentElement)?.closest("[data-block=\"feedback\"]")?.id;
		if (!blockId) {
			closePopup();
			return;
		}
		refs.setReference({
			getBoundingClientRect() {
				return range.getBoundingClientRect();
			},
			contextElement: container
		});
		_setPopup({
			mode: "tooltip",
			range,
			selection: selectionText,
			blockId
		});
	});
	const closeOnEscape = (0, import_react.useEffectEvent)((event) => {
		if (popup === null) return;
		if (event.key === "Escape") closePopup();
	});
	const closeOnPointerDown = (0, import_react.useEffectEvent)((event) => {
		const target = event.target;
		if (popup === null || !(target instanceof Node)) return;
		if (refs.floating.current?.contains(target) || popup.mode === "tooltip" && containerRef.current?.contains(target)) return;
		closePopup();
	});
	(0, import_react.useEffect)(() => {
		let frame = null;
		function scheduleSelectionPopover() {
			if (frame !== null) window.cancelAnimationFrame(frame);
			frame = window.requestAnimationFrame(() => {
				frame = null;
				updateSelectionPopover();
			});
		}
		document.addEventListener("selectionchange", scheduleSelectionPopover);
		document.addEventListener("keydown", closeOnEscape);
		document.addEventListener("pointerdown", closeOnPointerDown);
		return () => {
			document.removeEventListener("keydown", closeOnEscape);
			document.removeEventListener("pointerdown", closeOnPointerDown);
			document.removeEventListener("selectionchange", scheduleSelectionPopover);
			if (frame !== null) window.cancelAnimationFrame(frame);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: containerRef,
		className: "prose-no-margin [&_::highlight(fd-feedback-text)]:bg-fd-primary [&_::highlight(fd-feedback-text)]:text-fd-primary-foreground",
		children
	}), popup && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: refs.setFloating,
		className: cn("not-prose z-40 text-sm bg-fd-popover text-fd-popover-foreground border overflow-hidden shadow-lg rounded-xl w-30 h-9.5 box-content transition-[width,height]", popup.mode === "expanded" ? "w-[300px] h-32 max-w-[98vw]" : "select-none"),
		style: floatingStyles,
		children: popup.mode === "tooltip" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "w-30 h-9.5 p-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: cn(buttonVariants({
					variant: "ghost",
					size: "sm"
				}), "size-full gap-1.5"),
				onClick: expandPopup,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerDownRight, { className: "size-4 text-fd-muted-foreground" }), t("Feedback")]
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeedbackTextForm, {
			blockId: popup.blockId,
			selection: popup.selection,
			onSendAction,
			onClose: closePopup,
			container: { className: "p-2 w-[300px] h-32 max-w-[98vw] animate-fd-fade-in" }
		})
	})] });
}
function FeedbackTextForm({ blockId, selection, onSendAction, onClose, container }) {
	const t = useTranslations();
	const tFeedback = useTranslations({ note: "feedback" });
	const { previous, setPrevious } = useSubmissionStorage(`${usePathname()}-${blockId}`, (v) => {
		const result = blockFeedbackResult.safeParse(v);
		if (result.success) return result.data;
		return null;
	});
	const [message, setMessage] = (0, import_react.useState)("");
	const [isPending, startTransition] = (0, import_react.useTransition)();
	function submit(e) {
		startTransition(async () => {
			const feedback = {
				blockId,
				blockBody: selection,
				url: location.href,
				message
			};
			const response = await onSendAction(feedback);
			setPrevious({
				response,
				...feedback
			});
			setMessage("");
		});
		e?.preventDefault();
	}
	if (previous) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		...container,
		className: cn("flex flex-col items-center justify-center gap-2 text-fd-muted-foreground text-center", container.className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("Thank you for your feedback!", { note: "feedback" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-row items-center gap-2",
			children: [previous.response?.githubUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: previous.response.githubUrl,
				rel: "noreferrer noopener",
				target: "_blank",
				className: cn(buttonVariants({ color: "primary" }), "text-xs"),
				children: t("View on GitHub", { note: "feedback" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: cn(buttonVariants({ color: "secondary" }), "text-xs"),
				onClick: () => {
					setPrevious(null);
				},
				children: t("Submit Again", { note: "feedback" })
			})]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		...container,
		className: cn("flex flex-col gap-2", container.className),
		onSubmit: submit,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
			autoFocus: true,
			required: true,
			value: message,
			onChange: (e) => setMessage(e.target.value),
			className: "border rounded-lg bg-fd-secondary text-fd-secondary-foreground p-3 resize-none focus-visible:outline-none placeholder:text-fd-muted-foreground",
			placeholder: tFeedback("Leave your feedback...", { note: "input placeholder" }),
			onKeyDown: (e) => {
				if (!e.shiftKey && e.key === "Enter") submit(e);
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-2 gap-2 mt-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "submit",
				className: cn(buttonVariants({
					variant: "primary",
					size: "sm"
				}), "gap-1.5"),
				disabled: isPending,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerDownRight, { className: "size-4" }), t("Submit", { note: "feedback" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: cn(buttonVariants({
					variant: "secondary",
					size: "sm"
				}), "gap-1.5"),
				disabled: isPending,
				onClick: onClose,
				children: t("Close", { note: "feedback popover" })
			})]
		})]
	});
}
function useSubmissionStorage(key, validate) {
	const storageKey = `docs-feedback-${key}`;
	const [value, setValue] = (0, import_react.useState)(null);
	const validateCallback = (0, import_react.useEffectEvent)(validate);
	(0, import_react.useEffect)(() => {
		const item = localStorage.getItem(storageKey);
		if (item === null) return;
		const validated = validateCallback(JSON.parse(item));
		if (validated !== null) setValue(validated);
	}, [storageKey]);
	return {
		previous: value,
		setPrevious(result) {
			if (result) localStorage.setItem(storageKey, JSON.stringify(result));
			else localStorage.removeItem(storageKey);
			setValue(result);
		}
	};
}
//#endregion
//#region \0virtual:vite-rsc/client-references/group/facade:node_modules/@fumapress/feedback/dist/components/feedback/client.mjs
var export_143db4d99239 = {
	Feedback,
	FeedbackText
};
//#endregion
export { export_143db4d99239 };
