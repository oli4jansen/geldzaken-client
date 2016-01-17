(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .controller('GroupSettingsController', GroupSettingsController);

  /** @ngInject */
  function GroupSettingsController($state, $mdDialog, groupService, memberService, group, localize) {
    var vm = this;

    vm.group = group;

    vm.save = function () {
      vm.group.$update(function () {
        $mdDialog.show(
          $mdDialog.alert()
            .clickOutsideToClose(true)
            .title(localize('Settings were saved!'))
            .ariaLabel('Setting Confirmation')
            .ok(localize('Okay!'))
        );
        $state.reload();
      }, function (data) {
        throw new Error(data.message);
      });
    };

    vm.leave = function () {
      memberService.Member.delete({ group: group.id }, function () {
        $mdDialog.show(
          $mdDialog.alert()
            .clickOutsideToClose(true)
            .title(localize('Left group!'))
            .ariaLabel('Left Group Confirmation')
            .ok(localize('Okay!'))
        );

        $state.go('private.main');
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
    };

  }

})();
