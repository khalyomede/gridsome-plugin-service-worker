import { src, dest, parallel } from "gulp";
import plumber from "gulp-plumber";
import typescript from "gulp-typescript";
import babel from "gulp-babel";
import tslint from "gulp-tslint";
import { rollup } from "rollup";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import rollupTypescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

const js = () =>
	src(["src/gridsome.{server,client}.ts"])
		.pipe(plumber())
		.pipe(tslint())
		.pipe(typescript())
		.pipe(babel())
		.pipe(dest("./"));

const registerServiceWorker = async () => {
	const bundle = await rollup({
		input: "src/register-service-worker.ts",
		plugins: [
			nodeResolve(),
			commonjs(),
			rollupTypescript(),
			terser({
				output: {
					comments: false,
				},
			}),
		],
	});

	await bundle.write({
		output: {
			file: "register-service-worker.js",
			format: "iife",
		},
	});
};

const build = parallel(js, registerServiceWorker);

export { build };
