(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .controller('LoginController', LoginController);

  /** @ngInject */
  function LoginController(authorization, authentication) {
    var vm = this;

    vm.user = {email: '', password: ''}

    vm.login = function () {
      authentication.requestToken(vm.user.email, vm.user.password);
    };

    authentication.processSavedCredentials();
  }
})();
