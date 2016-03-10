'use strict';

var spawner = require('./spawn/spawner');
var cli     = require('./cli/index');


module.exports = function devmode (options) {
  process.env.DEVMODE_ACTIVE = true;
  process.env.DEVMODE_ROOT   = options.root;

  options.scripts.forEach(function (script) {
    spawner.spawn(script, options);
  });
};
