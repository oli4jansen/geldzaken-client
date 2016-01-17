(function() {
  'use strict';

  angular
      .module('geldzakenAngular')
      .service('paymentService', paymentService);

  /**
   * @name paymentService
   * @desc Wrapper for the group/payment resource
   */
  /** @ngInject */
  function paymentService($resource, api) {
    this.Payment = $resource(api.private + '/groups/:group/payments', {group: "@group"});

    return {
      Payment: this.Payment
    };
  }

})();
