import babel from "@rollup/plugin-babel";
import * as commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import * as replace from "@rollup/plugin-replace";
import { generate } from "escodegen";
import { readFileSync, unlinkSync, writeFileSync } from "fs";
import { rollup } from "rollup";
import { terser } from "rollup-plugin-terser";
// @ts-ignore
// Ignoring because there is no type package for it.
import * as toAst from "to-ast";
import IApi from "./IApi";
import IOptions from "./IOptions";

class GridsomePluginServiceWorker {
	private readonly _options: IOptions;
	private _serviceWorkerContent: string;
	private _serviceWorkerRegistrationContent: string;
	public readonly ALLOWED_REQUEST_DESTINATION = [
		"audio",
		"audioworklet",
		"document",
		"embed",
		"font",
		"image",
		"manifest",
		"object",
		"paintworklet",
		"report",
		"script",
		"serviceworker",
		"sharedworker",
		"style",
		"track",
		"video",
		"worker",
		"xslt",
	];

	public constructor(api: IApi, options: IOptions) {
		this._options = options;
		this._serviceWorkerContent = "";
		this._serviceWorkerRegistrationContent = "";

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
			this._setServiceWorkerRegistrationContent();
			this._saveTemporaryServiceWorkerRegistrationContent();

			await Promise.all([
				GridsomePluginServiceWorker._transpileAndSaveServiceWorker(),
				GridsomePluginServiceWorker._transpileAndSaveServiceWorkerRegistration(),
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
				fileTypes: [],
			},
			cacheOnly: {
				cacheName: "co-v1",
				routes: [],
				fileTypes: [],
			},
			networkFirst: {
				cacheName: "nf-v1",
				routes: [],
				fileTypes: [],
			},
			networkOnly: {
				cacheName: "no-v1",
				routes: [],
				fileTypes: [],
			},
			precachedRoutes: [],
			staleWhileRevalidate: {
				cacheName: "swr-v1",
				routes: [],
				fileTypes: [],
			},
		};
	}

	private _setServiceWorkerRegistrationContent(): void {
		// @ts-ignore
		// Ignoring because it will be available when used in a project
		const pathPrefix = process?.GRIDSOME?.config?.pathPrefix ?? "/";
		const scope = generate(toAst(pathPrefix));
		let serviceWorkerPath = "/service-worker.js";

		if (pathPrefix) {
			serviceWorkerPath = !pathPrefix.endsWith("/")
				? `${pathPrefix}/service-worker.js`
				: `${pathPrefix}service-worker.js`;
		}

		serviceWorkerPath = generate(toAst(serviceWorkerPath));

		this._serviceWorkerRegistrationContent = `
			import { Workbox } from "workbox-window";

			if ("serviceWorker" in navigator) {
				const workbox = new Workbox(${serviceWorkerPath}, {
					scope: ${scope},
				});

				(async () => await workbox.register())();
			}
		`;
	}

