'use strict';

var tc           = require("termcolor").define();
var fs           = require('fs');
var message      = require('./message');
var clone        = require('clone');
var childProcess = require('child_process');
var _spawn       = childProcess.spawn;

var childs       = {};
var watches      = {};
var watcher      = {};


exports.spawn = function spawn (scriptPath, options) {
  options = options || {};

  console.green('#####################################');
  console.green('devmode.pid:', process.pid);
  if (options.becauseOf) {
    console.green('restart:    ', scriptPath);
    console.green('changed:    ', options.becauseOf);
  } else {
    console.green('start:      ', scriptPath);
  }

  function mySpawn() {
    var result = _spawn.apply(this, arguments);
    return result;
  }
  childProcess.spawn = mySpawn;

  var env      = clone(process.env);
  env.FILENAME = scriptPath;

  childs[scriptPath] = childs[scriptPath] || {};
  childs[scriptPath].options = options;
  childs[scriptPath].process = childProcess.spawn(
    process.env.SHELL,
    [
      '-c',
      options.node + ' ' + options.root + '/lib/spawn/runner.js ' + scriptPath
    ],
    {
      env: process.env,
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    }
  );

  var child = childs[scriptPath].process;
  console.green('child.pid:  ', child.pid, '\n');

  child.on('error', function (error) {
    console.error('CHILD ERROR:', error.stack);
  });

  child.on('message', function (message) {
    exports.processChildMessage(message.toString());
  });

  child.on('exit', function (code) {
    console.log('PROCESS EXIT CODE: ', code);
    console.green('\nclean exit, waiting for changes...');
  });

  child.stdout && child.stdout.on('data', function(data) {
    console.log(data.toString().replace(/\n$/, ''));
  });

  child.stderr && child.stderr.on('data', function(data) {
    console.error(data.toString().replace(/\n$/, ''));
  });
};

exports.processChildMessage = function processChildMessage (event) {
  var parts       = event.split('::');
  var messageType = parts.shift();

  switch (messageType) {
    case message.MODULE_CHANGE:
      var changed  = parts.shift();
      var scripts     = watcher[changed];

      scripts.forEach(function (scriptPath) {
        var options     = childs[scriptPath].options;

        if (!options.restarting) {
          console.log(process.pid, 'RESTARTS:', scriptPath, 'because of', changed);
          options.restarting = true;

          // add changed script path
          options.becauseOf = changed;

          // kill child process
          childs[scriptPath].process.kill();

          // respawn script
          exports.spawn(scriptPath, options);
          options.restarting = false;
        }
      });
      break;

    case message.REQUIRE_ERROR:
      var scriptPath  = parts.shift();
      var stack       = parts.shift();
      console.ered(process.pid, 'ERROR:', scriptPath, '=>', stack);
      break;

    case message.REGISTER_MODULE:
      var script   = parts.shift();
      var required = parts.shift();

      if (!watcher[required]) {
        watcher[required] = [];
      }

      if (watcher[required].indexOf(script) < 0) {
        watcher[required].push(script)
      }

      if (!watches[required]) {
        console.log(process.pid, 'WATCHES:', script, '=>', required);
        watches[required] = fs.watch(required, function (event) {
          if (event === 'rename' || event === 'change') {
            // TODO restart the application
            exports.processChildMessage(message.moduleChange(required));
          }

          if (event === 'rename') {
            // close previous watcher
            watches[required].close();
            delete watches[required];

            // file has changed - reset watcher
            exports.processChildMessage(message.registerModule(script, required));
          }
        });
      }
      break;
  }
};
