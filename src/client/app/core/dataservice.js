(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('dataservice', dataservice);

    dataservice.$inject = ['$http', '$q', 'logger', '$rootScope', '$window'];
    /* @ngInject */
    function dataservice($http, $q, logger, $rootScope, $window) {		
        var service = {
            getRecords: getRecords,
            getMessageCount: getMessageCount,
            getRecord: getRecord,
            postRecord: postRecord,
            getCatalogs: getCatalogs
        };
        var categories = {};
        var categoriesLoaded = false;

        return service;

        function getMessageCount() { return $q.when(72); }

        function getRecord(recordID) {			
            return $http.get('/api/cm/'+recordID)
                .then(function(response){
                    return response.data;
                })
                .catch(function(error){
                    var msg = 'query for record ['+recordID+'] failed. ' + error.data.description;
                    logger.error(msg);
                    return $q.reject(msg);
                });
        }

        function postRecord(newRecord) {
			if($window.clickTime>$window.jwt_decode($rootScope.token).expiration){
				$window.location.reload();
				//console.log('click time: ' + console.log('no expiration') + ' expiration ' + $window.jwt_decode($rootScope.token).expiration);
			}
			console.log("Posting record: ",newRecord);
			return $http.post('/api/cm', newRecord)
				.then(function(response){
					return response.data;
				})
				.catch(function(error){
					var msg = 'Update for record failed. ' + error.data.description;
					logger.error(msg);
					return $q.reject(msg);
				});
        }

        function getCatalogs() {
            if(categoriesLoaded){
                return categories;
            }
            return $http.get('/api/cm/catalogs')
                .then(function(response){
                    categories = response.data;
                    categoriesLoaded = true;
                    return response.data;
                })
                .catch(function(error){
                    var msg = 'query for counts failed. ' + error.data.description;
                    logger.error(msg);
                    return $q.reject(msg);
                });
        }

        function getRecords() {
            console.log("getRecords called");
            return $http.get('/api/cm')
                .then(success)
                .catch(fail);

            function success(response) {
                return response.data;
            }

            function fail(error) {
                var msg = 'query for records failed. ' + error.data.description;
                logger.error(msg);
                return $q.reject(msg);
            }
        }
    }
})();
