'use strict';

var context  = require('../context.json');
var filter   = require('./filter');
var root     = require('package.root');
var path     = require('path');
var fs       = require('fs');

context.watched = {};

exports.WORKPLACE_PATH  = path.normalize(root.path + path.sep + '..');
exports.IS_ROOT_PACKAGE = new RegExp('^(' + root.path.replace('\\', '\\\\').replace('/', '\/') + ')');
exports.IS_SUB_PACKAGE  = new RegExp('^(' +
    exports.WORKPLACE_PATH.replace('\\', '\\\\').replace('/', '\/') +
    path.sep.replace('\\', '\\\\').replace('/', '\/') +
    '[\.0-9a-zA-Z_-]+' + path.sep.replace('\\', '\\\\').replace('/', '\/') +
    'node_modules)'
);

exports.changeHandler = function changeHandler (requirePath, event, filename) {
    if (event === 'rename' || event === 'change')  {
        console.log('     DEVMODE WATCHER - file changed: ' + requirePath);
        // TODO restart the application
    }

    if (event === 'rename') {
        // file has changed - reset watcher
        context.watched[requirePath] = fs.watch(requirePath, exports.changeHandler.bind(this, requirePath));
    }
};

exports.checkCandidate = function checkCandidate (requirePath) {

    if (filter.isCandidate(requirePath)) {

        //console.log('  -- WATCH:', process.pid, requirePath);
        // set file watcher
        context.watched[requirePath] = fs.watch(requirePath, exports.changeHandler.bind(this, requirePath));
    }
};
