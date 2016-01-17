(function() {
  'use strict';

  angular
      .module('geldzakenAngular')
      .service('errorHandler', errorHandler);

  /** @ngInject */
  function errorHandler($mdDialog, localize) {
    var service = this;

    service.handle = function (error) {
      $mdDialog.show(
        $mdDialog.alert()
          .clickOutsideToClose(true)
          .title(localize(error.message))
          .ariaLabel('Error')
          .ok(localize('Okay!'))
      );
    };

    return service;
  }

})();
