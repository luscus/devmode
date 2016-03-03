'use strict';

var spawner = require('./spawn/spawner');
var cli     = require('./cli/parser');
var options = cli.parse(process.argv);

process.env.DEVMODE_ACTIVE = true;
process.env.DEVMODE_ROOT   = options.root;

/*
console.log('DEVMODE_OPTIONS', options);
console.log('process.env.DEVMODE_ACTIVE', process.env.DEVMODE_ACTIVE);
console.log('process.env.DEVMODE_ROOT', process.env.DEVMODE_ROOT);
*/

spawner.spawn(options.scripts[0], options);
