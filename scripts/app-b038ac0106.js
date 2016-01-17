!function(){"use strict";angular.module("geldzakenAngular",["ngResource","ui.router","ui.router.title","ngMaterial","ngMessages","LocalStorageModule","angularMoment","localize","ngLodash"])}(),function(){"use strict";function e(e,t,n,a){var o=this;return o.signup=function(t,a){e.post(n["public"]+"/signup",{email:t.email,password:t.password,name:t.name,bankAccount:t.bankAccount}).success(a).error(function(e){throw new Error(e)})},o.update=function(t,r){e.put(n["private"]+"/users/"+o.me().email,t).success(function(e){a.set("me",e),r()}).error(function(){throw new Error("Can't save settings!")})},o["delete"]=function(){e["delete"](n["private"]+"/users/"+o.me().email).success(function(){t.logout()}).error(function(){throw new Error("Can't delete account!")})},o.me=function(){return a.get("me")},o}e.$inject=["$http","authentication","api","localStorageService"],angular.module("geldzakenAngular").service("userService",e)}(),function(){"use strict";function e(e,t){return this.Payment=e(t["private"]+"/groups/:group/payments",{group:"@group"}),{Payment:this.Payment}}e.$inject=["$resource","api"],angular.module("geldzakenAngular").service("paymentService",e)}(),function(){"use strict";function e(e,t,n){return this.Member=e(n["private"]+"/groups/:group/members",{group:"@group"}),this.confirm=function(e,a){t.put(n["private"]+"/groups/"+e+"/members").success(function(e){a()}).error(function(){throw new Error("Can't confirm membership.")})},{Member:this.Member,confirm:this.confirm}}e.$inject=["$resource","$http","api"],angular.module("geldzakenAngular").service("memberService",e)}(),function(){"use strict";function e(e,t){return this.Group=e(t["private"]+"/groups/:group",{group:"@id"},{update:{method:"PUT"}}),{Group:this.Group}}e.$inject=["$resource","api"],angular.module("geldzakenAngular").service("groupService",e)}(),function(){"use strict";function e(e,t,n,a,o,r,i){var l=this;l.group=r,l.settle=function(o){var l=a.confirm().title(i("Are you sure?")).textContent(i("Settling a group cannot be reverted.")).ariaLabel(i("Confirm")).targetEvent(o).ok(i("Settle")).cancel(i("Cancel"));a.show(l).then(function(){e.get(n["private"]+"/groups/"+r.id+"/settle").success(function(){t.reload(),t.go("private.group.participants"),a.show(a.alert().title(i("Group was settled!")).ariaLabel(i("Confirmation")).ok(i("Okay!")))}).error(function(e){a.show(a.alert().title(i("Could not settle.")).textContent(i(e)).ariaLabel("Alert").ok(i("Okay!")))})})}}e.$inject=["$http","$state","api","$mdDialog","groupService","group","localize"],angular.module("geldzakenAngular").controller("SettleController",e)}(),function(){"use strict";function e(e,t,n,a,o,r){var i=this;i.group=o,i.save=function(){i.group.$update(function(){t.show(t.alert().clickOutsideToClose(!0).title(r("Settings were saved!")).ariaLabel("Setting Confirmation").ok(r("Okay!"))),e.reload()},function(e){throw new Error(e.message)})},i.leave=function(){a.Member["delete"]({group:o.id},function(){t.show(t.alert().clickOutsideToClose(!0).title(r("Left group!")).ariaLabel("Left Group Confirmation").ok(r("Okay!"))),e.go("private.main"),e.reload()},function(e){t.show(t.alert().clickOutsideToClose(!0).title(r("Could not leave group.")).textContent(e.data).ariaLabel("Can't leave group").ok(r("Okay!")))})}}e.$inject=["$state","$mdDialog","groupService","memberService","group","localize"],angular.module("geldzakenAngular").controller("GroupSettingsController",e)}(),function(){"use strict";function e(e,n,a,o,r,i,l){var s=this;s.group=i,s.showCreatePayment=function(o){var i=n("sm")||n("xs");e.show({controller:t,controllerAs:"vm",templateUrl:"app/group/payments/createPayment.html",targetEvent:o,clickOutsideToClose:!0,fullscreen:i,locals:{group:s.group}}).then(function(t){r.Payment.save({group:s.group.id},t,function(){e.show(e.alert().clickOutsideToClose(!0).title(l("Payment was added!")).ariaLabel("Payment Confirmation").ok(l("Okay!"))),a.reload()},function(e){throw new Error(e)})})},s.openPaymentOptions=function(t){e.show(e.confirm().clickOutsideToClose(!0).title(l("Delete payment")).textContent(l("Are you sure?")).ariaLabel("Payment Options").targetEvent(t).ok(l("Delete")).cancel(l("Cancel")))},s.openMenu=function(e,t){e(t)},s.sorting="-createdAt",s.participants_to_string=function(e){for(var t=[],n=0;n<e.length;n++){var a=e[n],o=a.paymentParticipation.weight;o>1?t.push(a.name+" ("+o+"x)"):t.push(a.name)}if(1==t.length)return t[0];var r=t.pop();return t.join(", ")+" and "+r},s.go=function(e){a.go("^."+e,o)}}function t(e,t,n,a,o,r){var i=this;i.group=a,i.payment={participants:[],payedBy:o.me().email},i.participants=function(){var e=r.map(a.members,function(e){return{email:e.email,name:e.name,weight:0}});return e}(),i.increaseAllParticipants=function(){i.participants.forEach(i.increaseParticipant)},i.resetAllParticipants=function(){i.participants.forEach(function(e){e.weight=0})},i.increaseParticipant=function(e){e.weight++},i.decreaseParticipant=function(e){e.weight>0&&e.weight--},i.cancel=function(){e.cancel()},i.create=function(){i.participants.forEach(function(e){e.weight>0&&i.payment.participants.push({email:e.email,weight:e.weight})}),e.hide(i.payment)}}e.$inject=["$mdDialog","$mdMedia","$state","$stateParams","paymentService","group","localize"],t.$inject=["$mdDialog","$timeout","$q","group","userService","lodash"],angular.module("geldzakenAngular").controller("PaymentsController",e).controller("CreatePaymentController",t)}(),function(){"use strict";function e(e,n,a,o,r,i,l,s,m,c){var u=this;u.group=s,u.showInviteMember=function(n){e.show({controller:t,controllerAs:"vm",templateUrl:"app/group/members/inviteMember.html",targetEvent:n,clickOutsideToClose:!0}).then(function(t){l.Member.save({group:s.id},t,function(){e.show(e.alert().clickOutsideToClose(!0).title(c("Member was added!")).textContent(c("But won't be visible until he/she confirms.")).ariaLabel("Invitation Confirmation").ok(c("Okay!")))},function(t){e.show(e.alert().clickOutsideToClose(!0).title(t.data).ariaLabel("Invitation Error").ok(c("Okay!")))})})};var d=m.calculate(s.members,s.payments);u.group.members.forEach(function(e){e.balance=d[e.email]}),u.openMenu=function(e,t){e(t)},u.sorting="-balance"}function t(e){var t=this;t.email="",t.cancel=function(){e.cancel()},t.invite=function(){e.hide({email:t.email})}}e.$inject=["$mdDialog","$mdMedia","$state","$stateParams","groupService","userService","memberService","group","balanceCalculator","localize"],t.$inject=["$mdDialog"],angular.module("geldzakenAngular").controller("MembersController",e).controller("InviteMemberController",t)}(),function(){"use strict";function e(){function e(e,t){var n=this;n.toggleSidenav=function(){e("sidenav").toggle()},n.authorized=function(){return t.authorized}}e.$inject=["$mdSidenav","authorization"];var t={restrict:"E",templateUrl:"app/components/toolbar/toolbar.html",controller:e,controllerAs:"vm",bindToController:!0};return t}angular.module("geldzakenAngular").directive("toolbar",e)}(),function(){"use strict";function e(){function e(e,t){var n=this,a=function(){n.show=!0},o=function(){n.show=!1},r=t.$on("$stateChangeStart",a),i=t.$on("$stateChangeSuccess",o),l=t.$on("http:request",a),s=t.$on("http:response",o),m=t.$on("http:responseError",o),c=[r,i,l,s,m];e.$on("$destroy",function(){c.forEach(function(e){e()})})}e.$inject=["$scope","$rootScope"];var t={restrict:"E",templateUrl:"app/components/loadingIndicator/loadingIndicator.html",scope:{},controller:e,controllerAs:"vm",bindToController:!0};return t}angular.module("geldzakenAngular").directive("loadingIndicator",e)}(),function(){"use strict";function e(e,t){return{request:function(t){return e.$broadcast("http:request"),t},response:function(t){return e.$broadcast("http:response"),t},responseError:function(n){return e.$broadcast("http:responseError",n),t.reject(n)}}}e.$inject=["$rootScope","$q"],angular.module("geldzakenAngular").factory("httpInterceptor",e)}(),function(){"use strict";function e(e,t){function n(n){function o(e){return e.data}function r(t){e.error("XHR Failed for getContributors.\n"+angular.toJson(t.data,!0))}return n||(n=30),t.get(a+"/contributors?per_page="+n).then(o)["catch"](r)}var a="https://api.github.com/repos/Swiip/generator-gulp-angular",o={apiHost:a,getContributors:n};return o}e.$inject=["$log","$http"],angular.module("geldzakenAngular").factory("githubContributor",e)}(),function(){"use strict";function e(e,t){var n=this;return n.handle=function(n){e.show(e.alert().clickOutsideToClose(!0).title(t(n.message)).ariaLabel("Error").ok(t("Okay!")))},n}e.$inject=["$mdDialog","localize"],angular.module("geldzakenAngular").service("errorHandler",e)}(),function(){"use strict";function e(e){var t=this;return t.calculate=function(t,n){var a={};e.forEach(t,function(e){a[e.email]=0});for(var o=0;o<n.length;o++){for(var r=n[o],i=e.sum(e.map(r.participants),function(e){return e.paymentParticipation.weight}),l=r.amount/i,s=0;s<r.participants.length;s++){var m=r.participants[s],c=m.paymentParticipation.weight;a[m.email]-=l*c}a[r.payedBy.email]+=r.amount}return a},t}e.$inject=["lodash"],angular.module("geldzakenAngular").service("balanceCalculator",e)}(),function(){"use strict";function e(e,t,n){var a=this;return a.authorized=!1,a.clear=function(){a.authorized=!1},a.go=function(e,n){n=n||{},a.authorized=!0,t.go(e,n)},a.listenForStateChange=function(){a.listener=e.$on("$stateChangeStart",a.stateChange)},a.stateChange=function(e,o,r){!a.authorized&&o.authorized&&(e.preventDefault(),n.set("redirectTo",{state:o.name,params:r}),t.go("public.login"))},a}e.$inject=["$rootScope","$state","localStorageService"],angular.module("geldzakenAngular").service("authorization",e)}(),function(){"use strict";function e(e,t,n,a,o){var r=this;r.processSavedCredentials=function(){i()&&l()&&u()},r.requestToken=function(e,n){t.post(o["public"]+"/login",{email:e,password:n}).success(function(t){s(t),m(e),u()}).error(function(e){throw new Error(e)})},r.logout=function(){n.remove("x-access-token","x-key","me","redirectTo"),a.clear(),e.go("public.login")};var i=function(){return n.get("x-access-token")},l=function(){return n.get("x-key")},s=function(e){n.set("x-access-token",e)},m=function(e){n.set("x-key",e)},c=function(){t.defaults.headers.common={"x-access-token":i(),"x-key":l()}},u=function(){c(),t.get(o["private"]+"/users/"+l()).success(function(e){n.set("me",e);var t=n.get("redirectTo");null!==t?a.go(t.state,t.params):a.go("private.main")}).error(function(e){throw r.logout(),new Error(e)})};return r}e.$inject=["$state","$http","localStorageService","authorization","api"],angular.module("geldzakenAngular").service("authentication",e)}(),function(){"use strict";function e(e,t,n,a){var o=this;o.user={email:"",password:"",name:"",bankAccount:""},o.signup=function(){n.signup(o.user,function(){t.show(t.alert().clickOutsideToClose(!0).title(a("Signed up!")).textContent(a("You can now log in.")).ariaLabel("Signup Confirmation").ok(a("Okay!"))),e.go("public.login")})}}e.$inject=["$state","$mdDialog","userService","localize"],angular.module("geldzakenAngular").controller("SignupController",e)}(),function(){"use strict";function e(e,t,n,a){var o=this,r=n.me();o.settings={email:r.email,name:r.name,bankAccount:r.bankAccount},o.newPassword="",o.save=function(){""!==o.newPassword&&(o.settings.password=o.newPassword),n.update(o.settings,function(){t.show(t.alert().clickOutsideToClose(!0).title(a("Settings were saved!")).ariaLabel("Setting Confirmation").ok(a("Okay!")))})},o["delete"]=function(){n["delete"]()}}e.$inject=["$state","$mdDialog","userService","localize"],angular.module("geldzakenAngular").controller("SettingsController",e)}(),function(){"use strict";function e(){}angular.module("geldzakenAngular").controller("PublicController",e)}(),function(){"use strict";function e(e,t,n,a,o){var r=n.$on("$stateChangeStart",function(){a("sidenav").close()});e.$on("$destroy",function(){r()})}e.$inject=["$scope","$state","$rootScope","$mdSidenav","authentication"],angular.module("geldzakenAngular").controller("PrivateController",e)}(),function(){"use strict";function e(e,t,n,a,o,r,i){var l=this;l.groups=i,l.inactiveGroups=[],l.sorting="name",l.me=o.me();for(var s=0;s<l.groups.length;s++)l.groups[s].membership.active||l.inactiveGroups.push(l.groups[s]);for(var s=0;s<l.groups.length;s++){var m=a.calculate(l.groups[s].members,l.groups[s].payments);l.groups[s].balance=m[l.me.email]}l.show=function(t){e.go("private.group.payments",{id:t.id})},l.openMenu=function(e,t){e(t)},l.confirm=function(e){r.confirm(e.id,function(){l.show(e)})},l.reject=function(n){r.Member["delete"]({group:n.id},function(){e.reload()},function(e){t.show(t.alert().clickOutsideToClose(!0).title(localize("Could not leave group.")).textContent(e.data).ariaLabel("Can't leave group").ok(localize("Okay!")))})}}e.$inject=["$state","$mdDialog","$mdMedia","balanceCalculator","userService","memberService","groups"],angular.module("geldzakenAngular").controller("MainController",e)}(),function(){"use strict";function e(e){e.logout()}e.$inject=["authentication"],angular.module("geldzakenAngular").controller("LogoutController",e)}(),function(){"use strict";function e(e,t){var n=this;n.user={email:"",password:""},n.login=function(){t.requestToken(n.user.email,n.user.password)},t.processSavedCredentials()}e.$inject=["authorization","authentication"],angular.module("geldzakenAngular").controller("LoginController",e)}(),function(){"use strict";function e(e,t,n,a,o,r,i,l){var s=this;s.group=l,s.go=function(e){a.go("private.group."+e,o)},s.setCurrentTab=function(e){e.data&&e.data.selectedTab&&(s.currentTab=e.data.selectedTab)},s.setCurrentTab(a.current);var m=t.$on("$stateChangeSuccess",function(e,t){s.setCurrentTab(t)});e.$on("$destroy",function(){m()})}e.$inject=["$scope","$rootScope","$mdDialog","$state","$stateParams","groupService","userService","group"],angular.module("geldzakenAngular").controller("GroupMainController",e)}()(function(){"use strict";function e(e,t){var n=this;n.group={},n.create=function(){var a=new t.Group({name:n.group.name});a.$save(function(t){e.go("private.group.members",{id:t.id})})}}e.$inject=["$state","groupService"],angular.module("geldzakenAngular").controller("CreateGroupController",e)})(),function(){"use strict";function e(e,t,n,a){n.listenForStateChange(),a.changeLocale("nl"),t.i18n={Overview:"Overzicht",Groups:"Groepen","Log out":"Log uit","Log in":"Log in","Sign up":"Registreer",Settings:"Instellingen","Settings were saved!":"Instelligen opgeslagen!","Can't save settings!":"Instellingen konden niet worden opgeslagen.","Can't delete account!":"Kon account niet verwijderen.",Payments:"Betalingen",Members:"Leden",Cancel:"Annuleer","Are you sure?":"Weet je het zeker?","Settling a group cannot be reverted.":"Afrekenen kan niet teruggedraaid worden.",Settle:"Afrekenen","Settle group":"Reken groep af","Group was settled!":"Groep is afgerekend!","Create a group":"Nieuwe groep","Create group":"Maak groep","Leave group":"Verlaat groep","Left group!":"Groep verlaten!","Could not leave group.":"Kon groep niet verlaten.","Add member":"Nieuw lid","Member was added!":"Lid is toegevoegd!","But won't be visible until he/she confirms.":"Maar verschijnt pas als hij/zij accepteert.",Add:"Voeg toe","Add payment":"Nieuwe betaling",Amount:"Bedrag","Payed by":"Betaald door","Short description":"Korte beschrijving",Everyone:"Iedereen",Reset:"Reset","Payment was added!":"Betaling toegevoegd!","This group doesn't have any payments yet.":"Er zijn nog geen betalingen gedaan.","Delete payment":"Verwijder betaling",Delete:"Verwijder","Payed for":"Betaald voor","There are no payments made in this group.":"Er zijn geen betalingen gedaan in deze groep.","Could not settle.":"Kon niet afrekenen.","Signed up!":"Geregistreerd!","You can now log in.":"Je kunt nu inloggen.","Okay!":"Oke!",Account:"Account","Bankaccount number":"Bankrekening nummer","Email address":"E-mailadres",Password:"Wachtwoord","New password":"Nieuw wachtwoord",Save:"Opslaan","Delete account":"Verwijder account","This is required.":"Dit is verplicht.","I already have an account":"Ik heb al een account","I don't have an account":"Ik heb geen account","Make sure your email address is valid.":"Zorg ervoor dat je e-mailadres klopt.","We only show this to your group members.":"We delen dit alleen met groepsgenoten.","When you settle a group, we calculate the transactions needed to get all balances to zero and mail them to all participants.":"Als je een groep afrekent, berekenen wij welke transacties nodig zijn om ieders balans weer op 0 te zetten. Alle leden krijgen hiervan een overzicht gemaild.",Name:"Naam",Balance:"Stand",Confirm:"Bevestig",Reject:"Negeer","Your groups":"Jouw groepen","New groups":"Nieuwe groepen","Creation date":"Opricht datum",Created:"Gemaakt","Last updated":"Laatst gewijzigd","{num} members":function(e){return e.num+" leden"},"You are not in any groups yet! When you are, they will appear here.":"Je hebt op dit moment nog geen groepen. Zodra dit verandert, verschijnen ze hier."}}e.$inject=["$rootScope","$window","authorization","amMoment"],angular.module("geldzakenAngular").run(e)}(),function(){"use strict";function e(e,t){e.state("public",{templateUrl:"app/public/public.html",controller:"PublicController as vm",anonymous:!0}).state("public.login",{url:"/login",templateUrl:"app/login/login.html",controller:"LoginController as vm",resolve:{$title:["localize",function(e){return e("Log in")}]}}).state("public.signup",{url:"/signup",templateUrl:"app/signup/signup.html",controller:"SignupController as vm",resolve:{$title:["localize",function(e){return e("Sign up")}]}}).state("public.logout",{url:"/logout",templateUrl:"app/logout/logout.html",controller:"LogoutController as ctrl",resolve:{$title:["localize",function(e){return e("Log out")}]}}).state("private",{templateUrl:"app/private/private.html",controller:"PrivateController as vm",authorized:!0}).state("private.main",{url:"/",templateUrl:"app/main/main.html",controller:"MainController as vm",authorized:!0,resolve:{groups:["$stateParams","groupService",function(e,t){return t.Group.query().$promise}],$title:["localize",function(e){return e("Overview")}]}}).state("private.settings",{url:"/settings",templateUrl:"app/settings/settings.html",controller:"SettingsController as vm",authorized:!0,resolve:{$title:["localize",function(e){return e("Settings")}]}}).state("private.createGroup",{url:"/groups/new",templateUrl:"app/group/createGroup.html",controller:"CreateGroupController as vm",authorized:!0,resolve:{$title:["localize",function(e){return e("Create a group")}]}}).state("private.group",{"abstract":!0,url:"/groups/:id",templateUrl:"app/group/main.html",controller:"GroupMainController as vm",authorized:!0,resolve:{group:["$stateParams","groupService",function(e,t){return t.Group.get({group:e.id}).$promise}],$title:["group",function(e){return e.name}]}}).state("private.group.payments",{url:"/payments",templateUrl:"app/group/payments/payments.html",controller:"PaymentsController as vm",authorized:!0,data:{selectedTab:0}}).state("private.group.members",{url:"/members",templateUrl:"app/group/members/members.html",controller:"MembersController as ctrl",authorized:!0,data:{selectedTab:1}}).state("private.group.settle",{url:"/settle",templateUrl:"app/group/settle/settle.html",controller:"SettleController as vm",authorized:!0,data:{selectedTab:2}}).state("private.group.settings",{url:"/settings",templateUrl:"app/group/settings/settings.html",controller:"GroupSettingsController as vm",authorized:!0,data:{selectedTab:3}}),t.otherwise("/")}e.$inject=["$stateProvider","$urlRouterProvider"],angular.module("geldzakenAngular").config(e)}(),function(){"use strict";angular.module("geldzakenAngular").constant("api",{"public":"http://192.168.10.126:8080","private":"http://192.168.10.126:8080/private"})}(),function(){"use strict";function e(e,t,n,a,o){a.theme("default").primaryPalette("indigo").accentPalette("grey"),e.decorator("$exceptionHandler",["$delegate","$injector",function(e,t){return function(e){t.get("errorHandler").handle(e)}}]),t.interceptors.push("httpInterceptor"),n.debugEnabled(!0),o.setPrefix("geldzaken"),o.setStorageCookie(100,"/")}e.$inject=["$provide","$httpProvider","$logProvider","$mdThemingProvider","localStorageServiceProvider"],angular.module("geldzakenAngular").config(e)}(),angular.module("geldzakenAngular").run(["$templateCache",function(e){e.put("app/group/createGroup.html",'<form layout-gt-sm="column" layout-padding=""><md-content class="autoScroll"><md-input-container class="md-block"><label localize="">Name</label> <input type="text" ng-model="vm.group.name"></md-input-container><div class="bottom-sheet-demo inset" layout="column"><md-button type="submit" class="md-primary md-raised" ng-click="vm.create()"><span localize="">Create group</span></md-button></div></md-content></form>'),e.put("app/group/main.html",'<md-tabs md-dynamic-height="" md-border-bottom="" class="md-primary" md-selected="vm.currentTab"><md-tab ng-click="vm.go(\'payments\')"><span localize="">Payments</span></md-tab><md-tab ng-click="vm.go(\'members\')"><span localize="">Members</span></md-tab><md-tab ng-click="vm.go(\'settle\')"><span localize="">Settle</span></md-tab><md-tab ng-click="vm.go(\'settings\')"><span localize="">Settings</span></md-tab></md-tabs><ui-view></ui-view>'),e.put("app/logout/logout.html",""),e.put("app/main/main.html",'<md-content class="md-padding"><md-subheader ng-if="vm.inactiveGroups.length"><span localize="">New groups</span></md-subheader><md-card class="alert" ng-repeat="group in vm.inactiveGroups | orderBy: membership.createdAt"><md-card-title><md-card-title-text><span class="md-headline">{{::group.name}}</span> <span class="md-subhead" am-time-ago="group.membership.createdAt"></span></md-card-title-text></md-card-title><md-card-actions layout="row" layout-align="end center"><md-button ng-click="vm.reject(group)"><span localize="">Reject</span></md-button><md-button ng-click="vm.confirm(group)"><span localize="">Confirm</span></md-button></md-card-actions></md-card><md-subheader ng-if="vm.inactiveGroups.length"><span localize="">Your groups</span></md-subheader><div layout="row" ng-if="vm.groups.length"><md-menu><md-button aria-label="Open phone interactions menu" class="md-icon-button" ng-click="vm.openMenu($mdOpenMenu, $event)"><md-icon md-menu-origin="" class="material-icons">sort</md-icon></md-button><md-menu-content width="4" class="with-radio"><md-radio-group ng-model="vm.sorting"><md-menu-item><md-radio-button ng-click="" value="name" class="md-primary"><span localize="">Name</span></md-radio-button></md-menu-item><md-menu-item><md-radio-button ng-click="" value="-balance" class="md-primary"><span localize="">Balance</span></md-radio-button></md-menu-item><md-menu-item><md-radio-button ng-click="" value="createdAt" class="md-primary"><span localize="">Creation date</span></md-radio-button></md-menu-item></md-radio-group></md-menu-content></md-menu><span flex=""></span></div><md-card class="alert" ng-if="!vm.groups.length"><md-card-content><p localize="">You are not in any groups yet! When you are, they will appear here.</p></md-card-content></md-card><md-list><md-list-item ng-click="vm.show(group)" class="md-2-line" ng-repeat="group in vm.groups | orderBy: vm.sorting" ng-if="group.membership.active"><div class="md-list-item-text"><div layout="row"><h3>{{ group.name }}</h3><span flex=""></span><p ng-class="{ \'red\': group.balance < 0, \'green\': group.balance > 0 }">&euro; {{ group.balance }}</p></div><p localize="" data-num="{{group.members.length}}">{num} members</p></div></md-list-item></md-list></md-content>'),e.put("app/private/private.html",'<md-sidenav class="md-sidenav-left md-whiteframe-z2 sidenav" md-component-id="sidenav"><md-content class="md-accent"><md-divider></md-divider><md-subheader><span localize="">Groups</span></md-subheader><md-menu-item><md-button ui-sref="private.main"><md-icon class="material-icons" md-menu-align-target="">dashboard</md-icon><span localize="">Overview</span></md-button></md-menu-item><md-menu-item ui-sref="private.createGroup"><md-button><md-icon class="material-icons" md-menu-align-target="">add</md-icon><span localize="">Create a group</span></md-button></md-menu-item><md-divider></md-divider><md-subheader localize="">Account</md-subheader><md-menu-item ui-sref="private.settings"><md-button><md-icon class="material-icons" md-menu-align-target="">settings</md-icon><span localize="">Settings</span></md-button></md-menu-item><md-menu-item><md-button href="#/logout"><md-icon class="material-icons" md-menu-align-target="">exit_to_app</md-icon><span localize="">Log out</span></md-button></md-menu-item></md-content></md-sidenav><div layout="column"><toolbar></toolbar><md-content ui-view=""></md-content></div>'),e.put("app/public/public.html",'<div layout="column"><toolbar></toolbar><md-content ui-view=""></md-content></div>'),e.put("app/settings/settings.html",'<form layout-gt-sm="column" layout-padding="" name="settingsForm"><md-content class="autoScroll"><md-input-container class="md-block"><label localize="">Name</label> <input type="text" required="" name="name" ng-model="vm.settings.name"><div ng-messages="settingsForm.name.$error"><div ng-message="required" localize="">This is required.</div></div></md-input-container><md-input-container class="md-block"><label localize="">Bankaccount number</label> <input type="text" required="" name="bankaccount" ng-model="vm.settings.bankAccount"><div ng-messages="settingsForm.bankaccount.$error" md-auto-hide="false"><div ng-message="required" localize="">You can\'t leave this empty.</div></div></md-input-container><md-input-container class="md-block"><label localize="">Email address</label> <input type="email" disabled="" name="email" ng-model="vm.settings.email"></md-input-container><md-input-container class="md-block"><label localize="">New password</label> <input type="password" name="password" ng-model="vm.newPassword"></md-input-container><div layout="column"><md-button type="submit" class="md-primary md-raised" ng-click="vm.save()"><span localize="">Save</span></md-button></div><div layout="column"><md-button type="submit" class="md-primary md-raised md-warn" ng-click="vm.delete()"><span localize="">Delete account</span></md-button></div></md-content></form>'),e.put("app/signup/signup.html",'<form layout-gt-sm="column" layout-padding="" name="signupForm"><md-content class="autoScroll"><md-input-container class="md-block"><label localize="">Email address</label> <input type="email" required="" name="email" ng-model="vm.user.email"><div ng-messages="signupForm.email.$error"><div ng-message="required"><span localize="">This is required.</span></div><div ng-message="email"><span localize="">Make sure your email address is valid.</span></div></div></md-input-container><md-input-container class="md-block"><label localize="">Password</label> <input ng-model="vm.user.password" required="" name="password" type="password"><div ng-messages="signupForm.password.$error"><div ng-message="required"><span localize="">This is required.</span></div></div></md-input-container><md-input-container class="md-block"><label localize="">Name</label> <input type="text" required="" name="name" ng-model="vm.user.name"><div ng-messages="signupForm.name.$error"><div ng-message="required"><span localize="">This is required.</span></div></div></md-input-container><md-input-container class="md-block"><label localize="">Bankaccount number</label> <input type="text" required="" name="bankAccount" ng-model="vm.user.bankAccount"><div ng-messages="signupForm.bankAccount.$error" md-auto-hide="false"><div ng-message="required"><span localize="">We only show this to your group members.</span></div></div></md-input-container><div layout="column"><md-button type="submit" class="md-primary md-raised" ng-click="vm.signup()"><span localize="">Sign up</span></md-button><md-button ui-sref="public.login"><span localize="">I already have an account</span></md-button></div></md-content></form>'),e.put("app/login/login.html",'<form layout-gt-sm="column" layout-padding="" name="loginForm"><md-content class="autoScroll"><md-input-container class="md-block"><label localize="">Email address</label> <input required="" type="email" name="email" ng-model="vm.user.email"><div ng-messages="loginForm.email.$error"><div ng-message="required"><span localize="">This is required.</span></div><div ng-message="email"><span localize="">Make sure your email address is valid.</span></div></div></md-input-container><md-input-container class="md-block"><label localize="">Password</label> <input ng-model="vm.user.password" name="password" type="password"><div ng-messages="loginForm.password.$error"><div ng-message="required"><span localizethis="" is="" required.<="" span=""></span></div></div></md-input-container><div class="bottom-sheet-demo inset" layout="column"><md-button type="submit" class="md-primary md-raised" ng-click="vm.login()"><span localize="">Log in</span></md-button><md-button ui-sref="public.signup"><span localize="">I don\'t have an account</span></md-button></div></md-content></form>'),e.put("app/components/loadingIndicator/loadingIndicator.html",'<span ng-if="vm.show"><md-progress-circular md-mode="indeterminate" class="md-accent"></md-progress-circular></span>'),e.put("app/components/toolbar/toolbar.html",'<md-toolbar class="md-primary"><div class="md-toolbar-tools"><md-button class="md-icon-button" ng-click="vm.toggleSidenav()" ng-show="vm.authorized()"><md-icon class="material-icons">menu</md-icon></md-button><h2><span ng-bind="$title || \'Geldzaken\'"></span></h2><span flex=""></span><loading-indicator></loading-indicator></div></md-toolbar>'),e.put("app/group/settle/settle.html",'<md-content layout-padding=""><p localize="">When you settle a group, we calculate the transactions needed to get all balances to zero and mail them to all participants.</p><div layout="column"><md-button ng-click="vm.settle($event)" class="md-primary md-raised"><span localize="">Settle group</span></md-button></div></md-content>'),e.put("app/group/settings/settings.html",'<form layout-gt-sm="column" layout-padding="" name="settingsForm"><md-content class="autoScroll"><md-input-container class="md-block"><label localize="">Name</label> <input type="text" required="" name="name" ng-model="vm.group.name"><div ng-messages="settingsForm.name.$error"><div ng-message="required"><span localize="">This is required.</span></div></div></md-input-container><div layout="column"><md-button type="submit" class="md-primary md-raised" ng-click="vm.save()"><span localize="">Save</span></md-button></div><div layout="column"><md-button type="submit" class="md-primary md-raised md-warn" ng-click="vm.leave()"><span localize="">Leave group</span></md-button></div><br><br><p><small><span localize="">Created</span> <span am-time-ago="vm.group.createdAt"></span></small><br><small><span localize="">Last updated</span> <span am-time-ago="vm.group.updatedAt"></span></small><br></p></md-content></form>'),e.put("app/group/payments/createPayment.html",'<md-dialog aria-label="Add payment" ng-cloak=""><form><md-toolbar><div class="md-toolbar-tools"><md-icon class="material-icons" ng-click="vm.cancel()">close</md-icon><span flex=""></span><md-button class="md-accent" ng-click="vm.create()"><span localize="">Add</span></md-button></div></md-toolbar><md-dialog-content><md-content class="md-padding autocomplete" layout="column"><form name="paymentForm"><md-input-container><label localize="">Amount</label> <input type="number" step="0.01" name="amount" ng-model="vm.payment.amount" md-autofocus=""></md-input-container><md-input-container><label localize="">Payed by</label><md-select ng-model="vm.payment.payedBy"><md-option ng-repeat="participant in vm.participants" value="{{::participant.email}}">{{::participant.name}}</md-option></md-select></md-input-container><md-input-container class="md-block"><label localize="">Short description</label> <input type="text" name="description" ng-model="vm.payment.description"></md-input-container><div layout="row"><md-button ng-click="vm.increaseAllParticipants()" class="md-raised md-primary" flex="50"><span localize="">Everyone</span> +1</md-button><md-button ng-click="vm.resetAllParticipants()" class="md-raised" flex="50"><span localize="">Reset</span></md-button></div><md-list><md-list-item ng-repeat="participant in vm.participants" ng-click="vm.increaseParticipant(participant)" class="md-with-secondary md-2-line" ng-class="{ \'not-active\': participant.weight == 0 }"><div class="md-list-item-text"><h3>{{::participant.name}}</h3><p>{{participant.weight}}x</p></div><md-icon class="material-icons md-secondary" ng-click="vm.decreaseParticipant(participant)" aria-label="Decrease weight">remove</md-icon></md-list-item></md-list></form></md-content></md-dialog-content></form></md-dialog>'),
e.put("app/group/payments/payments.html",'<md-content class="md-padding"><div layout="row"><md-menu><md-button aria-label="Open phone interactions menu" class="md-icon-button" ng-click="vm.openMenu($mdOpenMenu, $event)"><md-icon md-menu-origin="" class="material-icons">sort</md-icon></md-button><md-menu-content width="4" class="with-radio"><md-radio-group ng-model="vm.sorting"><md-menu-item><md-radio-button value="payedBy.name" ng-click="" class="md-primary"><span localize="">Payed by</span></md-radio-button></md-menu-item><md-menu-item><md-radio-button value="-amount" ng-click="" class="md-primary"><span localize="">Amount</span></md-radio-button></md-menu-item><md-menu-item><md-radio-button value="-createdAt" ng-click="" class="md-primary"><span localize="">Creation date</span></md-radio-button></md-menu-item></md-radio-group></md-menu-content></md-menu><span flex=""></span><md-button ng-click="vm.showCreatePayment($event)"><span localize="">Add payment</span></md-button></div><md-list><md-list-item ng-click="vm.openPaymentOptions($event)" class="md-3-line md-payment" ng-repeat="payment in vm.group.payments | orderBy: vm.sorting"><div></div><div class="md-list-item-text"><div layout="row"><h3>&euro; {{::payment.amount}}</h3><span flex=""></span><p am-time-ago="payment.createdAt"></p></div><p>{{::payment.payedBy.name}} - {{::payment.description}}</p><p><span localize="">Payed for</span> {{::vm.participants_to_string(payment.participants)}}</p></div></md-list-item></md-list><md-card class="alert" ng-if="!vm.group.payments.length"><md-card-content><p localize="">There are no payments made in this group.</p></md-card-content></md-card></md-content>'),e.put("app/group/members/inviteMember.html",'<md-dialog aria-label="Invite someone" ng-cloak=""><form><md-toolbar><div class="md-toolbar-tools"><md-icon class="material-icons" ng-click="vm.cancel()">close</md-icon><span flex=""></span><md-button class="md-accent" ng-click="vm.invite()"><span localize="">Add</span></md-button></div></md-toolbar><md-dialog-content><md-content class="md-padding autocomplete" layout="column"><form name="inviteForm"><md-input-container class="md-block"><label localize="">Email address</label> <input type="email" name="description" ng-model="vm.email" autofocus=""></md-input-container></form></md-content></md-dialog-content></form></md-dialog>'),e.put("app/group/members/members.html",'<md-content class="md-padding"><div layout="row"><md-menu><md-button aria-label="Open phone interactions menu" class="md-icon-button" ng-click="ctrl.openMenu($mdOpenMenu, $event)"><md-icon md-menu-origin="" class="material-icons">sort</md-icon></md-button><md-menu-content width="4" class="with-radio"><md-radio-group ng-model="ctrl.sorting"><md-menu-item><md-radio-button value="name" ng-click="" class="md-primary"><span localize="">Name</span></md-radio-button></md-menu-item><md-menu-item><md-radio-button value="-balance" ng-click="" class="md-primary"><span localize="">Balance</span></md-radio-button></md-menu-item></md-radio-group></md-menu-content></md-menu><span flex=""></span><md-button ng-click="ctrl.showInviteMember($event)"><span localize="">Add member</span></md-button></div><md-list><md-list-item ng-click="" class="md-2-line" ng-repeat="member in ctrl.group.members | orderBy: ctrl.sorting"><div class="md-list-item-text"><div layout="row"><h3>{{ member.name }}</h3><span flex=""></span><p ng-class="{ \'red\': member.balance < 0, \'green\': member.balance > 0 }">&euro; {{ member.balance }}</p></div><p>{{ member.email }}</p></div></md-list-item></md-list></md-content>')}]);
//# sourceMappingURL=../maps/scripts/app-b038ac0106.js.map
