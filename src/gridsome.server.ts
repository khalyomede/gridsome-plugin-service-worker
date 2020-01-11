import * as commonjs from "@rollup/plugin-commonjs";
import * as nodeResolve from "@rollup/plugin-node-resolve";
import * as replace from "@rollup/plugin-replace";
import { generate } from "escodegen";
import { readFileSync, unlinkSync, writeFileSync } from "fs";
import { copy } from "fs-extra";
import { rollup } from "rollup";
import * as babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";
import * as toAst from "to-ast";
import IApi from "./IApi";
import IOptions from "./IOptions";

class GridsomePluginServiceWorker {
	private readonly _options: IOptions;
	private _serviceWorkerContent: string;

	public constructor(api: IApi, options: IOptions) {
		this._options = options;
		this._serviceWorkerContent = "";

		api.beforeBuild(async () => {
			/* tslint:disable:no-console */
			console.time("gridsome-plugin-service-worker");
			/* tslint:enable:no-console */

			try {
				this._checkOptions();
			} catch (exception) {
				if (exception instanceof TypeError) {
					/* tslint:disable:no-console */
					console.error(
						`gridsome-plugin-service-worker: ${exception.message}`
					);
					console.timeEnd("gridsome-plugin-service-worker");
					/* tslint:enable:no-console */
				} else {
					throw exception;
				}

				return;
			}

			this._setInitialServiceWorkerContent();
			this._addPrecachedRoutesToServiceWorkerContent();
			this._addCacheFirstToServiceWorkerContent();
			this._addCacheOnlyToServiceWorkerContent();
			this._addNetworkFirstToServiceWorkerContent();
			this._addNetworkOnlyToServiceWorkerContent();
			this._addStaleWhileRevalidateToServiceWorkerContent();
			this._saveTemporaryServiceWorkerContent();

			await Promise.all([
				GridsomePluginServiceWorker._transpileAndSaveServiceWorker(),
				GridsomePluginServiceWorker._copyAndSaveServiceWorkerRegistration(),
			]);

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

	private _setInitialServiceWorkerContent(): void {
		this._serviceWorkerContent = readFileSync(
			`${__dirname}/service-worker.js`
		).toString();
	}

	private _addPrecachedRoutesToServiceWorkerContent(): void {
		if (
			"precachedRoutes" in this._options &&
			Array.isArray(this._options.precachedRoutes) &&
			this._options.precachedRoutes.length > 0
		) {
			const routesCode = generate(toAst(this._options.precachedRoutes));
			const code = `precacheAndRoute(${routesCode})`;

			this._serviceWorkerContent += code;
		}
	}

	private _addCacheFirstToServiceWorkerContent(): void {
		if (
			"cacheFirst" in this._options &&
			this._options.cacheFirst instanceof Object &&
			this._options.cacheFirst.routes.length > 0
		) {
			let code = `
			const cacheFirst = new CacheFirst({
				cacheName: ${JSON.stringify(this._options.cacheFirst.cacheName)}
			});`;

			for (const route of this._options.cacheFirst.routes) {
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

			this._serviceWorkerContent += `${code}`;
		}
	}

	private _addCacheOnlyToServiceWorkerContent(): void {
		if (
			"cacheOnly" in this._options &&
			this._options.cacheOnly instanceof Object &&
			this._options.cacheOnly.routes.length > 0
		) {
			let code = `\nconst cacheOnly = new CacheOnly({
				cacheName: ${JSON.stringify(this._options.cacheOnly.cacheName)}
			});`;

			for (const route of this._options.cacheOnly.routes) {
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

			this._serviceWorkerContent += code;
		}
	}

	private _addNetworkFirstToServiceWorkerContent(): void {
		if (
			"networkFirst" in this._options &&
			this._options.networkFirst instanceof Object &&
			this._options.networkFirst.routes.length > 0
		) {
			let code = `
					  const networkFirst = new NetworkFirst({
				cacheName: ${JSON.stringify(this._options.networkFirst.cacheName)}
			});`;

			for (const route of this._options.networkFirst.routes) {
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

			this._serviceWorkerContent += `${code}`;
		}
	}

	private _addNetworkOnlyToServiceWorkerContent(): void {
		if (
			"networkOnly" in this._options &&
			this._options.networkOnly instanceof Object &&
			this._options.networkOnly.routes.length > 0
		) {
			let code = `\nconst networkOnly = new NetworkOnly({
				cacheName: ${JSON.stringify(this._options.networkOnly.cacheName)}
			});`;

			for (const route of this._options.networkOnly.routes) {
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

			this._serviceWorkerContent += code;
		}
	}

	private _addStaleWhileRevalidateToServiceWorkerContent(): void {
		if (
			"staleWhileRevalidate" in this._options &&
			this._options.staleWhileRevalidate instanceof Object &&
			this._options.staleWhileRevalidate.routes.length > 0
		) {
			let code = `\nconst staleWhileRevalidate = new StaleWhileRevalidate({
				cacheName: ${JSON.stringify(this._options.staleWhileRevalidate.cacheName)}
			});`;

			for (const route of this._options.staleWhileRevalidate.routes) {
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

			this._serviceWorkerContent += code;
		}
	}

	private _saveTemporaryServiceWorkerContent(): void {
		writeFileSync(
			"./static/service-worker.temp.js",
			this._serviceWorkerContent
		);
	}

	private static async _transpileAndSaveServiceWorker(): Promise<void> {
		const serviceWorkerBundle = await rollup({
			input: "./static/service-worker.temp.js",
			plugins: [
				nodeResolve(),
				commonjs(),
				babel({
					exclude: "node_modules/**",
					presets: ["@babel/preset-env"],
					runtimeHelpers: true,
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
	}

	private static async _copyAndSaveServiceWorkerRegistration(): Promise<
		void
	> {
		await copy(
			`${__dirname}/register-service-worker.js`,
			"./static/assets/js/service-worker.js"
		);
	}

	private _throwIfOptionIsNotAStrategy(optionName: string): void {
		if (optionName in this._options) {
			if (!(this._options[optionName] instanceof Object)) {
				throw new TypeError(`"${optionName}" must be an object`);
			}

			if (!("cacheName" in this._options[optionName])) {
				throw new TypeError(
					`"${optionName}.cacheName" must be present`
				);
			}

			if (!("routes" in this._options[optionName])) {
				throw new TypeError(`"${optionName}.routes" must be present`);
			}

			if (typeof this._options[optionName].cacheName !== "string") {
				throw new TypeError(
					`"${optionName}.cacheName" must be a string`
				);
			}

			if (!Array.isArray(this._options[optionName].routes)) {
				throw new TypeError(`"${optionName}.routes" must be an array`);
			}

			for (
				let index = 0;
				index < this._options[optionName].routes.length;
				index++
			) {
				const route = this._options[optionName].routes[index];

				if (typeof route !== "string" && !(route instanceof RegExp)) {
					throw new TypeError(
						`"${optionName}.routes[${index}]" must be a string or a regexp`
					);
				}
			}
		}
	}

	private _checkOptions(): void {
		this._checkOptionCacheFirst();
		this._checkOptionCacheOnly();
		this._checkOptionNetworkFirst();
		this._checkOptionNetworkOnly();
		this._checkOptionPrecachedRoutes();
		this._checkOptionStaleWhileRevalidate();
	}

	private _checkOptionCacheFirst(): void {
		this._throwIfOptionIsNotAStrategy("cacheFirst");
	}

	private _checkOptionCacheOnly(): void {
		this._throwIfOptionIsNotAStrategy("cacheOnly");
	}

	private _checkOptionNetworkFirst(): void {
		this._throwIfOptionIsNotAStrategy("networkFirst");
	}

	private _checkOptionNetworkOnly(): void {
		this._throwIfOptionIsNotAStrategy("networkOnly");
	}

	private _checkOptionPrecachedRoutes(): void {
		if ("precachedRoutes" in this._options) {
			if (!Array.isArray(this._options.precachedRoutes)) {
				throw new TypeError(`"precachedRoutes" must be an array`);
			}

			for (
				let index = 0;
				index < this._options.precachedRoutes.length;
				index++
			) {
				const route = this._options.precachedRoutes[index];

				if (typeof route !== "string") {
					throw new TypeError(
						`"precachedRoutes[${index}]" must be a string`
					);
				}
			}
		}
	}

	private _checkOptionStaleWhileRevalidate(): void {
		this._throwIfOptionIsNotAStrategy("staleWhileRevalidate");
	}
}

export = GridsomePluginServiceWorker;
