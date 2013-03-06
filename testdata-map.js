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