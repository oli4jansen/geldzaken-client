(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .controller('SettingsController', SettingsController);

  /** @ngInject */
  function SettingsController($state, $mdDialog, userService, localize) {
    var vm = this;

    var me = userService.me();
    vm.settings = {
      email: me.email,
      name: me.name,
      bankAccount: me.bankAccount
    }
    vm.newPassword = '';

    vm.save = function () {
      if (vm.newPassword !== '') {
        vm.settings.password = vm.newPassword;
      }
      userService.update(vm.settings, function () {
        $mdDialog.show(
          $mdDialog.alert()
            .clickOutsideToClose(true)
            .title(localize('Settings were saved!'))
            .ariaLabel('Setting Confirmation')
            .ok(localize('Okay!'))
        );
      });
    };

    vm.delete = function () {
      userService.delete();
    }
  }
})();
