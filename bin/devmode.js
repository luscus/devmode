#!/usr/bin/env node
'use strict';
console.log('process.env.PWD:', process.env.PWD);
console.log('process.argv:', process.argv);
console.log('process.cwd:', process.cwd());
console.log('__dirname:', __dirname);

var program = require('commander');
var cli     = require('../lib/cli');
var pack    = require('../package.json');
var devmode = require('../' + pack.main);

program
  .version(pack.version)
  .description('Starts one or more Node.js applications')
  .usage('<path> [otherPaths...]')
  .action(function () {
    var options = cli.parse(process.argv);
    devmode(options);
  })
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
