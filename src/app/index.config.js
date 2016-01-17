(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .config(config);

  /** @ngInject */
  function config($provide, $httpProvider, $logProvider, $mdThemingProvider, localStorageServiceProvider) {
    $mdThemingProvider.theme('default')
    .primaryPalette('indigo')
    .accentPalette('grey');

    $provide.decorator("$exceptionHandler", function($delegate, $injector) {
      return function (exception) {
        $injector.get('errorHandler').handle(exception);
      };
    });

    $httpProvider.interceptors.push('httpInterceptor');

    // Enable log
    $logProvider.debugEnabled(true);

    // Set prefix for localStorage
    localStorageServiceProvider.setPrefix('geldzaken');
    localStorageServiceProvider.setStorageCookie(100, '/');
  }

})();
