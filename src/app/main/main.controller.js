(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($state, $mdDialog, $mdMedia, balanceCalculator, userService, memberService, groups, localize) {
    var vm = this;
    vm.groups = groups;
    vm.inactiveGroups = [];
    vm.sorting = 'name';
    vm.me = userService.me();

    for (var i = 0; i < vm.groups.length; i++) {
      if (!vm.groups[i].membership.active) {
        vm.inactiveGroups.push(vm.groups[i]);
      }
    }

    for (var j = 0; j < vm.groups.length; j++) {
      var balances = balanceCalculator.calculate(vm.groups[j].members, vm.groups[j].payments);
      vm.groups[j].balance = balances[vm.me.email];
    }

    vm.show = function (group) {
      $state.go('private.group.payments', { id: group.id });
    };

    vm.openMenu = function ($mdOpenMenu, ev) {
      $mdOpenMenu(ev);
    };

    vm.confirm = function (group) {
      memberService.confirm(group.id, function () {
        vm.show(group);
      });
    }

    vm.reject = function (group) {
      memberService.Member.delete({ group: group.id }, function () {
        $state.reload();
      }, function (res) {
        $mdDialog.show(
          $mdDialog.alert()
            .clickOutsideToClose(true)
            .title(localize('Could not leave group.'))
            .textContent(res.data)
            .ariaLabel('Can\'t leave group')
            .ok(localize('Okay!'))
        );
      });
    }
  }
})();
