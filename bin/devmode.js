#!/usr/bin/env node
var program = require('commander');
var pack    = require('../package.json');

program
  .version(pack.version)
  .usage('<path/to/appFile1> [, <path/to/app2>]');
