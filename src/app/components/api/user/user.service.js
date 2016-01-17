(function() {
  'use strict';

  angular
      .module('geldzakenAngular')
      .service('userService', userService);

  /**
   * @name userService
   * @desc Communicates to the API about the user.
   */
  /** @ngInject */
  function userService($http, authentication, api, localStorageService) {
    var service = this;

    /**
     * @name signup
     * @desc Asks the server to create a new user
     * @param {Object} user - A user object containing the email, password, name and bankAccount
     * @param {Function} callback - Function to be called when signup was successfull
     */
    service.signup = function (user, callback) {
      // Stuur het emailadres en wachtwoord naar /login
      $http.post(api.public + '/signup', {
        email: user.email,
        password: user.password,
        name: user.name,
        bankAccount: user.bankAccount
      })
      .success(callback)
      .error(function (data) {
        throw new Error(data);
      });
    };

    /**
     * @name update
     * @desc Asks the server to update the current user
     * @param {Object} user - A user object containing the password, name and bankAccount
     * @param {Function} callback - Function to be called when update was successfull
     */
    service.update = function (user, callback) {
      // Stuur het emailadres en wachtwoord naar /login
      $http.put(api.private + '/users/' + service.me().email, user)
      .success(function (data) {
        localStorageService.set('me', data);
        callback();
      })
      .error(function () {
        throw new Error('Can\'t save settings!')
      });
    };

    /**
     * @name delete
     * @desc Asks the server to delete the current user
     */
    service.delete = function () {
      $http.delete(api.private + '/users/' + service.me().email)
      .success(function () {
        authentication.logout();
      })
      .error(function () {
        throw new Error('Can\'t delete account!')
      });
    };

    service.me = function () {
      return localStorageService.get('me');
    };

    return service;
  }

})();
