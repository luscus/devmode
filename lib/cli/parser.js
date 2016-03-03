'use strict';

var locator = require('../require/locator');
var root    = require('package.root');
var path    = require('path');

exports.parse = function parse(commandLineArgs) {
  var options = {
    node: commandLineArgs[0],
    root: root.path,
    scripts: exports.getScriptAbsolutePaths(commandLineArgs)
  };

  return options;
};

exports.getScriptAbsolutePaths = function parse(commandLineArgs) {
  var paths = [];

  commandLineArgs.slice(2).forEach(function (scriptPath) {
    if (locator.IS_ABSOLUTE_PATH.test(scriptPath)) {
      paths.push(scriptPath)
    } else {
      paths.push(path.normalize(root.path + path.sep + scriptPath))
    }
  });

  return paths;
};
