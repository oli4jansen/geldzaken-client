(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .directive('loadingIndicator', loadingIndicator);

  function loadingIndicator () {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/loadingIndicator/loadingIndicator.html',
      scope: {},
      controller: loadingIndicatorController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function loadingIndicatorController($scope, $rootScope) {
      var vm = this;

      var startLoading = function () {
        vm.show = true;
      };

      var stopLoading = function () {
        vm.show = false;
      };

      var stateChangeStart = $rootScope.$on('$stateChangeStart', startLoading)
        , stateChangeSuccess = $rootScope.$on('$stateChangeSuccess', stopLoading)
        , httpRequest = $rootScope.$on('http:request', startLoading)
        , httpResponse = $rootScope.$on('http:response', stopLoading)
        , httpResponseError = $rootScope.$on('http:responseError', stopLoading);

      var listeners = [stateChangeStart,
                       stateChangeSuccess,
                       httpRequest,
                       httpResponse,
                       httpResponseError];

      // Remove all listeners when the controller gets destroyed
      $scope.$on('$destroy', function() {
        listeners.forEach(function (listener) {
          listener();
        });
      });
    }

  }

})();
