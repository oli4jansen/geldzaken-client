(function() {
  'use strict'

  angular
    .module('geldzakenAngular')
    .controller('GroupMainController', GroupMainController)

  /** @ngInject */
  function GroupMainController($scope, $rootScope, $mdDialog, $state, $stateParams, groupService, userService, group) {
    var vm = this

    vm.group = group

    vm.go = function (state) {
      $state.go('private.group.' + state, $stateParams)
    }

    vm.setCurrentTab = function (state) {
      if (state.data && state.data.selectedTab)
        vm.currentTab = state.data.selectedTab
    }

    vm.setCurrentTab($state.current)

    vm.listener = $rootScope.$on('$stateChangeSuccess', function(event, toState) {
      vm.setCurrentTab(toState)
    })

    $scope.$on('$destroy', function () {
      vm.listener()
    })
  }
})();
