/*
 * testdata-generator
 * https://github.com/dariusriggins/testdata-generator
 *
 * Copyright (c) 2013 Darius Riggins
 * Licensed under the MIT license.
 */

'use strict';

var http= require('http');
var _ = require('lodash');
var async = require('async');
var httpJson = require('./http-json');
var pd = require('pretty-data').pd;

module.exports = function(grunt) {

  var server;

  grunt.registerMultiTask('testdata', 'Robust generator to create test data from real http requests.', function() {
    var options = this.options();
    var done = this.async();
    var output = {};
    var self = this;

    server = options.server || 'http://localhost';

    var map;

    try {
      /* For consumers */
      map = require('../../../' + this.files[0].src[0]);
    } catch (e) {
      /* For dev */
      map = require('../../../' + this.files[0].src[0]);
    }

    var process = processUser.call(self, output, map);

    process(function () {
      var result = options.transform(pd.json(output.result));
      grunt.file.write(self.files[0].dest, result);
      grunt.log.writeln('Generated file successfully!');
    });
  });

  function processUser(output, map) {
    var options = this.options();

    return function (callback) {
      grunt.log.debug('Processing options');
      var node = output.result = {};

      var headers = options.baseHeaders || {};
      headers = _.extend(headers, options.headers || {});

      httpJson.setHeaders(headers);

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

          if (!address) {
            node.data = [];
            grunt.log.debug('Empty result of function, setting data to empty array');
            return callback();
          }

          if (_.isObject(address)) {
            postData = address.data;
            address = address.address;
          }
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

      if (!currentServer && !address.match(/http/)) {
        currentServer = server;
      }

      httpJson.request(currentServer + address, method, postData, function (data) {
        node.address = currentServer + address;
        node.data = data;

        if (data && data.hits && data.hits.hits) {
          node.data = data.hits.hits;

          if (_.isArray(node.data) && node.data.length && node.data[0].fields) {
            node.data = _.map(node.data, function (item) {
              return item.fields;
            });
          } else if (_.isArray(node.data) && node.data.length && node.data[0]._source) {
            node.data = _.pluck(node.data, '_source');
          }
        } else if (node.data && node.data.responses) {
          node.data = _.flatten(_.map(node.data.responses, function (response) {
            return _.pluck(response.hits.hits, '_source');
          }));
        }

        callback();
      });

    }
  }

};