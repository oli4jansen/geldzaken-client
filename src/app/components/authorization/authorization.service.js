(function() {
  'use strict';

  angular
      .module('geldzakenAngular')
      .service('authorization', authorization);

  /** @ngInject */
  function authorization($rootScope, $state, localStorageService) {
    /*
    Regelt de authorization van pagina's. Dit betekent dat hier bijgehouden
    wordt of de gebruiker pagina's mag bekijken.
    */

    var service = this;

    service.authorized = false;

    service.clear = function () {
      service.authorized = false;
    };

    service.go = function (targetState, params) {
      params = params || {};
      service.authorized = true;
      $state.go(targetState, params);
    };

    service.listenForStateChange = function () {
      service.listener = $rootScope.$on('$stateChangeStart', service.stateChange)
    }

    service.stateChange = function (event, toState, toParams) {
      if (!service.authorized && toState.authorized) {
        // Zorg ervoor dat de controller etc niet geinvoked worden
        event.preventDefault();
        // Sla op welke pagina de gebruiker wilde zien
        localStorageService.set('redirectTo', { state: toState.name, params: toParams });
        $state.go('public.entry');
      }
    };

    return service;
  }

})();
