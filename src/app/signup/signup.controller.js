(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .controller('SignupController', SignupController);

  /** @ngInject */
  function SignupController($state, $mdDialog, userService, localize) {
    var vm = this;

    vm.user = {
      email: '',
      password: '',
      name: '',
      bankAccount: ''
    };

    vm.signup = function () {
      userService.signup(vm.user, function () {
        $mdDialog.show(
          $mdDialog.alert()
            .clickOutsideToClose(true)
            .title(localize('Signed up!'))
            .textContent(localize('You can now log in.'))
            .ariaLabel('Signup Confirmation')
            .ok(localize('Okay!'))
        );
        $state.go('public.login');
      });
    };
  }
})();
