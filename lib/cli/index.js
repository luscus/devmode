'use strict';

var path            = require('path');
var locator         = require('../require/locator');
var devmodeSrcDir   = path.normalize(__dirname + path.sep + '..' + path.sep + '..');
var devmodeStartDir = process.cwd();

exports.parse = function parse(commandLineArgs) {
  var options = {
    node: commandLineArgs[0],
    root: devmodeSrcDir,
    scripts: exports.getScriptAbsolutePaths(commandLineArgs)
  };

  return options;
};

exports.getScriptAbsolutePaths = function parse(commandLineArgs) {
  var paths = [];

  commandLineArgs.slice(2).forEach(function (scriptPath) {
    if (path.isAbsolute(scriptPath)) {
      paths.push(scriptPath);
    } else {
      paths.push(path.normalize(devmodeStartDir + path.sep + scriptPath));
    }
  });

  return paths;
};