	private _saveTemporaryServiceWorkerRegistrationContent(): void {
		writeFileSync(
			"./static/register-service-worker.temp.js",
			this._serviceWorkerRegistrationContent
		);
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
			(this._options.cacheFirst.routes.length > 0 ||
				this._options.cacheFirst.fileTypes.length > 0)
		) {
			let code = `
			const cacheFirst = new CacheFirst({
				cacheName: ${JSON.stringify(this._options.cacheFirst.cacheName)}
			});`;

			if ("routes" in this._options.cacheFirst) {
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
			}

			if ("fileTypes" in this._options.cacheFirst) {
				const fileTypesCode = generate(
					toAst(this._options.cacheFirst.fileTypes)
				);

				code += `\nregisterRoute(
					({request, url}) => {
						if (url.pathname === "/assets/js/service-worker.js" || url.pathname === "/service-worker.js") {
							return false;
						} else {
							return ${fileTypesCode}.includes(request.destination);
						}
					},
					cacheOnly
				);`;
			}

			this._serviceWorkerContent += `${code}`;
		}
	}

	private _addCacheOnlyToServiceWorkerContent(): void {
		if (
			"cacheOnly" in this._options &&
			this._options.cacheOnly instanceof Object &&
			(this._options.cacheOnly.routes.length > 0 ||
				this._options.cacheOnly.fileTypes.length > 0)
		) {
			let code = `\nconst cacheOnly = new CacheOnly({
				cacheName: ${JSON.stringify(this._options.cacheOnly.cacheName)}
			});`;

			if ("routes" in this._options.cacheOnly) {
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
			}

			if ("fileTypes" in this._options.cacheOnly) {
				const fileTypesCode = generate(
					toAst(this._options.cacheOnly.fileTypes)
				);

				code += `\nregisterRoute(
					({request, url}) => {
						if (url.pathname === "/assets/js/service-worker.js" || url.pathname === "/service-worker.js") {
							return false;
						} else {
							return ${fileTypesCode}.includes(request.destination);
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
			(this._options.networkFirst.routes.length > 0 ||
				this._options.networkFirst.fileTypes.length > 0)
		) {
			let code = `
					  const networkFirst = new NetworkFirst({
				cacheName: ${JSON.stringify(this._options.networkFirst.cacheName)}
			});`;

			if ("routes" in this._options.networkFirst) {
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
			}

			if ("fileTypes" in this._options.networkFirst) {
				const fileTypesCode = generate(
					toAst(this._options.networkFirst.fileTypes)
				);

				code += `\nregisterRoute(
					({request, url}) => {
						if (url.pathname === "/assets/js/service-worker.js" || url.pathname === "/service-worker.js") {
							return false;
						} else {
							return ${fileTypesCode}.includes(request.destination);
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
			(this._options.networkOnly.routes.length > 0 ||
				this._options.networkOnly.fileTypes.length > 0)
		) {
			let code = `\nconst networkOnly = new NetworkOnly({
				cacheName: ${JSON.stringify(this._options.networkOnly.cacheName)}
			});`;

			if ("routes" in this._options.networkOnly) {
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
			}

			if ("fileTypes" in this._options.networkOnly) {
				const fileTypesCode = generate(
					toAst(this._options.networkOnly.fileTypes)
				);

				code += `\nregisterRoute(
					({request, url}) => {
						if (url.pathname === "/assets/js/service-worker.js" || url.pathname === "/service-worker.js") {
							return false;
						} else {
							return ${fileTypesCode}.includes(request.destination);
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
			(this._options.staleWhileRevalidate.routes.length > 0 ||
				this._options.staleWhileRevalidate.fileTypes.length > 0)
		) {
			let code = `\nconst staleWhileRevalidate = new StaleWhileRevalidate({
				cacheName: ${JSON.stringify(this._options.staleWhileRevalidate.cacheName)}
			});`;

			if ("routes" in this._options.staleWhileRevalidate) {
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
			}

			if ("fileTypes" in this._options.staleWhileRevalidate) {
				const fileTypesCode = generate(
					toAst(this._options.staleWhileRevalidate.fileTypes)
				);

				code += `\nregisterRoute(
					({request, url}) => {
						if (url.pathname === "/assets/js/service-worker.js" || url.pathname === "/service-worker.js") {
							return false;
						} else {
							return ${fileTypesCode}.includes(request.destination);
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
				/**
				 * @fixme wrong call signature according to TS
				 */
				// @ts-ignore
				nodeResolve(),
				/**
				 * @fixme wrong call signature according to TS
				 */
				// @ts-ignore
				commonjs(),
				babel({
					exclude: "node_modules/**",
					presets: ["@babel/preset-env"],
					babelHelpers: "runtime",
					skipPreflightCheck: true,
				}),
				/**
				 * @fixme wrong call signature according to TS
				 */
				// @ts-ignore
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

	private static async _transpileAndSaveServiceWorkerRegistration(): Promise<
		void
	> {
		const serviceWorkerRegistrationBundle = await rollup({
			input: "./static/register-service-worker.temp.js",
			plugins: [
				/**
				 * @fixme wrong call signature according to TS
				 */
				// @ts-ignore
				nodeResolve(),
				/**
				 * @fixme wrong call signature according to TS
				 */
				// @ts-ignore
				commonjs(),
				babel({
					exclude: "node_modules/**",
					presets: ["@babel/preset-env"],
					babelHelpers: "runtime",
					skipPreflightCheck: true,
				}),
				/**
				 * @fixme wrong call signature according to TS
				 */
				// @ts-ignore
				replace({
					"process.env.NODE_ENV": JSON.stringify("production"),
				}),
				terser(),
			],
		});

		await serviceWorkerRegistrationBundle.write({
			format: "iife",
			file: "./static/assets/js/service-worker.js",
		});

		unlinkSync("./static/register-service-worker.temp.js");
	}

	private _throwIfOptionIsNotAStrategy(
		optionName:
			| "cacheFirst"
			| "networkFirst"
			| "cacheOnly"
			| "networkOnly"
			| "staleWhileRevalidate"
	): void {
		if (optionName in this._options) {
			const strategy = this._options[optionName];

			if (!(strategy instanceof Object)) {
				throw new TypeError(`"${optionName}" must be an object`);
			}

			if (!("cacheName" in strategy)) {
				throw new TypeError(
					`"${optionName}.cacheName" must be present`
				);
			}

			if (!("routes" in strategy) && !("fileTypes" in strategy)) {
				throw new TypeError(
					`"${optionName}.routes" or "${optionName}.fileTypes" must be present`
				);
			}

			if (typeof strategy.cacheName !== "string") {
				throw new TypeError(
					`"${optionName}.cacheName" must be a string`
				);
			}

			if ("routes" in strategy) {
				if (!Array.isArray(strategy.routes)) {
					throw new TypeError(
						`"${optionName}.routes" must be an array`
					);
				}

				for (let index = 0; index < strategy.routes.length; index++) {
					const route = strategy.routes[index];

					if (
						typeof route !== "string" &&
						!(route instanceof RegExp)
					) {
						throw new TypeError(
							`"${optionName}.routes[${index}]" must be a string or a regexp`
						);
					}
				}
			}

			if ("fileTypes" in strategy) {
				if (!Array.isArray(strategy.fileTypes)) {
					throw new TypeError(
						`"${optionName}.fileTypes" must be an array`
					);
				}

				for (
					let index = 0;
					index < strategy.fileTypes.length;
					index++
				) {
					const fileType = strategy.fileTypes[index];

					if (typeof fileType !== "string") {
						throw new TypeError(
							`"${optionName}.fileTypes[${index}]" must be a string`
						);
					}

					if (!this.ALLOWED_REQUEST_DESTINATION.includes(fileType)) {
						const allowedFileTypes = this.ALLOWED_REQUEST_DESTINATION.join(
							", "
						);

						throw new TypeError(
							`"${optionName}".fileTypes[${index}] must be a valid file type between ${allowedFileTypes}`
						);
					}
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
