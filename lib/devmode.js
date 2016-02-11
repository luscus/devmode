'use strict';

var parentScriptPath = arguments['1'].main.filename;

// load the module locator
require('./require/locator').init(parentScriptPath);

// load native require patch
require('./require/patch');

/**
 * List of stage names that activate the devmode
 *
 * @private
 * @type {string[]}
 */
var DEVMODE_STAGE_NAMES    = ['LAB', 'LOCAL', 'TEST'];

/**
 * Name of the environment variable holding the stage name
 *
 * @type {string}
 * @default NODE_ENV
 */
exports.STAGE_ENV_VARIABLE_NAME = 'NODE_ENV';

/**
 * Returns true or false depending on the environment stage name:
 * if process.env.<STAGE_ENV_VARIABLE_NAME> equals 'LAB' or 'LOCAL',
 * devmode will be active
 *
 * @returns {boolean}
 */
exports.isActive = function isActive () {
  var stageName = process.env[exports.STAGE_ENV_VARIABLE_NAME] &&
                    process.env[exports.STAGE_ENV_VARIABLE_NAME].toUpperCase();

  // if stage name is listed, return true
  return (-1 < DEVMODE_STAGE_NAMES.indexOf(stageName));
};

// Active status should be prompted once for the main package
// check whether or not devmode is active
// check if dependency has not been required
if (exports.isActive()) {
  console.log('     DEVMODE ACTIVE: ' + parentScriptPath);
}
