(function() {
  'use strict';

  angular
      .module('geldzakenAngular')
      .service('authentication', authentication);

  /** @ngInject */
  function authentication($state, $http, localStorageService, authorization, api) {
    /*
    Regelt de authentication van gebruikers. Dit betekent dat hier bijgehouden
    en gecheckt wordt of de gebruiker echt is wie hij zegt dat hij is.
    */

    var service = this;

    // Wordt geroepen bij de first-load om te checken of er al een gebruiker ingelogd is.
    service.processSavedCredentials = function (callback) {
      if (getToken() && getKey()) {
        callback(true);
        authenticate();
      } else {
        callback(false);
      }
    };

    service.requestToken = function (email, password) {
      // Stuur het emailadres en wachtwoord naar /login
      $http.post(api.public + '/login', {
        email: email,
        password: password
      })
      .success(function (data) {
        // Sla de token en het emailadres op
        setToken(data);
        setKey(email);
        authenticate();
      })
      .error(function (data) {
        throw new Error(data);
      });
    };

    service.logout = function () {
      localStorageService.remove('x-access-token', 'x-key', 'me', 'redirectTo');
      authorization.clear();
      $state.go('public.login');
    };

    /* Private */

    var getToken = function () {
      return localStorageService.get('x-access-token');
    };

    var getKey = function () {
      return localStorageService.get('x-key');
    };

    var setToken = function (token) {
      localStorageService.set('x-access-token', token);
    };

    var setKey = function (key) {
      localStorageService.set('x-key', key);
    };

    var setHeaders = function () {
      $http.defaults.headers.common = {
        'x-access-token': getToken(),
        'x-key'         : getKey()
      };
    };

    var authenticate = function () {
      // Stel ze in als headers
      setHeaders();
      // Maak een request naar de private API
      $http.get(api.private + '/users/' + getKey())
      .success(function (data) {
        localStorageService.set('me', data);
        // Check of er een pagina is waar we heen moesten
        var redirectTo = localStorageService.get('redirectTo');
        if (redirectTo !== null) {
          // Zo ja, ga daar heen en verstuur de juiste params ook
          authorization.go(redirectTo.state, redirectTo.params)
        } else {
          authorization.go('private.main');
        }
      })
      .error(function (data) {
        service.logout();
        throw new Error(data);
      });
   };

    return service;
  }

})();
