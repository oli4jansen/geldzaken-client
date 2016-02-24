(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .controller('EntryController', EntryController);

  /** @ngInject */
  function EntryController($state, authentication, localize) {
    var vm = this;
    vm.working = true;
    vm.status = localize('Looking for credentials..');

    authentication.processSavedCredentials(function (working) {
      if (!working) {
        vm.working = false;
      vm.status = localize('No valid credentials found.');
      $state.go('public.login');
      } else {
      vm.status = localize('Validating your credentials with our server..');
      }
    });
  }
})();
