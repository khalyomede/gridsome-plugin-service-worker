// @ts-ignore
// Ignoring because this method is called by Gridsome.
export default (Vue, options, { head }) => {
	// @ts-ignore
	// Ignoring because this method is called by Gridsome.
	if (process.isServer) {
		const { pathPrefix } = require("../../gridsome.config.js");
		let src =
			(pathPrefix ? pathPrefix : "") + "/assets/js/service-worker.js";

		if (!src.startsWith("/")) {
			src = `/${src}`;
		}

		src = src.replace("//", "/");

		head.script.push({
			type: "text/javascript",
			src,
			async: true,
		});
	}
};
