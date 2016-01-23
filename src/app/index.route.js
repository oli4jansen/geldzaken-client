(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('public', {
      templateUrl: 'app/public/public.html',
      controller: 'PublicController as vm',
      anonymous: true
    })
    .state('public.entry', {
      url: '/entry',
      templateUrl: 'app/entry/entry.html',
      controller: 'EntryController as vm',
      resolve: {
        $title: function(localize) {
          return localize('Authenticating');
        }
      }      
    })
    .state('public.login', {
      url: '/login',
      templateUrl: 'app/login/login.html',
      controller: 'LoginController as vm',
      params: {
        email: ''
      },
      resolve: {
        $title: function(localize) {
          return localize('Log in');
        }
      }      
    })
    .state('public.signup', {
      url: '/signup',
      templateUrl: 'app/signup/signup.html',
      controller: 'SignupController as vm',
      resolve: {
        $title: function(localize) {
          return localize('Sign up');
        }
      }      
    })
    .state('public.forgotpassword', {
      url: '/forgot-password/:email/:token',
      templateUrl: 'app/forgotpassword/forgotpassword.html',
      controller: 'ForgotPasswordController as vm',
      resolve: {
        $title: function(localize) {
          return localize('Forgot password');
        }
      }      
    })
    .state('public.logout', {
      url: '/logout',
      templateUrl: 'app/logout/logout.html',
      controller: 'LogoutController as ctrl',
      resolve: {
        $title: function(localize) {
          return localize('Log out');
        }
      }      
    })

    .state('private', {
      templateUrl: 'app/private/private.html',
      controller: 'PrivateController as vm',
      authorized: true
    })
    .state('private.main', {
      url: '/overview',
      templateUrl: 'app/main/main.html',
      controller: 'MainController as vm',
      authorized: true,
      resolve: {
        groups: function ($stateParams, groupService) {
          return groupService.Group.query().$promise;
        },
        $title: function(localize) {
          return localize('Overview');
        }
      }
    })
    .state('private.settings', {
      url: '/settings',
      templateUrl: 'app/settings/settings.html',
      controller: 'SettingsController as vm',
      authorized: true,
      resolve: {
        $title: function(localize) {
          return localize('Settings');
        }
      }
    })
    .state('private.createGroup', {
      url: '/groups/new',
      templateUrl: 'app/group/createGroup.html',
      controller: 'CreateGroupController as vm',
      authorized: true,
      resolve: {
        $title: function (localize) {
          return localize('Create a group');
        }
      }
    })
    .state('private.group', {
      abstract: true,
      url: '/groups/:id',
      templateUrl: 'app/group/main.html',
      controller: 'GroupMainController as vm',
      authorized: true,
      resolve: {
        group: function ($stateParams, groupService) {
          return groupService.Group.get({group: $stateParams.id}).$promise;
        },
        $title: function (group) {
          return group.name;
        }
      }
    })
    .state('private.group.payments', {
      url: '/payments',
      templateUrl: 'app/group/payments/payments.html',
      controller: 'PaymentsController as vm',
      authorized: true,
      data: {
          'selectedTab' : 0
      }
    })
    .state('private.group.members', {
      url: '/members',
      templateUrl: 'app/group/members/members.html',
      controller: 'MembersController as ctrl',
      authorized: true,
      data: {
          'selectedTab' : 1
      }
    })
    .state('private.group.settle', {
      url: '/settle',
      templateUrl: 'app/group/settle/settle.html',
      controller: 'SettleController as vm',
      authorized: true,
      data: {
          'selectedTab' : 2
      }
    })
    .state('private.group.settings', {
      url: '/settings',
      templateUrl: 'app/group/settings/settings.html',
      controller: 'GroupSettingsController as vm',
      authorized: true,
      data: {
          'selectedTab' : 3
      }
    });

    $urlRouterProvider.otherwise('/entry');
  }

})();
