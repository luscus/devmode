'use strict';

var context  = require('../context.json');
var pack     = require('package.root');
var path     = require('path');
var fs       = require('fs');

exports.escapeSeparator = function escapeSeparator (rawPath) {
    return rawPath.replace('\\', '\\\\').replace('/', '\/');
};

/**
 * Path prefix appended to the dependency name
 *
 * @type {string}
 */
exports.DEPENDENCY_PATH_PREFIX = path.sep + '..' + path.sep;
exports.IS_ROOT_PACKAGE = new RegExp('^(' + pack.path.replace('\\', '\\\\').replace('/', '\/') + ')');
exports.WORKPLACE_PATH  = path.normalize(pack.path + path.sep + '..');
exports.IS_SUB_PACKAGE  = new RegExp(
  '^(' +
  exports.escapeSeparator(exports.WORKPLACE_PATH) +
  exports.escapeSeparator(path.sep) +
  '[\.0-9a-zA-Z_-]+' +
  exports.escapeSeparator(path.sep) +
  'node_modules)'
);
exports.IS_IN_DIRECTORY = new RegExp(
  '^(' +
  exports.escapeSeparator(exports.WORKPLACE_PATH) +
  exports.escapeSeparator(path.sep) +
  '[\.0-9a-zA-Z_-]+)'
);
exports.DEPENDENCY_PATH = new RegExp(
  '^(' +
  exports.escapeSeparator(exports.WORKPLACE_PATH) +
  exports.escapeSeparator(path.sep) +
  '[\.0-9a-zA-Z_-]+' +
  exports.escapeSeparator(path.sep) +
  'node_modules' +
  exports.escapeSeparator(path.sep) +
  '[\.0-9a-zA-Z_-]+)'
);

exports.IS_DIRECTORY    = new RegExp(
  '^(' +
  exports.escapeSeparator(exports.WORKPLACE_PATH) +
  exports.escapeSeparator(path.sep) +
  '[\.0-9a-zA-Z_-]+)$'
);
exports.IS_CORE_MODULE  = /^(?!(\/|\\))[a-zA-Z_]+$/;
exports.IS_PACKAGE_NAME = /^(?!(\/|\\))[\.a-zA-Z-_]+$/;
exports.IS_LOCAL_IMPORT = /^(?!(\/|\\))\.{1,2}(\/|\\).*/;

context.root      = pack.path.match(exports.IS_IN_DIRECTORY)[1];
context.workplace = path.normalize(context.root + path.sep + '..');
context.checked   = {};
context.loaded    = {};

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
exports.absolute = function absolute (requirePath, resolvedPath) {
    requirePath = path.normalize(requirePath);
    var key        = exports.getModulePath(resolvedPath);


    if (requirePath === resolvedPath) {
        // required is a core module
        return resolvedPath;
    } else if (exports.IS_PACKAGE_NAME.test(requirePath) && !exports.IS_CORE_MODULE.test(resolvedPath)) {
        var rebasedPath = exports.rebase(requirePath);

        if (rebasedPath) {
            exports.register(key, requirePath, resolvedPath, rebasedPath);
        }
    }


    if (context.loaded[key]) {
        return resolvedPath.replace(key, context.loaded[key].root);
    }

    return resolvedPath;
};

exports.rebase = function rebase (requirePath) {
    var relativePath = exports.DEPENDENCY_PATH_PREFIX + requirePath;
    var rebasedPath  = path.normalize(context.root + relativePath);

    if (context.checked[rebasedPath]) {
       return context.checked[rebasedPath];
    }

    try {
        var stats = fs.statSync(rebasedPath);

        if (stats.isDirectory()) {
            context.checked[rebasedPath] = rebasedPath;
        }
    }
    catch (error) {
        if (error.code !== 'ENOENT') {
            // some other error occurred,
            // throw it to avoid breaking the chain
            throw error;
        }

        context.checked[rebasedPath] = null;
    }

    return context.checked[rebasedPath];
};

exports.getModulePath = function getModulePath (resolvedPath) {
    var moduleDirString    = 'node_modules/';
    var lastModuleDirIndex = resolvedPath.lastIndexOf(moduleDirString);
    var lastSeparatorIndex = resolvedPath.indexOf(path.sep, lastModuleDirIndex + moduleDirString.length);

    return resolvedPath.substring(0, lastSeparatorIndex);
};

exports.register = function register (key, packageName, resolvedPath, rebasedPath) {
    if (!context.loaded[key]) {
        context.loaded[key] = {
            name: packageName,
            root: rebasedPath
        };
    }

    return context.loaded[key];
};

exports.init = function init (requirePath) {
    context.root       = requirePath.match(exports.IS_IN_DIRECTORY)[1];
    context.rootModule = context.root + path.sep + 'node_modules';
    context.workplace  = path.normalize(context.root + path.sep + '..');

    exports.WORKPLACE_PATH  = context.workplace;
    exports.IS_ROOT_PACKAGE = new RegExp('^(' + context.root.replace('\\', '\\\\').replace('/', '\/') + ')');

    return exports;
};
