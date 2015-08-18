(function() {
    'use strict';

    angular
        .module('app.layout')
        .controller('ShellController', ShellController);

    ShellController.$inject = ['$rootScope', '$timeout', 'config', 'logger'];
    /* @ngInject */
    function ShellController($rootScope, $timeout, config, logger) {
        var vm = this;
        vm.busyMessage = 'Please wait ...';
        vm.isBusy = true;
        vm.navline = {
            title: 'CMDB',
            text : 'sdfdsfd'
        };
        vm.username = "Not Logged In";
        vm.loggedIn =  false;

        $rootScope.doLogin = function(){
            console.log("login!");
            console.log($rootScope);
            login();
        };
        $rootScope.logout = function(){
            logout();
        };

        activate();

        function activate() {
            //logger.success(config.appTitle + ' loaded!', null);
            //hideSplash();
            $rootScope.showSplash = true;
            $rootScope.showSplashLogin = true;
        }

        function hideSplash() {
            //Force a 1 second delay so we can see the splash.
            $timeout(function() {
                $rootScope.showSplash = false;
            }, 1000);
        }

        function logout() {
            vm.username = "Not logged in";
            vm.loggedIn = false;
            $rootScope.showSplash = true;
            $rootScope.showSplashLogin = true;
            angular.element('#dashboard-view').scope().vm.loggedIn = false;
            console.log("logging out!");
        }

        function login() {
            vm.username = "Test User";
            vm.loggedIn = true;
            $rootScope.showSplash = false;
            angular.element('#dashboard-view').scope().vm.activate();
        }
    }
})();
