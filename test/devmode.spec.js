'use strict';

require('chai').should();
var expect = require('chai').expect;

var assert  = require("assert");
var devmode = require('../lib/devmode');
var pathLib = require('path');
var root    = require('package.root');

// get the package's parent directory
var PARENT  = root.path.substring(0,root.path.lastIndexOf(pathLib.sep)) + pathLib.sep;

// Check that no Status output is shown when DEVMODE is inactive
// this is imperative to get the 100% coverage
process.env[devmode.STAGE_ENV_VARIABLE_NAME] = 'PROD';
delete require.cache[require.resolve('../lib/devmode')];
devmode = require('../lib/devmode');

// start tests
describe('devmode', function () {

  it('should have a property "STAGE_ENV_VARIABLE_NAME"', function () {
    devmode.should.have.property('STAGE_ENV_VARIABLE_NAME');
    devmode.STAGE_ENV_VARIABLE_NAME.should.be.an('string');
    devmode.STAGE_ENV_VARIABLE_NAME.should.equal('NODE_ENV');
  });

  it('should have a property "DEPENDENCY_PATH_PREFIX"', function () {
    devmode.should.have.property('DEPENDENCY_PATH_PREFIX');
    devmode.DEPENDENCY_PATH_PREFIX.should.be.an('string');
    devmode.DEPENDENCY_PATH_PREFIX.should.equal(pathLib.sep + '..' + pathLib.sep);
  });

  it('should have a method "isActive"', function () {
    devmode.should.have.property('isActive');
    devmode.isActive.should.be.an('function');
  });

  it('should have a method "getRequirePath"', function () {
    devmode.should.have.property('getRequirePath');
    devmode.getRequirePath.should.be.an('function');
  });

  describe('isActive method', function () {
    after(function(){
      // runs after all tests in this block
      process.env[devmode.STAGE_ENV_VARIABLE_NAME] = 'LOCAL';
    });

    var values = [
      {value: 'LAB', status:true},
      {value: 'LOCAL', status:true},
      {value: 'TEST', status:true},
      {value: 'PROD', status:false},
      {value: '', status:false},
      {value: null, status:false},
      {value: undefined, status:false},
      {value: {}, status:false},
      {value: [], status:false},
      {value: 1234, status:false}
    ];

    values.forEach(function pathIterator (test) {
      it('should return "' + test.status + '" for process.env.STAGE="' + test.value + '"', function () {
        process.env[devmode.STAGE_ENV_VARIABLE_NAME] = test.value;
        var status = devmode.isActive();

        assert.equal(status, test.status);
      });
    });

  });

  describe('active - getRequirePath method', function () {
    process.env[devmode.STAGE_ENV_VARIABLE_NAME] = 'LOCAL';

    var requirePaths = [
      {path:'dependency', changed:true},
      {path:'dependency.with.dots', changed:true},
      {path:'./local', changed:false},
      {path:'./local.json', changed:false},
      {path:'../parent', changed:false}
    ];

    requirePaths.forEach(function pathIterator (test) {
      it('should return "' + test.path + '" as ' + (test.changed ? 'absolute' : 'relative') + ' path', function () {
        var path = devmode.getRequirePath(test.path);

        assert.equal((path !== test.path), test.changed);

        if (test.changed) {
          assert.equal((path === PARENT + test.path), true);
        }
      });
    });
  });

  describe('inactive - getRequirePath method', function () {

    var requirePaths = [
      {path:'dependency', changed:false},
      {path:'dependency.with.dots', changed:false},
      {path:'./local', changed:false},
      {path:'./local.json', changed:false},
      {path:'../parent', changed:false}
    ];

    requirePaths.forEach(function pathIterator (test) {
      it('should return "' + test.path + '" as ' + (test.changed ? 'absolute' : 'relative') + ' path', function () {
        process.env[devmode.STAGE_ENV_VARIABLE_NAME] = 'PROD';
        var path = devmode.getRequirePath(test.path);

        assert.equal((path !== test.path), test.changed);

        if (test.changed) {
          assert.equal((path === PARENT + test.path), true);
        }
      });
    });
  });

  describe('require method', function () {
    after(function(){
      // runs after all tests in this block
      process.env[devmode.STAGE_ENV_VARIABLE_NAME] = 'LOCAL';
    });

    var values = [
      {value: 'LOCAL', dependency: 'mocha', status:true},
      {value: 'LOCAL', dependency: 'unknown', error: 'Cannot find module \'unknown\'', status:false},
      {value: 'LOCAL', dependency: '../test/throwErrorModule', error: 'Maximum call stack size exceeded', status:false}
    ];

    values.forEach(function pathIterator (test) {
      it('should ' + (test.status ? 'return Object' : 'throw Error') + ' for dependency "' + test.dependency + '"', function () {

        process.env[devmode.STAGE_ENV_VARIABLE_NAME] = test.value;

        if (test.status) {
          var result      = require(test.dependency);
          var dependency  = require(test.dependency);

          result.should.deep.equal(dependency);
        }
        else {
          expect(require.bind(require,test.dependency)).to.throw(test.error);
        }
      });
    });
  });
});
