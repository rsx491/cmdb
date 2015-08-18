(function () {
    'use strict';

    angular
        .module('app.cm')
        .controller('CmController', CmController);

    CmController.$inject = ['logger',
        '$stateParams',
        '$location',
        'Cm',
        'TableSettings',
        'CmForm'];
    /* @ngInject */
    function CmController(logger,
        $stateParams,
        $location,
        Cm,
        TableSettings,
        CmForm) {

        var vm = this;

        vm.tableParams = TableSettings.getParams(Cm);
        vm.cm = {};

        vm.setFormFields = function(disabled) {
            vm.formFields = CmForm.getFormFields(disabled);
        };

        vm.create = function() {
            // Create new Cm object
            var cm = new Cm(vm.cm);

            // Redirect after save
            cm.$save(function(response) {
                logger.success('Cm created');
                $location.path('cm/' + response.id);
            }, function(errorResponse) {
                vm.error = errorResponse.data.summary;
            });
        };

        // Remove existing Cm
        vm.remove = function(cm) {

            if (cm) {
                cm = Cm.get({cmId:cm.id}, function() {
                    cm.$remove(function() {
                        logger.success('Cm deleted');
                        vm.tableParams.reload();
                    });
                });
            } else {
                vm.cm.$remove(function() {
                    logger.success('Cm deleted');
                    $location.path('/cm');
                });
            }

        };

        // Update existing Cm
        vm.update = function() {
            var cm = vm.cm;

            cm.$update(function() {
                logger.success('Cm updated');
                $location.path('cm/' + cm.id);
            }, function(errorResponse) {
                vm.error = errorResponse.data.summary;
            });
        };

        vm.toViewCm = function() {
            vm.cm = Cm.get({cmId: $stateParams.cmId});
            vm.setFormFields(true);
        };

        vm.toEditCm = function() {
            vm.cm = Cm.get({cmId: $stateParams.cmId});
            vm.setFormFields(false);
        };

        activate();

        function activate() {
            //logger.info('Activated Cm View');
        }
    }

})();
