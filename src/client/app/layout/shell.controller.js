(function() {
    'use strict';

    angular
        .module('app.layout')
        .controller('ShellController', ShellController);

    ShellController.$inject = ['$rootScope', '$timeout', 'config', 'logger', '$http', '$window'];
    /* @ngInject */
    function ShellController($rootScope, $timeout, config, logger, $http, $window) {
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
			console.log('trying login test..');
			var error = function(){
				var error = 'Error: See HPC Administrator';
				$scope.LogVal = error;
				setTimeout(function(){
					$scope.LogVal = 'Log In';
					$scope.$apply();
				}, 3000);
			}

			var config = {
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
			};
			var postUrl = 'https://localhost/request_cert/cmdb_cert_get.php?callback=JSON_CALLBACK';
			$http.jsonp(postUrl, null, config)
			.success(function(data) {
				$rootScope.token = data.token;
				var logStr = new String($window.jwt_decode(data.token).user);
				$rootScope.user = logStr.replace('.', ' ');
            	login();
			})
			.error(function() {
				console.log('error');
			});

        };
        $rootScope.logout = function(){
            logout();
        };

        activate();

        function activate() {
            //logger.success(config.appTitle + ' loaded!', null);
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
            vm.username = $rootScope.user;
            vm.loggedIn = true;
            $rootScope.showSplash = false;
            angular.element('#dashboard-view').scope().vm.activate();
        }

    }
})();
