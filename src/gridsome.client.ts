// @ts-ignore
// Ignoring because this method is called by Gridsome.
export default (Vue, options, { head }): void => {
	// @ts-ignore
	// Ignoring because this method is called by Gridsome.
	if (process.isServer) {
		head.script.push({
			type: "text/javascript",
			src: "/assets/js/service-worker.js",
			async: true,
		});
	}
};
