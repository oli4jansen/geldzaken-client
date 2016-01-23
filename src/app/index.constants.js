(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .constant('api', {
//      public: 'http://localhost:8080',
//      private: 'http://localhost:8080/private'
      public: 'https://geldzaken.herokuapp.com',
      private: 'https://geldzaken.herokuapp.com/private'
    })

})();
