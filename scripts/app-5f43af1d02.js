(function() {
  'use strict';

  angular
    .module('geldzakenAngular', ['ngResource',
                                 'ui.router',
                                 'ui.router.title',
                                 'ngMaterial',
                                 'ngMessages',
                                 'LocalStorageModule',
                                 'angularMoment',
                                 'localize',
                                 'ngLodash']);

})();

(function() {
  'use strict';

  memberService.$inject = ["$resource", "$http", "api"];
  angular
      .module('geldzakenAngular')
      .service('memberService', memberService);

  /**
   * @name memberService
   * @desc Wrapper for the group/members resource
   */
  /** @ngInject */
  function memberService($resource, $http, api) {
    this.Member = $resource(api.private + '/groups/:group/members', {group: "@group"});

    this.confirm = function (group, callback) {
      $http.put(api.private + '/groups/' + group + '/members')
      .success(function () {
        callback();
      })
      .error(function () {
        throw new Error('Can\'t confirm membership.')
      });
    }

    return {
      Member: this.Member,
      confirm: this.confirm
    };
  }

})();

(function() {
  'use strict';

  userService.$inject = ["$http", "authentication", "api", "localStorageService"];
  angular
      .module('geldzakenAngular')
      .service('userService', userService);

  /**
   * @name userService
   * @desc Communicates to the API about the user.
   */
  /** @ngInject */
  function userService($http, authentication, api, localStorageService) {
    var service = this;

    /**
     * @name signup
     * @desc Asks the server to create a new user
     * @param {Object} user - A user object containing the email, password, name and bankAccount
     * @param {Function} callback - Function to be called when signup was successfull
     */
    service.signup = function (user, callback) {
      // Stuur het emailadres en wachtwoord naar /login
      $http.post(api.public + '/signup', {
        email: user.email,
        password: user.password,
        name: user.name,
        bankAccount: user.bankAccount
      })
      .success(callback)
      .error(function (data) {
        throw new Error(data);
      });
    };

    /**
     * @name update
     * @desc Asks the server to update the current user
     * @param {Object} user - A user object containing the password, name and bankAccount
     * @param {Function} callback - Function to be called when update was successfull
     */
    service.update = function (user, callback) {
      // Stuur het emailadres en wachtwoord naar /login
      $http.put(api.private + '/users/' + service.me().email, user)
      .success(function (data) {
        localStorageService.set('me', data);
        callback();
      })
      .error(function () {
        throw new Error('Can\'t save settings!')
      });
    };

    /**
     * @name delete
     * @desc Asks the server to delete the current user
     */
    service.delete = function () {
      $http.delete(api.private + '/users/' + service.me().email)
      .success(function () {
        authentication.logout();
      })
      .error(function () {
        throw new Error('Can\'t delete account!')
      });
    };

    service.me = function () {
      return localStorageService.get('me');
    };

    return service;
  }

})();

