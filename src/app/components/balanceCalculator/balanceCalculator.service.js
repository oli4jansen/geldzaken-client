(function() {
  'use strict';

  angular
      .module('geldzakenAngular')
      .service('balanceCalculator', balanceCalculator);

  /** @ngInject */
  function balanceCalculator(lodash) {
    var service = this;

    service.calculate = function (members, payments) {
      var balances = {};
      // Initialize all balances to zero
      lodash.forEach(members, function (m) {
        balances[m.email] = 0
      });

      // Lets look at all payments in this group
      for (var i = 0; i < payments.length; i++ ) {
        // Save current payment as 'payment'
        var payment = payments[i];
        // Add all weights of the payment-participants together
        // This is the factor by which we divide the total amount to find the share.
        var sharedBy = lodash.sum(lodash.map(payment.participants), function (p) {
          return p.paymentParticipation.weight;
        });
        // Calculate the share per weight.
        var share = payment.amount / sharedBy;

        // For each participant..
        for (var j = 0; j < payment.participants.length; j++ ) {
          var participant = payment.participants[j];
          var weight = participant.paymentParticipation.weight;
          // Subtract the share from all payment participants
          balances[participant.email] -= share * weight;
        }
        // Add the payed amount to the group member that payed.
        balances[payment.payedBy.email] += payment.amount;
      }

      return balances;
    };

    return service;
  }

})();
