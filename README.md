# testdata-generator

> Creates trees of JSON data to be used for mocking HTTP requests from real data in unit tests

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install testdata-generator --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('testdata-generator');
```

## The "testdata" task

### Overview
In your project's Gruntfile, add a section named `testdata` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  testdata: {
    options: {
      config: 'testdata-map.js or location of map config',
      target: 'testdata.js or the destination of the output',
      server: 'default server to pull data from, defaults to localhost'
    },
    your_target: {
      users: ['driggins', 'HopeZ', 'Any other users to generate']
    },
  },
})
```

### Usage Examples

#### Test map
This is a comprehensive example, demonstrating all of the features used in one map.

```js
var refdataSize = 1;

function createSearchAddress(path) {
  return function (node) {
    return node.common.GET.search.data + path;
  }
}

module.exports = {
  common: {
    GET: {
      me: '/api/users/me',

      search: '/api/search/nextavailableserver',

      refData: {
        divisions: createSearchAddress('division/_search?size=' + refdataSize),
        networks: createSearchAddress('network/_search?size=' + refdataSize),
        demographics: createSearchAddress('demographic/_search?size=' + refdataSize),
        properties: createSearchAddress('property/_search?size=' + refdataSize),
        rateCardTypes: createSearchAddress('ratecardtype/_search?size=' + refdataSize),
        revenueTypes: createSearchAddress('revenuetype/_search?size=' + refdataSize),
        productCategories: createSearchAddress('productcategory/_search?size=' + refdataSize),
        priceBreaks: createSearchAddress('pricebreak/_search?size=' + refdataSize),
        sellingPeriods: createSearchAddress('sellingperiod/_search?size=' + refdataSize)
      },

      brandSearch: {
        address: function (node) {
          return node.common.GET.search.data + 'division/_search?size=1';
        }
      }
    }
  },

  dealHeader: {
    POST: {
      newDeal: '/api/deal'
    }
  }
};
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
0.1.1 - Initial release
