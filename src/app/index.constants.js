(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .constant('api', {
      public: 'http://192.168.10.126:8080',
      private: 'http://192.168.10.126:8080/private'
//      public: 'http://localhost:8080',
//      private: 'http://localhost:8080/private'
    })

})();
