(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .controller('PrivateController', PrivateController);

  /** @ngInject */
  function PrivateController($scope, $state, $rootScope, $mdSidenav) {
    var closeSideNavOnStateChange = $rootScope.$on('$stateChangeStart', function () {
      $mdSidenav('sidenav').close();
    });

    $scope.$on('$destroy', function () {
      closeSideNavOnStateChange();
    });

  }
})();
