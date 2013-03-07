/*
 * testdata-generator
 * https://github.com/dariusriggins/testdata-generator
 *
 * Copyright (c) 2013 Darius Riggins
 * Licensed under the MIT license.
 */

'use strict';

var http= require('http');
var _ = require('underscore');
var async = require('async');
var httpJson = require('./http-json');
var pd = require('pretty-data').pd;

module.exports = function(grunt) {

  var server;

  grunt.registerMultiTask('testdata', 'Your task description goes here.', function() {
    var options = this.options();
    var done = this.async();
    var output = {};
    var self = this;

    server = options.server || 'http://localhost';

    var map;

    try {
      /* For consumers */
      map = require('../../../' + this.files[0].src);
    } catch (e) {
      /* For dev */
      map = require('../' + this.files[0].src);
    }

    var users = _.map(this.data.users, function(user) {
      return processUser(user, output, map);
    });

    async.series(users, function () {
      var testStatement = 'window.testData = ';
      grunt.file.write(self.files[0].dest, testStatement + pd.json(output));
      grunt.log.writeln('Generated file successfully!');
    });
  });

  function processUser(user, output, map) {
    return function (callback) {
      grunt.log.debug('Processing ' + user);
      var node = output[user] = {};
      httpJson.setHeaders({ 'X-Impersonate': user });

      var sections = _.map(map, function (section, name) {
        return processSection(section, name, node);
      });

      async.series(sections, callback);
    };
  }

  function processSection(section, name, output) {
    return function (callback) {
      grunt.log.debug('Section: ' + name);
      var node = output[name] = {};

      var methods = _.map(section, function (body, method) {
        return processMethod(method, body, node, output);
      });

      async.series(methods, callback);
    }
  }

  function processMethod(method, body, output, outerNode) {
    return function (callback) {
      var node = output[method] = {};

      var entries = _.map(body, function (entry, name) {
        return processEntry(name, entry, node, method, outerNode);
      });

      async.series(entries, callback);
    }
  }

  function processEntry(name, entry, output, method, outerNode) {
    return function (callback) {
      grunt.log.debug('Processing ' + name);

      var currentServer = server;
      var node = output[name] = {};
      var address = entry.address;
      var postData;

      if (_.isFunction(entry.address) || _.isFunction(entry)) {
        if (entry.address) {
          address = entry.address(outerNode);
        } else {
          address = entry(outerNode);
        }
        currentServer = '';
        grunt.log.debug('Transformed address is ' + address);
      }

      if (_.isString(entry)) {
        address = entry;
        entry = { address: address };
      } else if (!address && !entry.address) {
        var subNodes = _.map(entry, function (subNode, subKey) {
          if (!subNode) {
            return function (subCallback) {
              subCallback();
            };
          }
          return processEntry(subKey, subNode, node, method, outerNode);
        });

        return async.series(subNodes, callback);
      }

      httpJson.request(currentServer + address, method, postData, function (data) {
        node.address = currentServer + address;
        node.data = data;

        callback();
      });

    }
  }

};
