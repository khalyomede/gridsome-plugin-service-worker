export default (Vue, options, { head }): void => {
	if (process.isServer) {
		head.script.push({
			type: "text/javascript",
			src: "/assets/js/service-worker.js",
			async: true,
		});
	}
};
