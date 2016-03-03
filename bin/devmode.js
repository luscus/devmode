#!/usr/bin/env node
'use strict';

var program = require('commander');
var pack    = require('../package.json');

program
  .version(pack.version)
  .usage('<path/to/appFile1> [, <path/to/app2>]');
