import * as Joi from "@hapi/joi";
import * as commonjs from "@rollup/plugin-commonjs";
import * as nodeResolve from "@rollup/plugin-node-resolve";
import * as replace from "@rollup/plugin-replace";
import { generate } from "escodegen";
import { readFileSync, unlinkSync, writeFileSync } from "fs";
import { rollup } from "rollup";
import * as babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";
import * as toAst from "to-ast";
import IApi from "./IApi";
import IOptions from "./IOptions";

class GridsomePluginServiceWorker {
	public constructor(api: IApi, options: IOptions) {
		api.beforeBuild(async () => {
			/* tslint:disable:no-console */
			console.time("gridsome-plugin-service-worker");
			/* tslint:enable:no-console */

			const strategy = Joi.object({
				cacheName: Joi.string().required(),
				routes: [Joi.array()
					.items(
						Joi.any()
					)
					.required(),
			});

			const { error } = Joi.object({
				cacheFirst: strategy,
				cacheOnly: strategy,
				networkFirst: strategy,
				networkOnly: strategy,
				precachedRoutes: Joi.array().items(Joi.string()).required(),
				staleWhileRevalidate: strategy,
			})
				.required()
				.validate(options);

			if (error instanceof Error) {
				/* tslint:disable:no-console */
				console.log(`gridsome-plugin-service-worker: ${error.message}`);
				console.timeEnd("gridsome-plugin-service-worker");
				/* tslint:enable:no-console */

				return;
			}

			let serviceWorkerContent = readFileSync(
				`${__dirname}/service-worker.js`
			).toString();

			if (options.precachedRoutes.length > 0) {
				const routesCode = generate(toAst(options.precachedRoutes));
				const code = `precacheAndRoute(${routesCode})`;

				serviceWorkerContent += code;
			}

			if (options.staleWhileRevalidate.routes.length > 0) {
				let code = `\nconst staleWhileRevalidate = new StaleWhileRevalidate({
	cacheName: ${JSON.stringify(options.staleWhileRevalidate.cacheName)}
});`;

				for (const route of options.staleWhileRevalidate.routes) {
					const routeCode = generate(toAst(route));

					code += `\nregisterRoute(
						({url}) => {
							if (url.pathname === "/assets/js/service-worker.js" || url.pathname === "/service-worker.js") {
								return false;
							} else if (typeof ${routeCode} === "string") {
								return url.pathname === ${routeCode};
							} else if (${routeCode} instanceof RegExp) {
								return ${routeCode}.test(url.pathname);
							} else {
								return false;
							}
						},
						staleWhileRevalidate
					);`;
				}

				serviceWorkerContent += code;
			}

			if (options.networkOnly.routes.length > 0) {
				let code = `\nconst networkOnly = new NetworkOnly({
	cacheName: ${JSON.stringify(options.networkOnly.cacheName)}
});`;

				for (const route of options.networkOnly.routes) {
					const routeCode = generate(toAst(route));

					code += `\nregisterRoute(
						({url}) => {
							if (url.pathname === "/assets/js/service-worker.js" || url.pathname === "/service-worker.js") {
								return false;
							} else if (typeof ${routeCode} === "string") {
								return url.pathname === ${routeCode};
							} else if (${routeCode} instanceof RegExp) {
								return ${routeCode}.test(url.pathname);
							} else {
								return false;
							}
						}, 
						networkOnly
					);`;
				}

				serviceWorkerContent += code;
			}

			if (options.networkFirst.routes.length > 0) {
				let code = `
		  const networkFirst = new NetworkFirst({
	cacheName: ${JSON.stringify(options.networkFirst.cacheName)}
});`;

				for (const route of options.networkFirst.routes) {
					const routeCode = generate(toAst(route));

					code += `registerRoute(
						({url}) => {
							if (url.pathname === "/assets/js/service-worker.js" || url.pathname === "/service-worker.js") {
								return false;
							} else if (typeof ${routeCode} === "string") {
								return url.pathname === ${routeCode};
							} else if (${routeCode} instanceof RegExp) {
								return ${routeCode}.test(url.pathname);
							} else {
								return false;
							}
						}, 
						networkFirst
					);`;
				}

				serviceWorkerContent += `${code}`;
			}

			if (options.cacheOnly.routes.length > 0) {
				let code = `\nconst cacheOnly = new CacheOnly({
	cacheName: ${JSON.stringify(options.cacheOnly.cacheName)}
});`;

				for (const route of options.cacheOnly.routes) {
					const routeCode = generate(toAst(route));

					code += `\nregisterRoute(
						({url}) => {
							if (url.pathname === "/assets/js/service-worker.js" || url.pathname === "/service-worker.js") {
								return false;
							} else if (typeof ${routeCode} === "string") {
								return url.pathname === ${routeCode};
							} else if (${routeCode} instanceof RegExp) {
								return ${routeCode}.test(url.pathname);
							} else {
								return false;
							}
						}, 
						cacheOnly
					);`;
				}

				serviceWorkerContent += code;
			}

			if (options.cacheFirst.routes.length > 0) {
				let code = `
const cacheFirst = new CacheFirst({
	cacheName: ${JSON.stringify(options.cacheFirst.cacheName)}
});`;

				for (const route of options.cacheFirst.routes) {
					const routeCode = generate(toAst(route));

					code += `registerRoute(
						({url}) => {
							if (url.pathname === "/assets/js/service-worker.js" || url.pathname === "/service-worker.js") {
								return false;
							} else if (typeof ${routeCode} === "string") {
								return url.pathname === ${routeCode};
							} else if (${routeCode} instanceof RegExp) {
								return ${routeCode}.test(url.pathname);
							} else {
								return false;
							}
						}, 
						cacheFirst
					);`;
				}

				serviceWorkerContent += `${code}`;
			}

			writeFileSync(
				"./static/service-worker.temp.js",
				serviceWorkerContent
			);

			const serviceWorkerBundle = await rollup({
				input: "./static/service-worker.temp.js",
				plugins: [
					nodeResolve(),
					commonjs(),
					babel({
						exclude: "node_modules/**",
						presets: ["@babel/preset-env"],
					}),
					replace({
						"process.env.NODE_ENV": JSON.stringify("production"),
					}),
					terser(),
				],
			});

			await serviceWorkerBundle.write({
				format: "iife",
				file: "./static/service-worker.js",
			});

			unlinkSync("./static/service-worker.temp.js");

			/* tslint:disable:no-console */
			console.timeEnd("gridsome-plugin-service-worker");
			/* tslint:enable:no-console */
		});
	}

	public static defaultOptions(): IOptions {
		return {
			cacheFirst: {
				cacheName: "cf-v1",
				routes: [],
			},
			cacheOnly: {
				cacheName: "co-v1",
				routes: [],
			},
			networkFirst: {
				cacheName: "nf-v1",
				routes: [],
			},
			networkOnly: {
				cacheName: "no-v1",
				routes: [],
			},
			precachedRoutes: [],
			staleWhileRevalidate: {
				cacheName: "swr-v1",
				routes: [],
			},
		};
	}
}

export = GridsomePluginServiceWorker;
