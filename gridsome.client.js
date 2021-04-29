"use strict";

exports.__esModule = true;

exports["default"] = function (Vue, options, _a) {
  var head = _a.head;

  if (process.isServer) {
    var pathPrefix = require("../../gridsome.config.js").pathPrefix;

    var src = (pathPrefix ? pathPrefix : "") + "/assets/js/service-worker.js";

    if (!src.startsWith("/")) {
      src = "/" + src;
    }

    src = src.replace("//", "/");
    head.script.push({
      type: "text/javascript",
      src: src,
      async: true
    });
  }
};