(function() {
  'use strict';

  paymentService.$inject = ["$resource", "api"];
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

(function() {
  'use strict';

  groupService.$inject = ["$resource", "api"];
  angular
      .module('geldzakenAngular')
      .service('groupService', groupService);

  /**
   * @name groupService
   * @desc Wrapper for the groups resource
   */
  /** @ngInject */
  function groupService($resource, api) {
    this.Group = $resource(api.private + '/groups/:group', {group: "@id"}, {
      update: {
        method: 'PUT'
      }
    });

    return {
      Group: this.Group
    };
  }

})();

(function() {
  'use strict';

  SettleController.$inject = ["$http", "$state", "api", "$mdDialog", "groupService", "group", "localize"];
  angular
    .module('geldzakenAngular')
    .controller('SettleController', SettleController);

  /** @ngInject */
  function SettleController($http, $state, api, $mdDialog, groupService, group, localize) {
    var vm = this;

    vm.group = group;

    vm.settle = function (ev) {
      var confirm = $mdDialog.confirm()
            .title(localize('Are you sure?'))
            .textContent(localize('Settling a group cannot be reverted.'))
            .ariaLabel(localize('Confirm'))
            .targetEvent(ev)
            .ok(localize('Settle'))
            .cancel(localize('Cancel'));
      $mdDialog.show(confirm).then(function() {
        $http.get(api.private + '/groups/' + group.id + '/settle')
        .success(function () {
          $state.reload();
          $state.go('private.group.participants');
          $mdDialog.show($mdDialog.alert()
            .title(localize('Group was settled!'))
            .ariaLabel(localize('Confirmation'))
            .ok(localize('Okay!'))
          );
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

(function() {
  'use strict';

  GroupSettingsController.$inject = ["$state", "$mdDialog", "groupService", "memberService", "group", "localize"];
  angular
    .module('geldzakenAngular')
    .controller('GroupSettingsController', GroupSettingsController);

  /** @ngInject */
  function GroupSettingsController($state, $mdDialog, groupService, memberService, group, localize) {
    var vm = this;

    vm.group = group;

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
        $state.reload();
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

(function() {
  'use strict';

  PaymentsController.$inject = ["$mdDialog", "$mdMedia", "$state", "$stateParams", "paymentService", "group", "localize"];
  CreatePaymentController.$inject = ["$mdDialog", "$timeout", "$q", "group", "userService", "lodash"];
  angular
    .module('geldzakenAngular')
    .controller('PaymentsController', PaymentsController)
    .controller('CreatePaymentController', CreatePaymentController);

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

    vm.openPaymentOptions = function (ev) {
      $mdDialog.show(
        $mdDialog.confirm()
          .clickOutsideToClose(true)
          .title(localize('Delete payment'))
          .textContent(localize('Are you sure?'))
          .ariaLabel('Payment Options')
          .targetEvent(ev)
          .ok(localize('Delete'))
          .cancel(localize('Cancel'))
      );
    };

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
      participants: [],
      payedBy: userService.me().email
    };

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

    vm.increaseAllParticipants = function () {
      vm.participants.forEach(vm.increaseParticipant);
    };

    vm.resetAllParticipants = function () {
      vm.participants.forEach(function (p) {
        p.weight = 0;
      });
    };

    vm.increaseParticipant = function (participant) {
      participant.weight++;
    };

    vm.decreaseParticipant = function (participant) {
      if (participant.weight > 0)
        participant.weight--;
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
})();

(function() {
  'use strict';

  MembersController.$inject = ["$mdDialog", "$mdMedia", "$state", "$stateParams", "groupService", "userService", "memberService", "group", "balanceCalculator", "localize"];
  InviteMemberController.$inject = ["$mdDialog"];
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
        targetEvent: $event,
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

(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .directive('toolbar', toolbar);

  function toolbar () {
    ToolbarController.$inject = ["$mdSidenav", "authorization"];
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/toolbar/toolbar.html',
      controller: ToolbarController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function ToolbarController($mdSidenav, authorization) {
      var vm = this;
      vm.toggleSidenav = function () {
        $mdSidenav('sidenav')
        .toggle();
      };

      vm.authorized = function () {
        return authorization.authorized;
      };
    }
  }

})();

(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .directive('loadingIndicator', loadingIndicator);

  function loadingIndicator () {
    loadingIndicatorController.$inject = ["$scope", "$rootScope"];
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/loadingIndicator/loadingIndicator.html',
      scope: {},
      controller: loadingIndicatorController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function loadingIndicatorController($scope, $rootScope) {
      var vm = this;

      var startLoading = function () {
        vm.show = true;
      };

      var stopLoading = function () {
        vm.show = false;
      };

      var stateChangeStart = $rootScope.$on('$stateChangeStart', startLoading)
        , stateChangeSuccess = $rootScope.$on('$stateChangeSuccess', stopLoading)
        , httpRequest = $rootScope.$on('http:request', startLoading)
        , httpResponse = $rootScope.$on('http:response', stopLoading)
        , httpResponseError = $rootScope.$on('http:responseError', stopLoading);

      var listeners = [stateChangeStart,
                       stateChangeSuccess,
                       httpRequest,
                       httpResponse,
                       httpResponseError];

      // Remove all listeners when the controller gets destroyed
      $scope.$on('$destroy', function() {
        listeners.forEach(function (listener) {
          listener();
        });
      });
    }

  }

})();

(function() {
  'use strict';

  httpInterceptor.$inject = ["$rootScope", "$q"];
  angular
      .module('geldzakenAngular')
      .factory('httpInterceptor', httpInterceptor);

  /** @ngInject */
  function httpInterceptor($rootScope, $q) {
    return {
      request: function (config) {
        $rootScope.$broadcast('http:request')
        return config
      },
      response: function (response) {
        $rootScope.$broadcast('http:response')
        return response
      },
      responseError: function (responseError) {
        $rootScope.$broadcast('http:responseError', responseError)
        return $q.reject(responseError);
      }
    }
  }

})();

(function() {
  'use strict';

  githubContributor.$inject = ["$log", "$http"];
  angular
    .module('geldzakenAngular')
    .factory('githubContributor', githubContributor);

  /** @ngInject */
  function githubContributor($log, $http) {
    var apiHost = 'https://api.github.com/repos/Swiip/generator-gulp-angular';

    var service = {
      apiHost: apiHost,
      getContributors: getContributors
    };

    return service;

    function getContributors(limit) {
      if (!limit) {
        limit = 30;
      }

      return $http.get(apiHost + '/contributors?per_page=' + limit)
        .then(getContributorsComplete)
        .catch(getContributorsFailed);

      function getContributorsComplete(response) {
        return response.data;
      }

      function getContributorsFailed(error) {
        $log.error('XHR Failed for getContributors.\n' + angular.toJson(error.data, true));
      }
    }
  }
})();

(function() {
  'use strict';

  errorHandler.$inject = ["$mdDialog", "localize"];
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

(function() {
  'use strict';

  balanceCalculator.$inject = ["lodash"];
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

(function() {
  'use strict';

  authorization.$inject = ["$rootScope", "$state", "localStorageService"];
  angular
      .module('geldzakenAngular')
      .service('authorization', authorization);

  /** @ngInject */
  function authorization($rootScope, $state, localStorageService) {
    /*
    Regelt de authorization van pagina's. Dit betekent dat hier bijgehouden
    wordt of de gebruiker pagina's mag bekijken.
    */

    var service = this;

    service.authorized = false;

    service.clear = function () {
      service.authorized = false;
    };

    service.go = function (targetState, params) {
      params = params || {};
      service.authorized = true;
      $state.go(targetState, params);
    };

    service.listenForStateChange = function () {
      service.listener = $rootScope.$on('$stateChangeStart', service.stateChange)
    }

    service.stateChange = function (event, toState, toParams) {
      if (!service.authorized && toState.authorized) {
        // Zorg ervoor dat de controller etc niet geinvoked worden
        event.preventDefault();
        // Sla op welke pagina de gebruiker wilde zien
        localStorageService.set('redirectTo', { state: toState.name, params: toParams });
        $state.go('public.login');
      }
    };

    return service;
  }

})();

(function() {
  'use strict';

  authentication.$inject = ["$state", "$http", "localStorageService", "authorization", "api"];
  angular
      .module('geldzakenAngular')
      .service('authentication', authentication);

  /** @ngInject */
  function authentication($state, $http, localStorageService, authorization, api) {
    /*
    Regelt de authentication van gebruikers. Dit betekent dat hier bijgehouden
    en gecheckt wordt of de gebruiker echt is wie hij zegt dat hij is.
    */

    var service = this;

    // Wordt geroepen bij de first-load om te checken of er al een gebruiker ingelogd is.
    service.processSavedCredentials = function () {
      if (getToken() && getKey()) {
        authenticate();
      }
    };

    service.requestToken = function (email, password) {
      // Stuur het emailadres en wachtwoord naar /login
      $http.post(api.public + '/login', {
        email: email,
        password: password
      })
      .success(function (data) {
        // Sla de token en het emailadres op
        setToken(data);
        setKey(email);
        authenticate();
      })
      .error(function (data) {
        throw new Error(data);
      });
    };

    service.logout = function () {
      localStorageService.remove('x-access-token', 'x-key', 'me', 'redirectTo');
      authorization.clear();
      $state.go('public.login');
    };

    /* Private */

    var getToken = function () {
      return localStorageService.get('x-access-token');
    };

    var getKey = function () {
      return localStorageService.get('x-key');
    };

    var setToken = function (token) {
      localStorageService.set('x-access-token', token);
    };

    var setKey = function (key) {
      localStorageService.set('x-key', key);
    };

    var setHeaders = function () {
      $http.defaults.headers.common = {
        'x-access-token': getToken(),
        'x-key'         : getKey()
      };
    };

    var authenticate = function () {
      // Stel ze in als headers
      setHeaders();
      // Maak een request naar de private API
      $http.get(api.private + '/users/' + getKey())
      .success(function (data) {
        localStorageService.set('me', data);
        // Check of er een pagina is waar we heen moesten
        var redirectTo = localStorageService.get('redirectTo');
        if (redirectTo !== null) {
          // Zo ja, ga daar heen en verstuur de juiste params ook
          authorization.go(redirectTo.state, redirectTo.params)
        } else {
          authorization.go('private.main');
        }
      })
      .error(function (data) {
        service.logout();
        throw new Error(data);
      });
   };

    return service;
  }

})();

(function() {
  'use strict';

  SignupController.$inject = ["$state", "$mdDialog", "userService", "localize"];
  angular
    .module('geldzakenAngular')
    .controller('SignupController', SignupController);

  /** @ngInject */
  function SignupController($state, $mdDialog, userService, localize) {
    var vm = this;

    vm.user = {
      email: '',
      password: '',
      name: '',
      bankAccount: ''
    };

    vm.signup = function () {
      userService.signup(vm.user, function () {
        $mdDialog.show(
          $mdDialog.alert()
            .clickOutsideToClose(true)
            .title(localize('Signed up!'))
            .textContent(localize('You can now log in.'))
            .ariaLabel('Signup Confirmation')
            .ok(localize('Okay!'))
        );
        $state.go('public.login');
      });
    };
  }
})();

(function() {
  'use strict';

  SettingsController.$inject = ["$state", "$mdDialog", "userService", "localize"];
  angular
    .module('geldzakenAngular')
    .controller('SettingsController', SettingsController);

  /** @ngInject */
  function SettingsController($state, $mdDialog, userService, localize) {
    var vm = this;

    var me = userService.me();
    vm.settings = {
      email: me.email,
      name: me.name,
      bankAccount: me.bankAccount
    }
    vm.newPassword = '';

    vm.save = function () {
      if (vm.newPassword !== '') {
        vm.settings.password = vm.newPassword;
      }
      userService.update(vm.settings, function () {
        $mdDialog.show(
          $mdDialog.alert()
            .clickOutsideToClose(true)
            .title(localize('Settings were saved!'))
            .ariaLabel('Setting Confirmation')
            .ok(localize('Okay!'))
        );
      });
    };

    vm.delete = function () {
      userService.delete();
    }
  }
})();

(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .controller('PublicController', PublicController);

  /** @ngInject */
  function PublicController() {
  }
})();

(function() {
  'use strict';

  PrivateController.$inject = ["$scope", "$state", "$rootScope", "$mdSidenav"];
  angular
    .module('geldzakenAngular')
    .controller('PrivateController', PrivateController);

  /** @ngInject */
  function PrivateController($scope, $state, $rootScope, $mdSidenav) {
    var closeSideNavOnStateChange = $rootScope.$on('$stateChangeStart', function () {
      $mdSidenav('sidenav').close();
    });

    $scope.$on('$destroy', function () {
      closeSideNavOnStateChange();
    });

  }
})();

(function() {
  'use strict';

  MainController.$inject = ["$state", "$mdDialog", "$mdMedia", "balanceCalculator", "userService", "memberService", "groups", "localize"];
  angular
    .module('geldzakenAngular')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($state, $mdDialog, $mdMedia, balanceCalculator, userService, memberService, groups, localize) {
    var vm = this;
    vm.groups = groups;
    vm.inactiveGroups = [];
    vm.sorting = 'name';
    vm.me = userService.me();

    for (var i = 0; i < vm.groups.length; i++) {
      if (!vm.groups[i].membership.active) {
        vm.inactiveGroups.push(vm.groups[i]);
      }
    }

    for (var j = 0; j < vm.groups.length; j++) {
      var balances = balanceCalculator.calculate(vm.groups[j].members, vm.groups[j].payments);
      vm.groups[j].balance = balances[vm.me.email];
    }

    vm.show = function (group) {
      $state.go('private.group.payments', { id: group.id });
    };

    vm.openMenu = function ($mdOpenMenu, ev) {
      $mdOpenMenu(ev);
    };

    vm.confirm = function (group) {
      memberService.confirm(group.id, function () {
        vm.show(group);
      });
    }

    vm.reject = function (group) {
      memberService.Member.delete({ group: group.id }, function () {
        $state.reload();
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
    }
  }
})();

(function() {
  'use strict';

  LogoutController.$inject = ["authentication"];
  angular
    .module('geldzakenAngular')
    .controller('LogoutController', LogoutController);

  /** @ngInject */
  function LogoutController(authentication) {
    authentication.logout();
  }
})();

(function() {
  'use strict';

  LoginController.$inject = ["authorization", "authentication"];
  angular
    .module('geldzakenAngular')
    .controller('LoginController', LoginController);

  /** @ngInject */
  function LoginController(authorization, authentication) {
    var vm = this;

    vm.user = {email: '', password: ''}

    vm.login = function () {
      authentication.requestToken(vm.user.email, vm.user.password);
    };

    authentication.processSavedCredentials();
  }
})();

(function() {
  'use strict'

  GroupMainController.$inject = ["$scope", "$rootScope", "$mdDialog", "$state", "$stateParams", "groupService", "userService", "group"];
  angular
    .module('geldzakenAngular')
    .controller('GroupMainController', GroupMainController)

  /** @ngInject */
  function GroupMainController($scope, $rootScope, $mdDialog, $state, $stateParams, groupService, userService, group) {
    var vm = this

    vm.group = group

    vm.go = function (state) {
      $state.go('private.group.' + state, $stateParams)
    }

    vm.setCurrentTab = function (state) {
      if (state.data && state.data.selectedTab)
        vm.currentTab = state.data.selectedTab
    }

    vm.setCurrentTab($state.current)

    var listener = $rootScope.$on('$stateChangeSuccess', function(event, toState) {
      vm.setCurrentTab(toState)
    })

    $scope.$on('$destroy', function () {
      listener()
    })
  }
})()

(function() {
  'use strict';

  CreateGroupController.$inject = ["$state", "groupService"];
  angular
    .module('geldzakenAngular')
    .controller('CreateGroupController', CreateGroupController);

  /** @ngInject */
  function CreateGroupController($state, groupService) {
    var vm = this;

    vm.group = {}

    vm.create = function () {
      var group = new groupService.Group({ name: vm.group.name });
      group.$save(function(group) {
        $state.go('private.group.members', { id: group.id })
      });
    };
  }
})();

(function() {
  'use strict';

  runBlock.$inject = ["$rootScope", "$window", "authorization", "amMoment"];
  angular
    .module('geldzakenAngular')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $window, authorization, amMoment) {
    authorization.listenForStateChange();

    amMoment.changeLocale('nl');

    $window.i18n = {
      'Overview': 'Overzicht',
      'Groups': 'Groepen',
      'Log out': 'Log uit',
      'Log in': 'Log in',
      'Sign up': 'Registreer',
      'Settings': 'Instellingen',
      'Settings were saved!': 'Instelligen opgeslagen!',
      'Can\'t save settings!': 'Instellingen konden niet worden opgeslagen.',
      'Can\'t delete account!': 'Kon account niet verwijderen.',
      'Payments': 'Betalingen',
      'Members': 'Leden',
      'Cancel': 'Annuleer',
      'Are you sure?': 'Weet je het zeker?',
      'Settling a group cannot be reverted.': 'Afrekenen kan niet teruggedraaid worden.',
      'Settle': 'Afrekenen',
      'Settle group': 'Reken groep af',
      'Group was settled!': 'Groep is afgerekend!',
      'Create a group': 'Nieuwe groep',
      'Create group': 'Maak groep',
      'Leave group': 'Verlaat groep',
      'Left group!': 'Groep verlaten!',
      'Could not leave group.': 'Kon groep niet verlaten.',
      'Add member': 'Nieuw lid',
      'Member was added!': 'Lid is toegevoegd!',
      'But won\'t be visible until he/she confirms.': 'Maar verschijnt pas als hij/zij accepteert.',
      'Add': 'Voeg toe',
      'Add payment': 'Nieuwe betaling',
      'Amount': 'Bedrag',
      'Payed by': 'Betaald door',
      'Short description': 'Korte beschrijving',
      'Everyone': 'Iedereen',
      'Reset': 'Reset',
      'Payment was added!': 'Betaling toegevoegd!',
      'This group doesn\'t have any payments yet.': 'Er zijn nog geen betalingen gedaan.',
      'Delete payment': 'Verwijder betaling',
      'Delete': 'Verwijder',
      'Payed for': 'Betaald voor',
      'There are no payments made in this group.': 'Er zijn geen betalingen gedaan in deze groep.',
      'Could not settle.': 'Kon niet afrekenen.',
      'Signed up!': 'Geregistreerd!',
      'You can now log in.': 'Je kunt nu inloggen.',
      'Okay!': 'Oke!',
      'Account': 'Account',
      'Bankaccount number': 'Bankrekening nummer',
      'Email address': 'E-mailadres',
      'Password': 'Wachtwoord',
      'New password': 'Nieuw wachtwoord',
      'Save': 'Opslaan',
      'Delete account': 'Verwijder account',
      'This is required.': 'Dit is verplicht.',
      'I already have an account': 'Ik heb al een account',
      'I don\'t have an account': 'Ik heb geen account',
      'Make sure your email address is valid.': 'Zorg ervoor dat je e-mailadres klopt.',
      'We only show this to your group members.': 'We delen dit alleen met groepsgenoten.',
      'When you settle a group, we calculate the transactions needed to get all balances to zero and mail them to all participants.': 'Als je een groep afrekent, berekenen wij welke transacties nodig zijn om ieders balans weer op 0 te zetten. Alle leden krijgen hiervan een overzicht gemaild.',
      'Name': 'Naam',
      'Balance': 'Stand',
      'Confirm': 'Bevestig',
      'Reject': 'Negeer',
      'Your groups': 'Jouw groepen',
      'New groups': 'Nieuwe groepen',
      'Creation date': 'Opricht datum',
      'Created': 'Gemaakt',
      'Last updated': 'Laatst gewijzigd',
      '{num} members': function (d) { return d.num + ' leden' },
      'You are not in any groups yet! When you are, they will appear here.': 'Je hebt op dit moment nog geen groepen. Zodra dit verandert, verschijnen ze hier.'
    }
  }

})();

(function() {
  'use strict';

  routerConfig.$inject = ["$stateProvider", "$urlRouterProvider"];
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
    .state('public.login', {
      url: '/login',
      templateUrl: 'app/login/login.html',
      controller: 'LoginController as vm',
      resolve: {
        $title: ["localize", function(localize) {
          return localize('Log in');
        }]
      }      
    })
    .state('public.signup', {
      url: '/signup',
      templateUrl: 'app/signup/signup.html',
      controller: 'SignupController as vm',
      resolve: {
        $title: ["localize", function(localize) {
          return localize('Sign up');
        }]
      }      
    })
    .state('public.logout', {
      url: '/logout',
      templateUrl: 'app/logout/logout.html',
      controller: 'LogoutController as ctrl',
      resolve: {
        $title: ["localize", function(localize) {
          return localize('Log out');
        }]
      }      
    })

    .state('private', {
      templateUrl: 'app/private/private.html',
      controller: 'PrivateController as vm',
      authorized: true
    })
    .state('private.main', {
      url: '/',
      templateUrl: 'app/main/main.html',
      controller: 'MainController as vm',
      authorized: true,
      resolve: {
        groups: ["$stateParams", "groupService", function ($stateParams, groupService) {
          return groupService.Group.query().$promise;
        }],
        $title: ["localize", function(localize) {
          return localize('Overview');
        }]
      }
    })
    .state('private.settings', {
      url: '/settings',
      templateUrl: 'app/settings/settings.html',
      controller: 'SettingsController as vm',
      authorized: true,
      resolve: {
        $title: ["localize", function(localize) {
          return localize('Settings');
        }]
      }
    })
    .state('private.createGroup', {
      url: '/groups/new',
      templateUrl: 'app/group/createGroup.html',
      controller: 'CreateGroupController as vm',
      authorized: true,
      resolve: {
        $title: ["localize", function (localize) {
          return localize('Create a group');
        }]
      }
    })
    .state('private.group', {
      abstract: true,
      url: '/groups/:id',
      templateUrl: 'app/group/main.html',
      controller: 'GroupMainController as vm',
      authorized: true,
      resolve: {
        group: ["$stateParams", "groupService", function ($stateParams, groupService) {
          return groupService.Group.get({group: $stateParams.id}).$promise;
        }],
        $title: ["group", function (group) {
          return group.name;
        }]
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

    $urlRouterProvider.otherwise('/');
  }

})();

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

(function() {
  'use strict';

  config.$inject = ["$provide", "$httpProvider", "$logProvider", "$mdThemingProvider", "localStorageServiceProvider"];
  angular
    .module('geldzakenAngular')
    .config(config);

  /** @ngInject */
  function config($provide, $httpProvider, $logProvider, $mdThemingProvider, localStorageServiceProvider) {
    $mdThemingProvider.theme('default')
    .primaryPalette('indigo')
    .accentPalette('grey');

    $provide.decorator("$exceptionHandler", ["$delegate", "$injector", function($delegate, $injector) {
      return function (exception) {
        $injector.get('errorHandler').handle(exception);
      };
    }]);

    $httpProvider.interceptors.push('httpInterceptor');

    // Enable log
    $logProvider.debugEnabled(true);

    // Set prefix for localStorage
    localStorageServiceProvider.setPrefix('geldzaken');
    localStorageServiceProvider.setStorageCookie(100, '/');
  }

})();

angular.module("geldzakenAngular").run(["$templateCache", function($templateCache) {$templateCache.put("app/main/main.html","<md-content class=\"md-padding\"><md-subheader ng-if=\"vm.inactiveGroups.length\"><span localize=\"\">New groups</span></md-subheader><md-card class=\"alert\" ng-repeat=\"group in vm.inactiveGroups | orderBy: membership.createdAt\"><md-card-title><md-card-title-text><span class=\"md-headline\">{{::group.name}}</span> <span class=\"md-subhead\" am-time-ago=\"group.membership.createdAt\"></span></md-card-title-text></md-card-title><md-card-actions layout=\"row\" layout-align=\"end center\"><md-button ng-click=\"vm.reject(group)\"><span localize=\"\">Reject</span></md-button><md-button ng-click=\"vm.confirm(group)\"><span localize=\"\">Confirm</span></md-button></md-card-actions></md-card><md-subheader ng-if=\"vm.inactiveGroups.length\"><span localize=\"\">Your groups</span></md-subheader><div layout=\"row\" ng-if=\"vm.groups.length\"><md-menu><md-button aria-label=\"Open phone interactions menu\" class=\"md-icon-button\" ng-click=\"vm.openMenu($mdOpenMenu, $event)\"><md-icon md-menu-origin=\"\" class=\"material-icons\">sort</md-icon></md-button><md-menu-content width=\"4\" class=\"with-radio\"><md-radio-group ng-model=\"vm.sorting\"><md-menu-item><md-radio-button ng-click=\"\" value=\"name\" class=\"md-primary\"><span localize=\"\">Name</span></md-radio-button></md-menu-item><md-menu-item><md-radio-button ng-click=\"\" value=\"-balance\" class=\"md-primary\"><span localize=\"\">Balance</span></md-radio-button></md-menu-item><md-menu-item><md-radio-button ng-click=\"\" value=\"createdAt\" class=\"md-primary\"><span localize=\"\">Creation date</span></md-radio-button></md-menu-item></md-radio-group></md-menu-content></md-menu><span flex=\"\"></span></div><md-card class=\"alert\" ng-if=\"!vm.groups.length\"><md-card-content><p localize=\"\">You are not in any groups yet! When you are, they will appear here.</p></md-card-content></md-card><md-list><md-list-item ng-click=\"vm.show(group)\" class=\"md-2-line\" ng-repeat=\"group in vm.groups | orderBy: vm.sorting\" ng-if=\"group.membership.active\"><div class=\"md-list-item-text\"><div layout=\"row\"><h3>{{ group.name }}</h3><span flex=\"\"></span><p ng-class=\"{ \'red\': group.balance < 0, \'green\': group.balance > 0 }\">&euro; {{ group.balance }}</p></div><p localize=\"\" data-num=\"{{group.members.length}}\">{num} members</p></div></md-list-item></md-list></md-content>");
$templateCache.put("app/group/createGroup.html","<form layout-gt-sm=\"column\" layout-padding=\"\"><md-content class=\"autoScroll\"><md-input-container class=\"md-block\"><label localize=\"\">Name</label> <input type=\"text\" ng-model=\"vm.group.name\"></md-input-container><div class=\"bottom-sheet-demo inset\" layout=\"column\"><md-button type=\"submit\" class=\"md-primary md-raised\" ng-click=\"vm.create()\"><span localize=\"\">Create group</span></md-button></div></md-content></form>");
$templateCache.put("app/group/main.html","<md-tabs md-dynamic-height=\"\" md-border-bottom=\"\" class=\"md-primary\" md-selected=\"vm.currentTab\"><md-tab ng-click=\"vm.go(\'payments\')\"><span localize=\"\">Payments</span></md-tab><md-tab ng-click=\"vm.go(\'members\')\"><span localize=\"\">Members</span></md-tab><md-tab ng-click=\"vm.go(\'settle\')\"><span localize=\"\">Settle</span></md-tab><md-tab ng-click=\"vm.go(\'settings\')\"><span localize=\"\">Settings</span></md-tab></md-tabs><ui-view></ui-view>");
$templateCache.put("app/login/login.html","<form layout-gt-sm=\"column\" layout-padding=\"\" name=\"loginForm\"><md-content class=\"autoScroll\"><md-input-container class=\"md-block\"><label localize=\"\">Email address</label> <input required=\"\" type=\"email\" name=\"email\" ng-model=\"vm.user.email\"><div ng-messages=\"loginForm.email.$error\"><div ng-message=\"required\"><span localize=\"\">This is required.</span></div><div ng-message=\"email\"><span localize=\"\">Make sure your email address is valid.</span></div></div></md-input-container><md-input-container class=\"md-block\"><label localize=\"\">Password</label> <input ng-model=\"vm.user.password\" name=\"password\" type=\"password\"><div ng-messages=\"loginForm.password.$error\"><div ng-message=\"required\"><span localizethis=\"\" is=\"\" required.<=\"\" span=\"\"></span></div></div></md-input-container><div class=\"bottom-sheet-demo inset\" layout=\"column\"><md-button type=\"submit\" class=\"md-primary md-raised\" ng-click=\"vm.login()\"><span localize=\"\">Log in</span></md-button><md-button ui-sref=\"public.signup\"><span localize=\"\">I don\'t have an account</span></md-button></div></md-content></form>");
$templateCache.put("app/public/public.html","<div layout=\"column\"><toolbar></toolbar><md-content ui-view=\"\"></md-content></div>");
$templateCache.put("app/private/private.html","<md-sidenav class=\"md-sidenav-left md-whiteframe-z2 sidenav\" md-component-id=\"sidenav\"><md-content class=\"md-accent\"><md-divider></md-divider><md-subheader><span localize=\"\">Groups</span></md-subheader><md-menu-item><md-button ui-sref=\"private.main\"><md-icon class=\"material-icons\" md-menu-align-target=\"\">dashboard</md-icon><span localize=\"\">Overview</span></md-button></md-menu-item><md-menu-item ui-sref=\"private.createGroup\"><md-button><md-icon class=\"material-icons\" md-menu-align-target=\"\">add</md-icon><span localize=\"\">Create a group</span></md-button></md-menu-item><md-divider></md-divider><md-subheader localize=\"\">Account</md-subheader><md-menu-item ui-sref=\"private.settings\"><md-button><md-icon class=\"material-icons\" md-menu-align-target=\"\">settings</md-icon><span localize=\"\">Settings</span></md-button></md-menu-item><md-menu-item><md-button href=\"#/logout\"><md-icon class=\"material-icons\" md-menu-align-target=\"\">exit_to_app</md-icon><span localize=\"\">Log out</span></md-button></md-menu-item></md-content></md-sidenav><div layout=\"column\"><toolbar></toolbar><md-content ui-view=\"\"></md-content></div>");
$templateCache.put("app/logout/logout.html","");
$templateCache.put("app/signup/signup.html","<form layout-gt-sm=\"column\" layout-padding=\"\" name=\"signupForm\"><md-content class=\"autoScroll\"><md-input-container class=\"md-block\"><label localize=\"\">Email address</label> <input type=\"email\" required=\"\" name=\"email\" ng-model=\"vm.user.email\"><div ng-messages=\"signupForm.email.$error\"><div ng-message=\"required\"><span localize=\"\">This is required.</span></div><div ng-message=\"email\"><span localize=\"\">Make sure your email address is valid.</span></div></div></md-input-container><md-input-container class=\"md-block\"><label localize=\"\">Password</label> <input ng-model=\"vm.user.password\" required=\"\" name=\"password\" type=\"password\"><div ng-messages=\"signupForm.password.$error\"><div ng-message=\"required\"><span localize=\"\">This is required.</span></div></div></md-input-container><md-input-container class=\"md-block\"><label localize=\"\">Name</label> <input type=\"text\" required=\"\" name=\"name\" ng-model=\"vm.user.name\"><div ng-messages=\"signupForm.name.$error\"><div ng-message=\"required\"><span localize=\"\">This is required.</span></div></div></md-input-container><md-input-container class=\"md-block\"><label localize=\"\">Bankaccount number</label> <input type=\"text\" required=\"\" name=\"bankAccount\" ng-model=\"vm.user.bankAccount\"><div ng-messages=\"signupForm.bankAccount.$error\" md-auto-hide=\"false\"><div ng-message=\"required\"><span localize=\"\">We only show this to your group members.</span></div></div></md-input-container><div layout=\"column\"><md-button type=\"submit\" class=\"md-primary md-raised\" ng-click=\"vm.signup()\"><span localize=\"\">Sign up</span></md-button><md-button ui-sref=\"public.login\"><span localize=\"\">I already have an account</span></md-button></div></md-content></form>");
$templateCache.put("app/settings/settings.html","<form layout-gt-sm=\"column\" layout-padding=\"\" name=\"settingsForm\"><md-content class=\"autoScroll\"><md-input-container class=\"md-block\"><label localize=\"\">Name</label> <input type=\"text\" required=\"\" name=\"name\" ng-model=\"vm.settings.name\"><div ng-messages=\"settingsForm.name.$error\"><div ng-message=\"required\" localize=\"\">This is required.</div></div></md-input-container><md-input-container class=\"md-block\"><label localize=\"\">Bankaccount number</label> <input type=\"text\" required=\"\" name=\"bankaccount\" ng-model=\"vm.settings.bankAccount\"><div ng-messages=\"settingsForm.bankaccount.$error\" md-auto-hide=\"false\"><div ng-message=\"required\" localize=\"\">You can\'t leave this empty.</div></div></md-input-container><md-input-container class=\"md-block\"><label localize=\"\">Email address</label> <input type=\"email\" disabled=\"\" name=\"email\" ng-model=\"vm.settings.email\"></md-input-container><md-input-container class=\"md-block\"><label localize=\"\">New password</label> <input type=\"password\" name=\"password\" ng-model=\"vm.newPassword\"></md-input-container><div layout=\"column\"><md-button type=\"submit\" class=\"md-primary md-raised\" ng-click=\"vm.save()\"><span localize=\"\">Save</span></md-button></div><div layout=\"column\"><md-button type=\"submit\" class=\"md-primary md-raised md-warn\" ng-click=\"vm.delete()\"><span localize=\"\">Delete account</span></md-button></div></md-content></form>");
$templateCache.put("app/components/toolbar/toolbar.html","<md-toolbar class=\"md-primary\"><div class=\"md-toolbar-tools\"><md-button class=\"md-icon-button\" ng-click=\"vm.toggleSidenav()\" ng-show=\"vm.authorized()\"><md-icon class=\"material-icons\">menu</md-icon></md-button><h2><span ng-bind=\"$title || \'Geldzaken\'\"></span></h2><span flex=\"\"></span><loading-indicator></loading-indicator></div></md-toolbar>");
$templateCache.put("app/components/loadingIndicator/loadingIndicator.html","<span ng-if=\"vm.show\"><md-progress-circular md-mode=\"indeterminate\" class=\"md-accent\"></md-progress-circular></span>");
$templateCache.put("app/group/members/inviteMember.html","<md-dialog aria-label=\"Invite someone\" ng-cloak=\"\"><form><md-toolbar><div class=\"md-toolbar-tools\"><md-icon class=\"material-icons\" ng-click=\"vm.cancel()\">close</md-icon><span flex=\"\"></span><md-button class=\"md-accent\" ng-click=\"vm.invite()\"><span localize=\"\">Add</span></md-button></div></md-toolbar><md-dialog-content><md-content class=\"md-padding autocomplete\" layout=\"column\"><form name=\"inviteForm\"><md-input-container class=\"md-block\"><label localize=\"\">Email address</label> <input type=\"email\" name=\"description\" ng-model=\"vm.email\" autofocus=\"\"></md-input-container></form></md-content></md-dialog-content></form></md-dialog>");
$templateCache.put("app/group/members/members.html","<md-content class=\"md-padding\"><div layout=\"row\"><md-menu><md-button aria-label=\"Open phone interactions menu\" class=\"md-icon-button\" ng-click=\"ctrl.openMenu($mdOpenMenu, $event)\"><md-icon md-menu-origin=\"\" class=\"material-icons\">sort</md-icon></md-button><md-menu-content width=\"4\" class=\"with-radio\"><md-radio-group ng-model=\"ctrl.sorting\"><md-menu-item><md-radio-button value=\"name\" ng-click=\"\" class=\"md-primary\"><span localize=\"\">Name</span></md-radio-button></md-menu-item><md-menu-item><md-radio-button value=\"-balance\" ng-click=\"\" class=\"md-primary\"><span localize=\"\">Balance</span></md-radio-button></md-menu-item></md-radio-group></md-menu-content></md-menu><span flex=\"\"></span><md-button ng-click=\"ctrl.showInviteMember($event)\"><span localize=\"\">Add member</span></md-button></div><md-list><md-list-item ng-click=\"\" class=\"md-2-line\" ng-repeat=\"member in ctrl.group.members | orderBy: ctrl.sorting\"><div class=\"md-list-item-text\"><div layout=\"row\"><h3>{{ member.name }}</h3><span flex=\"\"></span><p ng-class=\"{ \'red\': member.balance < 0, \'green\': member.balance > 0 }\">&euro; {{ member.balance }}</p></div><p>{{ member.email }}</p></div></md-list-item></md-list></md-content>");
$templateCache.put("app/group/settle/settle.html","<md-content layout-padding=\"\"><p localize=\"\">When you settle a group, we calculate the transactions needed to get all balances to zero and mail them to all participants.</p><div layout=\"column\"><md-button ng-click=\"vm.settle($event)\" class=\"md-primary md-raised\"><span localize=\"\">Settle group</span></md-button></div></md-content>");
$templateCache.put("app/group/payments/createPayment.html","<md-dialog aria-label=\"Add payment\" ng-cloak=\"\"><form><md-toolbar><div class=\"md-toolbar-tools\"><md-icon class=\"material-icons\" ng-click=\"vm.cancel()\">close</md-icon><span flex=\"\"></span><md-button class=\"md-accent\" ng-click=\"vm.create()\"><span localize=\"\">Add</span></md-button></div></md-toolbar><md-dialog-content><md-content class=\"md-padding autocomplete\" layout=\"column\"><form name=\"paymentForm\"><md-input-container><label localize=\"\">Amount</label> <input type=\"number\" step=\"0.01\" name=\"amount\" ng-model=\"vm.payment.amount\" md-autofocus=\"\"></md-input-container><md-input-container><label localize=\"\">Payed by</label><md-select ng-model=\"vm.payment.payedBy\"><md-option ng-repeat=\"participant in vm.participants\" value=\"{{::participant.email}}\">{{::participant.name}}</md-option></md-select></md-input-container><md-input-container class=\"md-block\"><label localize=\"\">Short description</label> <input type=\"text\" name=\"description\" ng-model=\"vm.payment.description\"></md-input-container><div layout=\"row\"><md-button ng-click=\"vm.increaseAllParticipants()\" class=\"md-raised md-primary\" flex=\"50\"><span localize=\"\">Everyone</span> +1</md-button><md-button ng-click=\"vm.resetAllParticipants()\" class=\"md-raised\" flex=\"50\"><span localize=\"\">Reset</span></md-button></div><md-list><md-list-item ng-repeat=\"participant in vm.participants\" ng-click=\"vm.increaseParticipant(participant)\" class=\"md-with-secondary md-2-line\" ng-class=\"{ \'not-active\': participant.weight == 0 }\"><div class=\"md-list-item-text\"><h3>{{::participant.name}}</h3><p>{{participant.weight}}x</p></div><md-icon class=\"material-icons md-secondary\" ng-click=\"vm.decreaseParticipant(participant)\" aria-label=\"Decrease weight\">remove</md-icon></md-list-item></md-list></form></md-content></md-dialog-content></form></md-dialog>");
$templateCache.put("app/group/payments/payments.html","<md-content class=\"md-padding\"><div layout=\"row\"><md-menu><md-button aria-label=\"Open phone interactions menu\" class=\"md-icon-button\" ng-click=\"vm.openMenu($mdOpenMenu, $event)\"><md-icon md-menu-origin=\"\" class=\"material-icons\">sort</md-icon></md-button><md-menu-content width=\"4\" class=\"with-radio\"><md-radio-group ng-model=\"vm.sorting\"><md-menu-item><md-radio-button value=\"payedBy.name\" ng-click=\"\" class=\"md-primary\"><span localize=\"\">Payed by</span></md-radio-button></md-menu-item><md-menu-item><md-radio-button value=\"-amount\" ng-click=\"\" class=\"md-primary\"><span localize=\"\">Amount</span></md-radio-button></md-menu-item><md-menu-item><md-radio-button value=\"-createdAt\" ng-click=\"\" class=\"md-primary\"><span localize=\"\">Creation date</span></md-radio-button></md-menu-item></md-radio-group></md-menu-content></md-menu><span flex=\"\"></span><md-button ng-click=\"vm.showCreatePayment($event)\"><span localize=\"\">Add payment</span></md-button></div><md-list><md-list-item ng-click=\"vm.openPaymentOptions($event)\" class=\"md-3-line md-payment\" ng-repeat=\"payment in vm.group.payments | orderBy: vm.sorting\"><div></div><div class=\"md-list-item-text\"><div layout=\"row\"><h3>&euro; {{::payment.amount}}</h3><span flex=\"\"></span><p am-time-ago=\"payment.createdAt\"></p></div><p>{{::payment.payedBy.name}} - {{::payment.description}}</p><p><span localize=\"\">Payed for</span> {{::vm.participants_to_string(payment.participants)}}</p></div></md-list-item></md-list><md-card class=\"alert\" ng-if=\"!vm.group.payments.length\"><md-card-content><p localize=\"\">There are no payments made in this group.</p></md-card-content></md-card></md-content>");
$templateCache.put("app/group/settings/settings.html","<form layout-gt-sm=\"column\" layout-padding=\"\" name=\"settingsForm\"><md-content class=\"autoScroll\"><md-input-container class=\"md-block\"><label localize=\"\">Name</label> <input type=\"text\" required=\"\" name=\"name\" ng-model=\"vm.group.name\"><div ng-messages=\"settingsForm.name.$error\"><div ng-message=\"required\"><span localize=\"\">This is required.</span></div></div></md-input-container><div layout=\"column\"><md-button type=\"submit\" class=\"md-primary md-raised\" ng-click=\"vm.save()\"><span localize=\"\">Save</span></md-button></div><div layout=\"column\"><md-button type=\"submit\" class=\"md-primary md-raised md-warn\" ng-click=\"vm.leave()\"><span localize=\"\">Leave group</span></md-button></div><br><br><p><small><span localize=\"\">Created</span> <span am-time-ago=\"vm.group.createdAt\"></span></small><br><small><span localize=\"\">Last updated</span> <span am-time-ago=\"vm.group.updatedAt\"></span></small><br></p></md-content></form>");}]);
//# sourceMappingURL=../maps/scripts/app-5f43af1d02.js.map
