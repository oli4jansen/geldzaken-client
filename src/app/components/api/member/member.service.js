(function() {
  'use strict';

  angular
      .module('geldzakenAngular')
      .service('memberService', memberService);

  /**
   * @name memberService
   * @desc Wrapper for the group/members resource
   */
  /** @ngInject */
  function memberService($resource, $http, api) {
    this.Member = $resource(api.private + '/groups/:group/members', {group: "@group"});

    this.confirm = function (group, callback) {
      $http.put(api.private + '/groups/' + group + '/members')
      .success(function (data) {
        callback();
      })
      .error(function () {
        throw new Error('Can\'t confirm membership.')
      });
    }

    return {
      Member: this.Member,
      confirm: this.confirm
    };
  }

})();
