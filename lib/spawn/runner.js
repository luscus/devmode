'use strict';

var path     = require('path');
var fs       = require('fs');
var Module   = require('module');
var _require = Module.prototype.require;
var location = process.argv[2];

if (location) {

  var stats = fs.lstatSync(location);
  var dir   = location;

  //console.log('stats.isDirectory()', stats.isDirectory());
  if (!stats.isDirectory()) {
    dir = path.dirname(location);
  }

  //console.log(process.pid, process.argv, dir);
  process.chdir(dir);
  process.env.DEVMODE_SCRIPT = process.argv[2];

// load the module locator
  require(process.env.DEVMODE_ROOT + '/lib/require/locator');

// load native require patch
  require(process.env.DEVMODE_ROOT + '/lib/require/patch');

  try {
    require(process.argv[2]);
  }
  catch (error) {
    console.error(error.stack);
  }
}
