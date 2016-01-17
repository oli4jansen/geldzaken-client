(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .controller('LogoutController', LogoutController);

  /** @ngInject */
  function LogoutController(authentication) {
    authentication.logout();
  }
})();
