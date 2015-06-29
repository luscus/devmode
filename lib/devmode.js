/* jshint node:true */
/* jshint expr:true*/
/* global process */
/* global require */
/* global exports */
'use strict';

var nativeRequire = require;
var root          = nativeRequire('package.root');
var path          = nativeRequire('path');

/**
 * List of stage names that activate the devmode
 *
 * @private
 * @type {string[]}
 */
var DEVMODE_STAGE_NAMES    = ['LAB', 'LOCAL'];

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
 * @default STAGE
 */
exports.STAGE_ENV_VARIABLE_NAME = 'STAGE';

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
  var stageName = process.env[exports.STAGE_ENV_VARIABLE_NAME];

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
 * @param {string} requirePath a path or dependency name
 * @returns {*} the requested dependency loaded either
 * from the parent or the node_modules directory
 */
exports.require = function require (requirePath) {
  var absolutePath = exports.getRequirePath(requirePath);
  var requiredPackage;

  try {
    // try to require the generated absolute path
    requiredPackage = nativeRequire(absolutePath);
  }
  catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      // generated path could not be loaded,
      // try again from the node_modules directory
      requiredPackage = nativeRequire(requirePath);
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

// Active status should be prompted once for the main package
// check whether or not devmode is active
// check if dependency has not been required
if (exports.isActive()) {
  console.log(
    '     DEVMODE ACTIVE: ' + root.name
  );
}
