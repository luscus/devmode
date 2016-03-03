'use strict';

var context  = require('../context.json');
var message  = require('../spawn/message');
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

exports.sep = '::';

exports.changeHandler = function changeHandler (requirePath, event, filename) {
    if (event === 'rename' || event === 'change')  {
        // TODO restart the application
        process.send(message.moduleChange(requirePath));
    }

    if (event === 'rename') {
        // file has changed - reset watcher
        process.send(message.registerModule(process.env.DEVMODE_SCRIPT, requirePath));
    }
};

exports.checkCandidate = function checkCandidate (requirePath) {

    if (filter.isCandidate(requirePath)) {
        process.send(message.registerModule(process.env.DEVMODE_SCRIPT, requirePath));
    }
};
