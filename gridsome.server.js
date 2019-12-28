"use strict";

var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __generator = void 0 && (void 0).__generator || function (thisArg, body) {
  var _ = {
    label: 0,
    sent: function sent() {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];

        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;

          case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;

          case 7:
            op = _.ops.pop();

            _.trys.pop();

            continue;

          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }

            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }

            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }

            if (t && _.label < t[2]) {
              _.label = t[2];

              _.ops.push(op);

              break;
            }

            if (t[2]) _.ops.pop();

            _.trys.pop();

            continue;
        }

        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};

var Joi = require("@hapi/joi");

var commonjs = require("@rollup/plugin-commonjs");

var nodeResolve = require("@rollup/plugin-node-resolve");

var replace = require("@rollup/plugin-replace");

var escodegen_1 = require("escodegen");

var fs_1 = require("fs");

var rollup_1 = require("rollup");

var babel = require("rollup-plugin-babel");

var rollup_plugin_terser_1 = require("rollup-plugin-terser");

var toAst = require("to-ast");

var GridsomePluginServiceWorker = function () {
  function GridsomePluginServiceWorker(api, options) {
    var _this = this;

    api.beforeBuild(function () {
      return __awaiter(_this, void 0, void 0, function () {
        var strategy, error, registerServiceWorkerBundle, serviceWorkerContent, routesCode, code, code, _i, _a, route, routeCode, code, _b, _c, route, routeCode, code, _d, _e, route, routeCode, code, _f, _g, route, routeCode, code, _h, _j, route, routeCode, serviceWorkerBundle;

        return __generator(this, function (_k) {
          switch (_k.label) {
            case 0:
              console.time("gridsome-plugin-service-worker");
              strategy = Joi.object({
                cacheName: Joi.string().required(),
                routes: [Joi.array().items(Joi.any()).required()]
              });
              error = Joi.object({
                cacheFirst: strategy,
                cacheOnly: strategy,
                networkFirst: strategy,
                networkOnly: strategy,
                precachedRoutes: Joi.array().items(Joi.string()).required(),
                staleWhileRevalidate: strategy
              }).required().validate(options).error;

              if (error instanceof Error) {
                console.log("gridsome-plugin-service-worker: " + error.message);
                console.timeEnd("gridsome-plugin-service-worker");
                return [2];
              }

              return [4, rollup_1.rollup({
                input: __dirname + "/register-service-worker.js",
                plugins: [nodeResolve(), commonjs(), babel({
                  presets: ["@babel/preset-env"]
                }), rollup_plugin_terser_1.terser()]
              })];

            case 1:
              registerServiceWorkerBundle = _k.sent();
              return [4, registerServiceWorkerBundle.write({
                format: "iife",
                file: "./static/assets/js/service-worker.js"
              })];

            case 2:
              _k.sent();

              serviceWorkerContent = fs_1.readFileSync(__dirname + "/service-worker.js").toString();

              if (options.precachedRoutes.length > 0) {
                routesCode = escodegen_1.generate(toAst(options.precachedRoutes));
                code = "precacheAndRoute(" + routesCode + ")";
                serviceWorkerContent += code;
              }

              if (options.staleWhileRevalidate.routes.length > 0) {
                code = "\nconst staleWhileRevalidate = new StaleWhileRevalidate({\n\tcacheName: " + JSON.stringify(options.staleWhileRevalidate.cacheName) + "\n});";

                for (_i = 0, _a = options.staleWhileRevalidate.routes; _i < _a.length; _i++) {
                  route = _a[_i];
                  routeCode = escodegen_1.generate(toAst(route));
                  code += "\nregisterRoute(" + routeCode + ", staleWhileRevalidate);";
                }

                serviceWorkerContent += code;
              }

              if (options.networkOnly.routes.length > 0) {
                code = "\nconst networkOnly = new NetworkOnly({\n\tcacheName: " + JSON.stringify(options.networkOnly.cacheName) + "\n});";

                for (_b = 0, _c = options.networkOnly.routes; _b < _c.length; _b++) {
                  route = _c[_b];
                  routeCode = escodegen_1.generate(toAst(route));
                  code += "\nregisterRoute(" + routeCode + ", networkOnly);";
                }

                serviceWorkerContent += code;
              }

              if (options.networkFirst.routes.length > 0) {
                code = "\n\t\t  const networkFirst = new NetworkFirst({\n\tcacheName: " + JSON.stringify(options.networkFirst.cacheName) + "\n});";

                for (_d = 0, _e = options.networkFirst.routes; _d < _e.length; _d++) {
                  route = _e[_d];
                  routeCode = escodegen_1.generate(toAst(route));
                  code += "\n\nregisterRoute(" + routeCode + ", networkFirst);";
                }

                serviceWorkerContent += "" + code;
              }

              if (options.cacheOnly.routes.length > 0) {
                code = "\nconst cacheOnly = new CacheOnly({\n\tcacheName: " + JSON.stringify(options.cacheOnly.cacheName) + "\n});";

                for (_f = 0, _g = options.cacheOnly.routes; _f < _g.length; _f++) {
                  route = _g[_f];
                  routeCode = escodegen_1.generate(toAst(route));
                  code += "\nregisterRoute(" + routeCode + ", cacheOnly);";
                }

                serviceWorkerContent += code;
              }

              if (options.cacheFirst.routes.length > 0) {
                code = "\nconst cacheFirst = new CacheFirst({\n\tcacheName: " + JSON.stringify(options.cacheFirst.cacheName) + "\n});";

                for (_h = 0, _j = options.cacheFirst.routes; _h < _j.length; _h++) {
                  route = _j[_h];
                  routeCode = escodegen_1.generate(toAst(route));
                  code += "\nregisterRoute(" + routeCode + ", cacheFirst);";
                }

                serviceWorkerContent += "" + code;
              }

              fs_1.writeFileSync("./static/service-worker.temp.js", serviceWorkerContent);
              return [4, rollup_1.rollup({
                input: "./static/service-worker.temp.js",
                plugins: [nodeResolve(), commonjs(), babel({
                  exclude: "node_modules/**",
                  presets: ["@babel/preset-env"]
                }), replace({
                  "process.env.NODE_ENV": JSON.stringify("production")
                }), rollup_plugin_terser_1.terser()]
              })];

            case 3:
              serviceWorkerBundle = _k.sent();
              return [4, serviceWorkerBundle.write({
                format: "iife",
                file: "./static/service-worker.js"
              })];

            case 4:
              _k.sent();

              fs_1.unlinkSync("./static/service-worker.temp.js");
              console.timeEnd("gridsome-plugin-service-worker");
              return [2];
          }
        });
      });
    });
  }

  GridsomePluginServiceWorker.defaultOptions = function () {
    return {
      cacheFirst: {
        cacheName: "cf-v1",
        routes: []
      },
      cacheOnly: {
        cacheName: "co-v1",
        routes: []
      },
      networkFirst: {
        cacheName: "nf-v1",
        routes: []
      },
      networkOnly: {
        cacheName: "no-v1",
        routes: []
      },
      precachedRoutes: [],
      staleWhileRevalidate: {
        cacheName: "swr-v1",
        routes: []
      }
    };
  };

  return GridsomePluginServiceWorker;
}();

module.exports = GridsomePluginServiceWorker;