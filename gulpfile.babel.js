import { src, dest, parallel } from "gulp";
import plumber from "gulp-plumber";
import typescript from "gulp-typescript";
import babel from "gulp-babel";
import tslint from "gulp-tslint";

const js = () =>
	src("src/gridsome.{client,server}.ts")
		.pipe(plumber())
		.pipe(tslint())
		.pipe(typescript())
		.pipe(babel())
		.pipe(dest("./"));

const build = parallel(js);

export { build };
