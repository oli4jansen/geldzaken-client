(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .controller('CreateGroupController', CreateGroupController);

  /** @ngInject */
  function CreateGroupController($state, groupService) {
    var vm = this;

    vm.group = {name: ''};

    vm.create = function () {
      var group = new groupService.Group({ name: vm.group.name });
      group.$save(function(result) {
        $state.go('private.group.members', { id: result.id })
      });
    };
  }
})();
