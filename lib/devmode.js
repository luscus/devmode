'use strict';

var root     = require('package.root');
var path     = require('path');
var Module   = require('module');

/**
 * List of stage names that activate the devmode
 *
 * @private
 * @type {string[]}
 */
var DEVMODE_STAGE_NAMES    = ['LAB', 'LOCAL', 'TEST'];

/**
 * Regular expression used to check for an dependency name
 *
 * @private
 * @type {RegExp}
 */
var DEPENDENCY_REGEX_CHECK = /^(?!\.{1,2}(\/|\\))/;

/**
 * Name of the environment variable holding the stage name
 *
 * @type {string}
 * @default NODE_ENV
 */
exports.STAGE_ENV_VARIABLE_NAME = 'NODE_ENV';

/**
 * Path prefix appended to the dependency name
 *
 * @type {string}
 */
exports.DEPENDENCY_PATH_PREFIX = path.sep + '..' + path.sep;

/**
 * Returns true or false depending on the environment stage name:
 * if process.env.<STAGE_ENV_VARIABLE_NAME> equals 'LAB' or 'LOCAL',
 * devmode will be active
 *
 * @returns {boolean}
 */
exports.isActive = function isActive () {
  var stageName = process.env[exports.STAGE_ENV_VARIABLE_NAME] &&
                    process.env[exports.STAGE_ENV_VARIABLE_NAME].toUpperCase();

  // if stage name is listed, return true
  return (-1 < DEVMODE_STAGE_NAMES.indexOf(stageName));
};

/**
 * Depending on the devmode.isActive status,
 * transforms a dependency name into an absolute path
 * to this dependency in the package parent directory.
 * Relative paths will be ignored and returned unchanged.
 *
 * @param {string} requirePath a path or dependency name
 * @returns {string} either an relative path to some packge
 * internal resource or an absolute path to a dependency
 */
exports.getRequirePath = function getRequirePath (requirePath) {

  if (exports.isActive() && requirePath.match(DEPENDENCY_REGEX_CHECK)) {
    var relativePath = exports.DEPENDENCY_PATH_PREFIX + requirePath;
    requirePath = path.normalize(root.path + relativePath);
  }

  return requirePath;
};

// these variables are needed inside eval _compile
/* jshint -W098 */
var runInNewContext  = require('vm').runInNewContext;
var runInThisContext = require('vm').runInThisContext;
var shebangRe        = /^\#\!.*/;

var _require         = Module.prototype.require;
var _compile         = Module.prototype._compile;

/**
 * A wrapper for the native Node.js require method.
 * Depending on the devmode.isActive status, it will
 * load dependencies from different locations:
 * - isActive (true): the method will try to load the
 *   dependency from the project parent directory, if
 *   it fails a second try is made from node_modules
 * - isActive (false): the dependency will be loaded
 * as usual from the node_module directory
 *
 * This wrapper has been inspired by Gleb Bahmutov excellent
 * article [Hacking Node require]{@link http://bahmutov.calepin.co/hacking-node-require.html}
 * and the resulting package [really-need]{@link https://github.com/bahmutov/really-need}
 *
 * @param {string} requirePath a path or dependency name
 * @returns {*} the requested dependency loaded either
 * from the parent or the node_modules directory
 */
Module.prototype.require = function requireWrapper(packageName) {
  var absolutePath = exports.getRequirePath(packageName);
  var requiredPackage;

  try {
    // try to require the generated absolute path
    requiredPackage = _require(absolutePath);
  }
  catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      // generated path could not be loaded,
      // try again from the node_modules directory
      absolutePath    = Module._resolveFilename(packageName, this);
      requiredPackage = Module._load(absolutePath);
    }
    else {
      // some other error occurred,
      // throw it to avoid breaking the chain
      throw error;
    }
  }

  // return the loaded package
  return requiredPackage;
};

// see Module.prototype._compile in
// https://github.com/joyent/node/blob/master/lib/module.js
var _compileStr = _compile.toString();

/* jshint -W061 */
var patchedCompile= eval('(' + _compileStr + ')');

Module.prototype._compile = function compileWrapper (content, filename) {
  return patchedCompile.call(this, content, filename);
};

// Active status should be prompted once for the main package
// check whether or not devmode is active
// check if dependency has not been required
if (exports.isActive()) {
  console.log('     DEVMODE ACTIVE: ' + root.name);
}
