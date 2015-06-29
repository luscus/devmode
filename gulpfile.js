
var runSequence   = require('run-sequence');
var gulp          = require('gulp-param')(require('gulp'), process.argv);
var mocha         = require('gulp-mocha');
var jshint        = require('gulp-jshint');
var stylish       = require('jshint-stylish');
var shrinkwrap    = require('gulp-shrinkwrap');
var istanbul      = require('gulp-istanbul');
var path          = require('path');
var npm           = require('npm');
var Q             = require('q');

var REPORT_PATH   = 'reports';
var COVERAGE_PATH = 'coverage';
var testFiles     = './test/**/*.spec.js';
var lintFiles     = ['./**/*.js', './**/*.json', '!./node_modules/**/*', '!./coverage/**/*'];
var commitFiles   = ['./package.json', './gulpfile.js', './npm-shrinkwrap.json', './reports/**/*'];

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch']);

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(lintFiles, ['lint', 'test']);
});


var bumpDeferred;

// Execute a version bump
gulp.task('bump', function (callback) {
  bumpDeferred = Q.defer();

  runSequence(
    //'coverage',
    //'shrinkwrap',
    //'bumpVersion',
    //'gitCommit',
    //'gitTag',
    'gitPush',
    //'gitPushTags',
    //'publish',
    function runSequenceEnd (error) {
      if (error) {
        console.log(error.message);
      } else {
        console.log('RELEASE FINISHED SUCCESSFULLY');
      }
      callback(error);
    }
  );

  return bumpDeferred.promise;
});


gulp.task('lint', function() {

  return gulp.src(lintFiles)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
});

gulp.task('test', ['lint'], function () {

  return gulp.src(testFiles, {read: false})
    .pipe(mocha({
      reporter: 'spec',
      bail: true
    }));
});

gulp.task('shrinkwrap', ['coverage'], function () {

  return gulp.src('./package.json')
    .pipe(shrinkwrap())
    .pipe(gulp.dest('./'));
});

var coberturaBadger = require('istanbul-cobertura-badger');
var coberturaFile = "coverage/cobertura-coverage.xml";

gulp.task('coverage', ['lint'], function () {
  var deferred = Q.defer();

  gulp.src(['./lib/**/*.js'])
    .pipe(istanbul()) // Covering files
    .pipe(istanbul.hookRequire()) // Force `require` to return covered files
    .on('finish', function () {
      gulp.src(testFiles)
        .pipe(mocha({
          reporter: 'dot',
          bail:     true
        }))
        .pipe(istanbul.writeReports({
          dir: COVERAGE_PATH,
          reporters: [ 'lcov', 'cobertura', 'json' ],
          reportOpts: {
            lcov:      {dir: COVERAGE_PATH},
            cobertura: {dir: COVERAGE_PATH},
            json:      {dir: REPORT_PATH, file: 'converage.json'}
          }
        }))
        .pipe(istanbul.enforceThresholds({
          thresholds: {
            global: {
              statements: 95,
              branches:   80,
              lines:      95,
              functions:  95
            }
          }
        }))
        .on('end', function () {

          // create coverage badge for README file
          coberturaBadger(coberturaFile, REPORT_PATH, function() {
            console.log("Badge created at " + REPORT_PATH + "/cobertura.svg");
            deferred.resolve();
          });
        });
    });

  return deferred.promise;
});


var git  = require('gulp-git');
var bump = require('gulp-bump');

// Update bower, component, npm at once:
gulp.task('bumpVersion', ['shrinkwrap'], function (patch, minor, major) {
  var type = 'patch';

  if (!minor && !major || minor && major) {
    // if no type has been specified,
    // or all types have been used
    // enforce patch
    patch = true;
  }

  if (minor && !patch) {
    type = 'minor';
  }

  if (major && !patch) {
    type = 'major';
  }

  return gulp.src(['./bower.json', './component.json', './package.json'])
    .pipe(bump({type:type}))
    .pipe(gulp.dest('./'));
});

var PACKAGE_VERSION;


gulp.task('commit', ['bumpVersion'], function gitCommit () {

  // reload package.json file
  delete require.cache[require.resolve('./package.json')];
  var packageInfo = require('./package.json');

  // build new version string
  PACKAGE_VERSION     = 'v' + packageInfo.version;

  return gulp.src(commitFiles)
    .pipe(git.commit(PACKAGE_VERSION, function gitCommitHandler () {
      if (err) throw err;
    }));
});

gulp.task('release', ['commit'], function gitCommit () {
  var deferred = Q.defer();

  // reload package.json file
  delete require.cache[require.resolve('./package.json')];
  var packageInfo = require('./package.json');

  // build new version string
  PACKAGE_VERSION     = 'v' + packageInfo.version;

  git.tag(PACKAGE_VERSION, PACKAGE_VERSION, function gitTagHandler(err) {
    if (err) {
      deferred.reject(err);
      return;
    }

    git.push('origin', 'master', {args: '--tags'}, function gitPushHandler(err) {
      if (err) {
        deferred.reject(err);
        return;
      }

      deferred.resolve();
    });
  });

  return deferred.promise;
});

gulp.task('publish', ['release'], function gitCommit () {
  var deferred = Q.defer();

  npm.load({}, function () {
    npm.commands.publish(function publishHandler (err) {
      if (err) {
        deferred.reject(err);
        return;
      }

      deferred.resolve();
    });
  });

  return deferred.promise;
});
