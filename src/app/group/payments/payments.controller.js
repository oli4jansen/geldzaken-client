(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .controller('PaymentsController', PaymentsController)
    .controller('CreatePaymentController', CreatePaymentController)
    .controller('PaymentOptionsController', PaymentOptionsController)
    .controller('UpdatePaymentController', UpdatePaymentController);

  /** @ngInject */
  function PaymentsController($mdDialog, $mdMedia, $state, $stateParams, paymentService, group, localize) {
    var vm = this;

    vm.group = group;

    vm.showCreatePayment = function ($event) {
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
      $mdDialog.show({
        controller: CreatePaymentController,
        controllerAs: 'vm',
        templateUrl: 'app/group/payments/createPayment.html',
        targetEvent: $event,
        clickOutsideToClose: true,
        fullscreen: useFullScreen,
        locals: {
          group: vm.group
        }
      })
      .then(function (payment) {
        paymentService.Payment.save({ group: vm.group.id }, payment, function () {
          $mdDialog.show(
            $mdDialog.alert()
              .clickOutsideToClose(true)
              .title(localize('Payment was added!'))
              .ariaLabel('Payment Confirmation')
              .ok(localize('Okay!'))
          );
          $state.reload();
        }, function (data) {
          throw new Error(data);
        });
      })
    };

    vm.showPaymentOptions = function (payment) {
      $mdDialog.show({
        templateUrl: 'app/group/payments/paymentOptions.html',
        clickOutsideToClose:true,
        controller: PaymentOptionsController,
        controllerAs: 'vm',
        locals: {
          payment: payment,
          group: group
        }
      })
    }

    vm.openMenu = function($mdOpenMenu, ev) {
      $mdOpenMenu(ev);
    };

    vm.sorting = '-createdAt';

    vm.participants_to_string = function (participants) {
      var names = [];
      for (var i = 0; i < participants.length; i++) {
        var p = participants[i];
        var weight = p.paymentParticipation.weight;
        if (weight > 1) {
          names.push(p.name + ' (' + weight + 'x)');
        } else {
          names.push(p.name);
        }
      }

      // Maak er een zin van.
      if (names.length == 1)
        return names[0];
      var last = names.pop();
      return names.join(', ') + ' and ' + last;
    };

    vm.go = function (state) {
      $state.go('^.'+state, $stateParams);
    };
  }

  /** @ngInject */
  function CreatePaymentController($mdDialog, $timeout, $q, group, userService, lodash) {
    var vm = this;
    vm.group = group;
    vm.payment = {
      description: '',
      participants: [],
      payedBy: userService.me().email
    };
    vm.weightSum = 0;

    vm.participants = (function () {
      var participants = lodash.map(group.members, function (p) {
        return {
          email: p.email,
          name: p.name,
          weight: 0
        }
      });
      return participants;
    })();

    vm.balanceChange = function (participant) {
      if (vm.weightSum == 0) return 0;
      var share = -1 * (vm.payment.amount / vm.weightSum);
      if (participant.email == vm.payment.payedBy) {
        return share * participant.weight + vm.payment.amount;
      } else {
        return share * participant.weight;
      }
    };

    vm.increaseAllParticipants = function () {
      vm.participants.forEach(vm.increaseParticipant);
    };

    vm.resetAllParticipants = function () {
      vm.participants.forEach(function (p) {
        p.weight = 0;
      });
      vm.weightSum = 0;
    };

    vm.increaseParticipant = function (participant) {
      vm.weightSum++;
      participant.weight++;
    };

    vm.decreaseParticipant = function (participant) {
      if (participant.weight > 0) {
        participant.weight--;
        vm.weightSum--;
      }
    };

    vm.cancel = function() {
      $mdDialog.cancel();
    };

    vm.create = function() {
      vm.participants.forEach(function (p) {
        if (p.weight > 0) {
          vm.payment.participants.push({
            email: p.email,
            weight: p.weight
          });
        }
      });

      $mdDialog.hide(vm.payment);
    };
  }

  /** @ngInject */
  function PaymentOptionsController($mdDialog, $mdMedia, $state, localize, payment, group, paymentService) {
    var vm = this;

    vm.update = function () {
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));

      $mdDialog.show({
        controller: UpdatePaymentController,
        controllerAs: 'vm',
        templateUrl: 'app/group/payments/updatePayment.html',
        clickOutsideToClose: true,
        fullscreen: useFullScreen,
        locals: {
          group: group,
          payment: payment
        }
      })
      .then(function (data) {
        paymentService.Payment.update({ group: group.id, id: payment.id }, data, function () {
          $state.reload();
        }, function (data) {
          throw new Error(data);
        });
      })
    };

    vm.delete = function () {
      $mdDialog.show($mdDialog.confirm()
        .title(localize('Are you sure?'))
        .ariaLabel('Delete Payment?')
        .ok(localize('Delete'))
        .cancel(localize('Cancel')))
      .then(function() {
        paymentService.Payment.delete({ group: group.id, id: payment.id }, function () {
          $state.reload();
        }, function (data) {
          throw new Error(data);
        });
      });
    };

  }

  /** @ngInject */
  function UpdatePaymentController($mdDialog, $timeout, $q, group, payment, userService, lodash) {
    var vm = this;
    vm.group = group;
    vm.payment = {
      description: payment.description,
      amount: payment.amount,
      payedBy: payment.payedBy.email
    }

    vm.participants = (function () {
      var participants = lodash.map(group.members, function (p) {
        var q = lodash.find(payment.participants, function (x) {
          return x.email == p.email;
        });
        return {
          email: p.email,
          name: p.name,
          weight: lodash.get(q, 'paymentParticipation.weight', 0)
        }
      });
      return participants;
    })();

    vm.weightSum = lodash.sum(lodash.map(vm.participants, function (p) {
      return p.weight
    }));

    vm.balanceChange = function (participant) {
      if (vm.weightSum == 0) return 0;
      var share = -1 * (vm.payment.amount / vm.weightSum);
      if (participant.email == vm.payment.payedBy) {
        return share * participant.weight + vm.payment.amount;
      } else {
        return share * participant.weight;
      }
    };

    vm.increaseAllParticipants = function () {
      vm.participants.forEach(vm.increaseParticipant);
    };

    vm.resetAllParticipants = function () {
      vm.participants.forEach(function (p) {
        p.weight = 0;
      });
      vm.weightSum = 0;
    };

    vm.increaseParticipant = function (participant) {
      vm.weightSum++;
      participant.weight++;
    };

    vm.decreaseParticipant = function (participant) {
      if (participant.weight > 0) {
        participant.weight--;
        vm.weightSum--;
      }
    };

    vm.cancel = function() {
      $mdDialog.cancel();
    };

    vm.save = function() {
      vm.payment.participants = [];
      vm.participants.forEach(function (p) {
        if (p.weight > 0) {
          vm.payment.participants.push({
            email: p.email,
            weight: p.weight
          });
        }
      });

      $mdDialog.hide(vm.payment);
    };
  }
})();
