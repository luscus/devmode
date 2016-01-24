/* jshint node:true */
/* jshint expr:true*/
/* global exports */

exports.brocken = function brocken () {
  throw new Error('I am brocken');
};

exports.brocken();
