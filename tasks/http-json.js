/*
 * testdata-generator
 * https://github.com/dariusriggins/testdata-generator
 *
 * Copyright (c) 2013 Darius Riggins
 * Licensed under the MIT license.
 */

'use strict';

var http= require('http');
var async = require('async');
var request = require('request');

module.exports = (function () {
  var defaultHeaders;

  return {
    setHeaders: function (headers) {
      defaultHeaders = headers;
    },

    request: function (address, method, data, callback) {
      var options = {
        method: method,
        json: true,
        headers: defaultHeaders,
        url: address,
        body: data
      };

      request(options, function (error, response, body) {
        callback(body);
      });
    }
  };
})();