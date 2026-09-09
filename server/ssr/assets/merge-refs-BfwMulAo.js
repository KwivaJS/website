//#region node_modules/fumadocs-ui/dist/utils/merge-refs.js
function mergeRefs(...refs) {
	return (value) => {
		refs.forEach((ref) => {
			if (typeof ref === "function") ref(value);
			else if (ref) ref.current = value;
		});
	};
}
//#endregion
export { mergeRefs as t };
