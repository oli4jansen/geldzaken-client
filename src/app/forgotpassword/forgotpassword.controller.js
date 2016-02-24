(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .controller('ForgotPasswordController', ForgotPasswordController);

  /** @ngInject */
  function ForgotPasswordController(userService, $state, $stateParams, $mdDialog, localize) {
    var vm = this;

    vm.email = $stateParams.email;
    vm.newPassword = '';
    vm.token = $stateParams.token;

    vm.reset = function () {
      userService.forgotPassword(vm.email, function () {
        $mdDialog.show(
          $mdDialog.alert()
            .clickOutsideToClose(true)
            .title(localize('You\'ve got mail!'))
            .textContent(localize('Use the link in the verification mail we sent to reset your password.'))
            .ariaLabel('Reset Confirmation')
            .ok(localize('Okay!'))
        );
      })
    }

    vm.setPassword = function () {
      if (!vm.newPassword) throw new Error('Wachtwoord mag niet leeg zijn.');
      userService.setNewPassword(vm.email, vm.newPassword, vm.token, function () {
        $mdDialog.show(
          $mdDialog.alert()
            .clickOutsideToClose(true)
            .title(localize('Password is set!'))
            .textContent(localize('You can now log in.'))
            .ariaLabel('Reset Confirmation')
            .ok(localize('Okay!'))
        );
        $state.go('public.login', { email: vm.email });
      });
    }

  }
})();
