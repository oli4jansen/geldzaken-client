(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .directive('toolbar', toolbar);

  function toolbar () {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/toolbar/toolbar.html',
      controller: ToolbarController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function ToolbarController($mdSidenav, authorization) {
      var vm = this;
      vm.toggleSidenav = function () {
        $mdSidenav('sidenav')
        .toggle();
      };

      vm.authorized = function () {
        return authorization.authorized;
      };
    }
  }

})();
