(function() {
    'use strict';

    angular
        .module('app.cm')
        .factory('Cm', Cm);

    Cm.$inject = ['$resource', 'API_BASE_URL'];
    /* @ngInject */
    function Cm($resource, API_BASE_URL) {

        var params = {
            cmId: '@id'
        };

        var actions = {
            update: {
                method: 'PUT'
            }
        };

        var API_URL = API_BASE_URL + '/cm/:cmId';

        return $resource(API_URL, params, actions);

    }

})();
