(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .controller('MoreController', MoreController);

  /** @ngInject */
  function MoreController($state, $http, $mdDialog, api, groupService, memberService, group, localize) {
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
          vm.settled = false;
          $mdDialog.show($mdDialog.alert()
            .title(localize('Could not settle.'))
            .textContent(localize(data))
            .ariaLabel('Alert')
            .ok(localize('Okay!'))
          );
        });
      });
    };

    vm.save = function () {
      vm.group.$update(function () {
        $mdDialog.show(
          $mdDialog.alert()
            .clickOutsideToClose(true)
            .title(localize('Settings were saved!'))
            .ariaLabel('Setting Confirmation')
            .ok(localize('Okay!'))
        );
        $state.reload();
      }, function (data) {
        throw new Error(data.message);
      });
    };

    vm.leave = function () {
      memberService.Member.delete({ group: group.id }, function () {
        $mdDialog.show(
          $mdDialog.alert()
            .clickOutsideToClose(true)
            .title(localize('Left group!'))
            .ariaLabel('Left Group Confirmation')
            .ok(localize('Okay!'))
        );

        $state.go('private.main');
      }, function (res) {
        $mdDialog.show(
          $mdDialog.alert()
            .clickOutsideToClose(true)
            .title(localize('Could not leave group.'))
            .textContent(res.data)
            .ariaLabel('Can\'t leave group')
            .ok(localize('Okay!'))
        );
      });
    };

  }

})();
