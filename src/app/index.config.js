(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .config(config);

  /** @ngInject */
  function config($provide, $httpProvider, $logProvider, $mdThemingProvider, localStorageServiceProvider) {
    var moneyGreenMap = $mdThemingProvider.extendPalette('green', {
      '300': 'B5FED3',
      '500': '1FA056',
      '600': '3CB97B',
      '700': '10733B',
      'contrastDefaultColor': 'light'
    });

    $mdThemingProvider.definePalette('moneyGreen', moneyGreenMap);
    $mdThemingProvider.theme('default')
      .primaryPalette('moneyGreen')
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
