(function() {
    'use strict';

    angular
        .module('app.cm')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'listCm',
                config: {
                    url: '/cm',
                    templateUrl: 'app/cm/views/list.html',
                    controller: 'CmController',
                    controllerAs: 'vm',
                    title: 'List Cms',
                    settings: {
                        nav: 3,
                        content: '<i class="fa fa-folder-open"></i> Cms'
                    }
                }
            },
            {
                state: 'createCm',
                config: {
                    url: '/cm/create',
                    templateUrl: 'app/cm/views/create.html',
                    controller: 'CmController',
                    controllerAs: 'vm',
                    title: 'Create Cm'
                }
            },
            {
                state: 'viewCm',
                config: {
                    url: '/cm/:cmId',
                    templateUrl: 'app/cm/views/view.html',
                    controller: 'CmController',
                    controllerAs: 'vm',
                    title: 'View Cm'
                }
            },
            {
                state: 'editCm',
                config: {
                    url: '/cm/:cmId/edit',
                    templateUrl: 'app/cm/views/edit.html',
                    controller: 'CmController',
                    controllerAs: 'vm',
                    title: 'Edit Cm'
                }
            }
        ];
    }
})();
