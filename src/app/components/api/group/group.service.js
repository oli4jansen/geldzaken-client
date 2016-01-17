(function() {
  'use strict';

  angular
      .module('geldzakenAngular')
      .service('groupService', groupService);

  /**
   * @name groupService
   * @desc Wrapper for the groups resource
   */
  /** @ngInject */
  function groupService($resource, api) {
    this.Group = $resource(api.private + '/groups/:group', {group: "@id"}, {
      update: {
        method: 'PUT'
      }
    });

    return {
      Group: this.Group
    };
  }

})();
