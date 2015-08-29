(function() {
    'use strict';

    angular
        .module('app.layout')
        .controller('LoginController', LoginController);

    //LoginController.$inject = ['$state', 'routerHelper'];
    /* @ngInject */
    function LoginController($scope) {
        var vm = this;
        vm.scope = $scope;
    }
})();
