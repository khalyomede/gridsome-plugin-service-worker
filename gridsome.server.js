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

var commonjs = require("@rollup/plugin-commonjs");

var nodeResolve = require("@rollup/plugin-node-resolve");

var replace = require("@rollup/plugin-replace");

var escodegen_1 = require("escodegen");

var fs_1 = require("fs");

var fs_extra_1 = require("fs-extra");

var rollup_1 = require("rollup");

var babel = require("rollup-plugin-babel");

var rollup_plugin_terser_1 = require("rollup-plugin-terser");

var toAst = require("to-ast");

var GridsomePluginServiceWorker = function () {
  function GridsomePluginServiceWorker(api, options) {
    var _this = this;

    this._options = options;
    this._serviceWorkerContent = "";
    api.beforeBuild(function () {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              console.time("gridsome-plugin-service-worker");

              try {
                this._checkOptions();
              } catch (exception) {
                if (exception instanceof TypeError) {
                  console.error("gridsome-plugin-service-worker: " + exception.message);
                  console.timeEnd("gridsome-plugin-service-worker");
                } else {
                  throw exception;
                }

                return [2];
              }

              this._setInitialServiceWorkerContent();

              this._addPrecachedRoutesToServiceWorkerContent();

              this._addCacheFirstToServiceWorkerContent();

              this._addCacheOnlyToServiceWorkerContent();

              this._addNetworkFirstToServiceWorkerContent();

              this._addNetworkOnlyToServiceWorkerContent();

              this._addStaleWhileRevalidateToServiceWorkerContent();

              this._saveTemporaryServiceWorkerContent();

              return [4, Promise.all([GridsomePluginServiceWorker._transpileAndSaveServiceWorker(), GridsomePluginServiceWorker._copyAndSaveServiceWorkerRegistration()])];

            case 1:
              _a.sent();

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

  GridsomePluginServiceWorker.prototype._setInitialServiceWorkerContent = function () {
    this._serviceWorkerContent = fs_1.readFileSync(__dirname + "/service-worker.js").toString();
  };

  GridsomePluginServiceWorker.prototype._addPrecachedRoutesToServiceWorkerContent = function () {
    if ("precachedRoutes" in this._options && Array.isArray(this._options.precachedRoutes) && this._options.precachedRoutes.length > 0) {
      var routesCode = escodegen_1.generate(toAst(this._options.precachedRoutes));
      var code = "precacheAndRoute(" + routesCode + ")";
      this._serviceWorkerContent += code;
    }
  };

  GridsomePluginServiceWorker.prototype._addCacheFirstToServiceWorkerContent = function () {
    if ("cacheFirst" in this._options && this._options.cacheFirst instanceof Object && this._options.cacheFirst.routes.length > 0) {
      var code = "\n\t\t\tconst cacheFirst = new CacheFirst({\n\t\t\t\tcacheName: " + JSON.stringify(this._options.cacheFirst.cacheName) + "\n\t\t\t});";

      for (var _i = 0, _a = this._options.cacheFirst.routes; _i < _a.length; _i++) {
        var route = _a[_i];
        var routeCode = escodegen_1.generate(toAst(route));
        code += "registerRoute(\n\t\t\t\t\t({url}) => {\n\t\t\t\t\t\tif (url.pathname === \"/assets/js/service-worker.js\" || url.pathname === \"/service-worker.js\") {\n\t\t\t\t\t\t\treturn false;\n\t\t\t\t\t\t} else if (typeof " + routeCode + " === \"string\") {\n\t\t\t\t\t\t\treturn url.pathname === " + routeCode + ";\n\t\t\t\t\t\t} else if (" + routeCode + " instanceof RegExp) {\n\t\t\t\t\t\t\treturn " + routeCode + ".test(url.pathname);\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\treturn false;\n\t\t\t\t\t\t}\n\t\t\t\t\t},\n\t\t\t\t\tcacheFirst\n\t\t\t\t);";
      }

      this._serviceWorkerContent += "" + code;
    }
  };

  GridsomePluginServiceWorker.prototype._addCacheOnlyToServiceWorkerContent = function () {
    if ("cacheOnly" in this._options && this._options.cacheOnly instanceof Object && this._options.cacheOnly.routes.length > 0) {
      var code = "\nconst cacheOnly = new CacheOnly({\n\t\t\t\tcacheName: " + JSON.stringify(this._options.cacheOnly.cacheName) + "\n\t\t\t});";

      for (var _i = 0, _a = this._options.cacheOnly.routes; _i < _a.length; _i++) {
        var route = _a[_i];
        var routeCode = escodegen_1.generate(toAst(route));
        code += "\nregisterRoute(\n\t\t\t\t\t({url}) => {\n\t\t\t\t\t\tif (url.pathname === \"/assets/js/service-worker.js\" || url.pathname === \"/service-worker.js\") {\n\t\t\t\t\t\t\treturn false;\n\t\t\t\t\t\t} else if (typeof " + routeCode + " === \"string\") {\n\t\t\t\t\t\t\treturn url.pathname === " + routeCode + ";\n\t\t\t\t\t\t} else if (" + routeCode + " instanceof RegExp) {\n\t\t\t\t\t\t\treturn " + routeCode + ".test(url.pathname);\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\treturn false;\n\t\t\t\t\t\t}\n\t\t\t\t\t},\n\t\t\t\t\tcacheOnly\n\t\t\t\t);";
      }

      this._serviceWorkerContent += code;
    }
  };

  GridsomePluginServiceWorker.prototype._addNetworkFirstToServiceWorkerContent = function () {
    if ("networkFirst" in this._options && this._options.networkFirst instanceof Object && this._options.networkFirst.routes.length > 0) {
      var code = "\n\t\t\t\t\t  const networkFirst = new NetworkFirst({\n\t\t\t\tcacheName: " + JSON.stringify(this._options.networkFirst.cacheName) + "\n\t\t\t});";

      for (var _i = 0, _a = this._options.networkFirst.routes; _i < _a.length; _i++) {
        var route = _a[_i];
        var routeCode = escodegen_1.generate(toAst(route));
        code += "registerRoute(\n\t\t\t\t\t({url}) => {\n\t\t\t\t\t\tif (url.pathname === \"/assets/js/service-worker.js\" || url.pathname === \"/service-worker.js\") {\n\t\t\t\t\t\t\treturn false;\n\t\t\t\t\t\t} else if (typeof " + routeCode + " === \"string\") {\n\t\t\t\t\t\t\treturn url.pathname === " + routeCode + ";\n\t\t\t\t\t\t} else if (" + routeCode + " instanceof RegExp) {\n\t\t\t\t\t\t\treturn " + routeCode + ".test(url.pathname);\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\treturn false;\n\t\t\t\t\t\t}\n\t\t\t\t\t},\n\t\t\t\t\tnetworkFirst\n\t\t\t\t);";
      }

      this._serviceWorkerContent += "" + code;
    }
  };

  GridsomePluginServiceWorker.prototype._addNetworkOnlyToServiceWorkerContent = function () {
    if ("networkOnly" in this._options && this._options.networkOnly instanceof Object && this._options.networkOnly.routes.length > 0) {
      var code = "\nconst networkOnly = new NetworkOnly({\n\t\t\t\tcacheName: " + JSON.stringify(this._options.networkOnly.cacheName) + "\n\t\t\t});";

      for (var _i = 0, _a = this._options.networkOnly.routes; _i < _a.length; _i++) {
        var route = _a[_i];
        var routeCode = escodegen_1.generate(toAst(route));
        code += "\nregisterRoute(\n\t\t\t\t\t({url}) => {\n\t\t\t\t\t\tif (url.pathname === \"/assets/js/service-worker.js\" || url.pathname === \"/service-worker.js\") {\n\t\t\t\t\t\t\treturn false;\n\t\t\t\t\t\t} else if (typeof " + routeCode + " === \"string\") {\n\t\t\t\t\t\t\treturn url.pathname === " + routeCode + ";\n\t\t\t\t\t\t} else if (" + routeCode + " instanceof RegExp) {\n\t\t\t\t\t\t\treturn " + routeCode + ".test(url.pathname);\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\treturn false;\n\t\t\t\t\t\t}\n\t\t\t\t\t},\n\t\t\t\t\tnetworkOnly\n\t\t\t\t);";
      }

      this._serviceWorkerContent += code;
    }
  };

  GridsomePluginServiceWorker.prototype._addStaleWhileRevalidateToServiceWorkerContent = function () {
    if ("staleWhileRevalidate" in this._options && this._options.staleWhileRevalidate instanceof Object && this._options.staleWhileRevalidate.routes.length > 0) {
      var code = "\nconst staleWhileRevalidate = new StaleWhileRevalidate({\n\t\t\t\tcacheName: " + JSON.stringify(this._options.staleWhileRevalidate.cacheName) + "\n\t\t\t});";

      for (var _i = 0, _a = this._options.staleWhileRevalidate.routes; _i < _a.length; _i++) {
        var route = _a[_i];
        var routeCode = escodegen_1.generate(toAst(route));
        code += "\nregisterRoute(\n\t\t\t\t\t({url}) => {\n\t\t\t\t\t\tif (url.pathname === \"/assets/js/service-worker.js\" || url.pathname === \"/service-worker.js\") {\n\t\t\t\t\t\t\treturn false;\n\t\t\t\t\t\t} else if (typeof " + routeCode + " === \"string\") {\n\t\t\t\t\t\t\treturn url.pathname === " + routeCode + ";\n\t\t\t\t\t\t} else if (" + routeCode + " instanceof RegExp) {\n\t\t\t\t\t\t\treturn " + routeCode + ".test(url.pathname);\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\treturn false;\n\t\t\t\t\t\t}\n\t\t\t\t\t},\n\t\t\t\t\tstaleWhileRevalidate\n\t\t\t\t);";
      }

      this._serviceWorkerContent += code;
    }
  };

  GridsomePluginServiceWorker.prototype._saveTemporaryServiceWorkerContent = function () {
    fs_1.writeFileSync("./static/service-worker.temp.js", this._serviceWorkerContent);
  };

  GridsomePluginServiceWorker._transpileAndSaveServiceWorker = function () {
    return __awaiter(this, void 0, void 0, function () {
      var serviceWorkerBundle;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4, rollup_1.rollup({
              input: "./static/service-worker.temp.js",
              plugins: [nodeResolve(), commonjs(), babel({
                exclude: "node_modules/**",
                presets: ["@babel/preset-env"],
                runtimeHelpers: true
              }), replace({
                "process.env.NODE_ENV": JSON.stringify("production")
              }), rollup_plugin_terser_1.terser()]
            })];

          case 1:
            serviceWorkerBundle = _a.sent();
            return [4, serviceWorkerBundle.write({
              format: "iife",
              file: "./static/service-worker.js"
            })];

          case 2:
            _a.sent();

            fs_1.unlinkSync("./static/service-worker.temp.js");
            return [2];
        }
      });
    });
  };

  GridsomePluginServiceWorker._copyAndSaveServiceWorkerRegistration = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4, fs_extra_1.copy(__dirname + "/register-service-worker.js", "./static/assets/js/service-worker.js")];

          case 1:
            _a.sent();

            return [2];
        }
      });
    });
  };

  GridsomePluginServiceWorker.prototype._throwIfOptionIsNotAStrategy = function (optionName) {
    if (optionName in this._options) {
      if (!(this._options[optionName] instanceof Object)) {
        throw new TypeError("\"" + optionName + "\" must be an object");
      }

      if (!("cacheName" in this._options[optionName])) {
        throw new TypeError("\"" + optionName + ".cacheName\" must be present");
      }

      if (!("routes" in this._options[optionName])) {
        throw new TypeError("\"" + optionName + ".routes\" must be present");
      }

      if (typeof this._options[optionName].cacheName !== "string") {
        throw new TypeError("\"" + optionName + ".cacheName\" must be a string");
      }

      if (!Array.isArray(this._options[optionName].routes)) {
        throw new TypeError("\"" + optionName + ".routes\" must be an array");
      }

      for (var index = 0; index < this._options[optionName].routes.length; index++) {
        var route = this._options[optionName].routes[index];

        if (typeof route !== "string" && !(route instanceof RegExp)) {
          throw new TypeError("\"" + optionName + ".routes[" + index + "]\" must be a string or a regexp");
        }
      }
    }
  };

  GridsomePluginServiceWorker.prototype._checkOptions = function () {
    this._checkOptionCacheFirst();

    this._checkOptionCacheOnly();

    this._checkOptionNetworkFirst();

    this._checkOptionNetworkOnly();

    this._checkOptionPrecachedRoutes();

    this._checkOptionStaleWhileRevalidate();
  };

  GridsomePluginServiceWorker.prototype._checkOptionCacheFirst = function () {
    this._throwIfOptionIsNotAStrategy("cacheFirst");
  };

  GridsomePluginServiceWorker.prototype._checkOptionCacheOnly = function () {
    this._throwIfOptionIsNotAStrategy("cacheOnly");
  };

  GridsomePluginServiceWorker.prototype._checkOptionNetworkFirst = function () {
    this._throwIfOptionIsNotAStrategy("networkFirst");
  };

  GridsomePluginServiceWorker.prototype._checkOptionNetworkOnly = function () {
    this._throwIfOptionIsNotAStrategy("networkOnly");
  };

  GridsomePluginServiceWorker.prototype._checkOptionPrecachedRoutes = function () {
    if ("precachedRoutes" in this._options) {
      if (!Array.isArray(this._options.precachedRoutes)) {
        throw new TypeError("\"precachedRoutes\" must be an array");
      }

      for (var index = 0; index < this._options.precachedRoutes.length; index++) {
        var route = this._options.precachedRoutes[index];

        if (typeof route !== "string") {
          throw new TypeError("\"precachedRoutes[" + index + "]\" must be a string");
        }
      }
    }
  };

  GridsomePluginServiceWorker.prototype._checkOptionStaleWhileRevalidate = function () {
    this._throwIfOptionIsNotAStrategy("staleWhileRevalidate");
  };

  return GridsomePluginServiceWorker;
}();

module.exports = GridsomePluginServiceWorker;