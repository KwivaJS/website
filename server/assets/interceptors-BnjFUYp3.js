//#region node_modules/fumapress/dist/lib/interceptors.js
function renderWithInterceptors(ctx, env, fn, interceptors) {
	function run(i, props) {
		if (interceptors && i < interceptors.length) {
			const interceptor = interceptors[i];
			if (!interceptor) return run(i + 1, props);
			return interceptor.call(ctx, {
				...env,
				props,
				next: (v) => run(i + 1, v)
			});
		}
		return fn(props);
	}
	return (props) => run(0, props);
}
//#endregion
export { renderWithInterceptors as t };
