(function() {
    'use strict';

    angular
        .module('app.layout')
        .controller('SidebarController', SidebarController);

    SidebarController.$inject = ['$state', 'routerHelper'];
    /* @ngInject */
    function SidebarController($state, routerHelper) {
        var vm = this;

        vm.nodeSelected = function(scope, obj){
            var d_scope = angular.element('#dashboard-view').scope();
            d_scope.vm.nodeSelected(d_scope, obj.node);
        };
    }
})();
