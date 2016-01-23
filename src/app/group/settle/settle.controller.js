(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .controller('SettleController', SettleController);

  /** @ngInject */
  function SettleController($http, $state, api, $mdDialog, groupService, group, localize) {
    var vm = this;

    vm.group = group;
    vm.settled = false;

    vm.settle = function (ev) {
      var confirm = $mdDialog.confirm()
            .title(localize('Are you sure?'))
            .textContent(localize('Settling a group cannot be reverted.'))
            .ariaLabel(localize('Confirm'))
            .targetEvent(ev)
            .ok(localize('Settle'))
            .cancel(localize('Cancel'));
      $mdDialog.show(confirm).then(function() {
        vm.settled = true;
        $http.get(api.private + '/groups/' + group.id + '/settle')
        .success(function () {
          vm.settled = false;
          $mdDialog.show($mdDialog.alert()
            .title(localize('Group was settled!'))
            .ariaLabel(localize('Confirmation'))
            .ok(localize('Okay!'))
          );
          $state.reload();
        })
        .error(function (data) {
          $mdDialog.show($mdDialog.alert()
            .title(localize('Could not settle.'))
            .textContent(localize(data))
            .ariaLabel('Alert')
            .ok(localize('Okay!'))
          );
        });
      });
    };

  }

})();
