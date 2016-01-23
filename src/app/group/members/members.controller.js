(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .controller('MembersController', MembersController)
    .controller('InviteMemberController', InviteMemberController);

  /** @ngInject */
  function MembersController($mdDialog, $mdMedia, $state, $stateParams, groupService, userService, memberService, group, balanceCalculator, localize) {
    var vm = this;

    vm.group = group;

    vm.showInviteMember = function ($event) {
      $mdDialog.show({
        controller: InviteMemberController,
        controllerAs: 'vm',
        templateUrl: 'app/group/members/inviteMember.html',
        clickOutsideToClose: true
      })
      .then(function(member) {
        memberService.Member.save({ group: group.id }, member, function () {
          $mdDialog.show(
            $mdDialog.alert()
              .clickOutsideToClose(true)
              .title(localize('Member was added!'))
              .textContent(localize('But won\'t be visible until he/she confirms.'))
              .ariaLabel('Invitation Confirmation')
              .ok(localize('Okay!'))
          );
        }, function (data) {
          $mdDialog.show(
            $mdDialog.alert()
              .clickOutsideToClose(true)
              .title(data.data)
              .ariaLabel('Invitation Error')
              .ok(localize('Okay!'))
          );
        });
      });
    };

    var balances = balanceCalculator.calculate(group.members, group.payments);

    vm.group.members.forEach(function (member) {
      member.balance = balances[member.email];
    });

    vm.openMenu = function($mdOpenMenu, ev) {
      $mdOpenMenu(ev);
    };

    vm.sorting = '-balance';
  }

  /** @ngInject */
  function InviteMemberController($mdDialog) {
    var vm = this;
    vm.email = '';

    vm.cancel = function() {
      $mdDialog.cancel();
    };

    vm.invite = function() {
      $mdDialog.hide({ email: vm.email });
    };
  }
})();
