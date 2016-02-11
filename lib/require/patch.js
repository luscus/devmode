'use strict';

var locator  = require('./locator');
var watcher  = require('../watch/watcher');
var Module   = require('module');
var path     = require('path');

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
    var absolutePath = locator.absolute(packageName, Module._resolveFilename(packageName, this));
    var requiredPackage;

    try {
         // try to require the generated absolute path
        requiredPackage  = _require(absolutePath);
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

    watcher.checkCandidate(absolutePath);

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

module.exports = Module;
