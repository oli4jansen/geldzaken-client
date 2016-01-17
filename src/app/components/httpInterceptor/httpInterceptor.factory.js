(function() {
  'use strict';

  angular
      .module('geldzakenAngular')
      .factory('httpInterceptor', httpInterceptor);

  /** @ngInject */
  function httpInterceptor($rootScope, $q) {
    return {
      request: function (config) {
        $rootScope.$broadcast('http:request')
        return config
      },
      response: function (response) {
        $rootScope.$broadcast('http:response')
        return response
      },
      responseError: function (responseError) {
        $rootScope.$broadcast('http:responseError', responseError)
        return $q.reject(responseError);
      }
    }
  }

})();
