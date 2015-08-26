(function () {
    'use strict';

    angular
        .module('app.dashboard')
        .controller('ModalController', ModalController);
    ModalController.$inject = ['$scope'];
  function ModalController($scope, close) {
         $scope.options = [{label:'False', val:false}, {label:'True', val:true}];
         $scope.isProcessing = false;
         $scope.selectedRecord = {};
    }

    angular.module('app.dashboard').filter('startFrom', function() {
        return function(input, start) {
            if(input) {
                start = +start;
                return input.slice(start);
            }
            return [];
        }
    });


    var modalGetRecord = function($scope, dataservice) {
        $scope.isProcessing = true;
        return dataservice.getRecord($scope.selectedId).then(function (data){
                $scope.selectedRecord = data[0];
                $scope.isProcessing = false;
                $scope.selectedRecord.status_date = new Date($scope.selectedRecord.status_date);
                $scope.selectedRecord.create_date = new Date($scope.selectedRecord.create_date);
                $scope.selectedRecord.destroy_date = new Date($scope.selectedRecord.destroy_date);
                $scope.selectedRecord.isSplunk = ($scope.selectedRecord.isSplunk?1:0);
                $scope.selectedRecord.isAutoDiscovery = ($scope.selectedRecord.isAutoDiscovery?1:0);
                $scope.selectedRecord.isATO = ($scope.selectedRecord.isATO?1:0);
                return $scope.selectedRecord;
            });
    };

    var modalSaveRecord = function($scope, dataservice, cb) {
        $scope.isProcessing = true;
        return dataservice.postRecord($scope.selectedRecord).then(function (data){
            console.log("Post finished",data);
            if(data && data.id){
                data.trClass=""; data.trSelected = false;
                if(data.create_date) data.create_date = new Date(data.create_date);
                if(data.destroy_date) data.destroy_date = new Date(data.destroy_date);
                if(data.status_date) data.status_date = new Date(data.status_date);
                
                var ds = angular.element('#dashboard-view').scope();
                data.recordIndex = ds.vm.records.records.length;
                ds.vm.records.records.push(data);
                angular.element('div.modal').modal('hide');  
            }
            $scope.isProcessing = false;
        });
    };



    angular
        .module('app.dashboard')
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['$q', 'dataservice', 'logger', 'ModalService'];
    /* @ngInject */
    function DashboardController($q, dataservice, logger, ModalService) {
        var vm = this;
        vm.messageCount = 0;
        vm.records = [];
        vm.title = 'All Records';
        vm.showRows = true;
        vm.selectedId = false;
        vm.selectedIndex = false;
        vm.currentPage = 1;
        vm.maxSize = 5;
        vm.entryLimit = 30;
        vm.noOfPages = 1;
        vm.catalogs = {};
        vm.pages = [];
        vm.sortBy = '-status_date';
        vm.showEntriesSelection = 30;
        vm.disableButtons="disabled";
        $q.searchText = '';
        $q.showEntriesSelection = 'all';
        vm.filterObj = "";
        vm.filtered = []; 
        vm.loggedIn = false;
        vm.showPages = false;
        vm.modalFields = [];
        vm.modalHardcoded = { id:true,location:true,status_date:true,system:true,physicalhost:true,physvirtual:true,_v:true,os:true,ato:true,owner:true,splunk:true,auto_discovery:true,create_date:true,destroy_date:true};

        //activate();

        vm.activate = function() {
            vm.loggedIn = true;
            if(vm.records.length < 1) {
                var promises = [ getRecords(), getCatalogs()];
                return $q.all(promises).then(function() {
                    //logger.info('Activated Dashboard View');
                });
            }
        };

        

        function getCatalogs() {
            return dataservice.getCatalogs().then(function (data) {
                vm.catalogs = data;
                for(var i in vm.catalogs.recordSchema){
                    if(!vm.modalHardcoded[vm.catalogs.recordSchema[i].path]){
                        vm.modalFields.push(vm.catalogs.recordSchema[i]);
                    }
                }
                return vm.catalogs;
            });
        }


        function getRecords() {
            return dataservice.getRecords().then(function (data) {
                data.records = data.records.map(function(o,i){
                    o.trClass=""; o.trSelected = false;
                    if(o.create_date) o.create_date = new Date(o.create_date);
                    if(o.destroy_date) o.destroy_date = new Date(o.destroy_date);
                    if(o.status_date) o.status_date = new Date(o.status_date);
                    o.recordIndex = i;
                    return o;
                });
                vm.records = data;
                if(data.records.length>0){
                    vm.showRows = true;
                }
                vm.noOfPages = Math.ceil(data.records.length/vm.entryLimit);
                vm.updatePagination();
                return vm.records;
            });
        }

        vm.toggleSort = function(fieldName) {
            if(vm.sortBy == fieldName ) {
                vm.sortBy = '-'+fieldName;
            } else if( vm.sortBy.indexOf(0)=='-' && vm.sortBy.substr(1)==fieldName) {
                vm.sortBy = fieldName;
            } else {
                vm.sortBy = fieldName;
            }
        };

        vm.selectRow = function(recordIndex,p) {
            //recordIndex = recordIndex+(vm.currentPage-1)*vm.entryLimit;
            if(vm.selectedIndex == recordIndex) { return; }
            if(vm.selectedIndex){
                vm.records.records[vm.selectedIndex].trClass="";
                vm.records.records[vm.selectedIndex].trSelected = false;
            }
            if(vm.lastTr) {
                vm.lastTr.trSelected = false;
            }
            vm.lastTr = p;
            vm.selectedIndex = recordIndex;
            vm.records.records[vm.selectedIndex].trClass="selected";
            vm.records.records[vm.selectedIndex].trSelected = true;
            vm.selectedId = vm.records.records[vm.selectedIndex]._id;
            vm.selectedRecord = null;
            p.trSelected = true;
            vm.disabledButtons="";
            console.log("Selected record id "+vm.records.records[vm.selectedIndex].id);

        };

        vm.showEntries = function() {
            if(vm.showEntriesSelection=="all"){
                vm.entryLimit = 200;
            } else {
                vm.entryLimit = parseInt(vm.showEntriesSelection);
            }
        };

        vm.searchChanged = function() {
            
        };

        vm.updatePaginationApplied = function($scope) {
            $scope.$apply(function(){
                vm.pages = [];
                if(vm.filtered) {
                    vm.noOfPages = Math.ceil( vm.filtered.length / vm.showEntriesSelection);
                    if( vm.noOfPages < 2) {
                        vm.showPages = false;
                        return;
                    }
                }
                vm.showPages = true;
                vm.pages.push({
                    label:"First",
                    active: false,
                    disabled: (vm.currentPage<=1?true:false),
                    number : 1
                });
                vm.pages.push({
                    label:"<<",
                    active:false,
                    disabled: (vm.currentPage<=1?true:false),
                    number: (vm.currentPage>1?vm.currentPage-1:1)
                });
                for(var i=vm.currentPage-1;i<vm.currentPage+3;i++){
                    if(i < 1 || i > vm.noOfPages) continue;
                    vm.pages.push({
                        label: i,
                        active: (i==vm.currentPage?true:false),
                        disabled: (i==vm.currentPage?true:false),
                        number: i
                    });
                };
                vm.pages.push({
                    label:">>",
                    active:false,
                    disabled: (vm.currentPage>=vm.noOfPages?true:false),
                    number: (vm.currentPage<vm.noOfPages?vm.currentPage+1:vm.currentPage)
                });
                vm.pages.push({
                    label:"Last",
                    active: false,
                    disabled: (vm.currentPage>=vm.noOfPages?true:false),
                    number: vm.noOfPages
                });
            });
        };
         vm.updatePagination = function() {
                vm.pages = [];
                if(vm.filtered) {
                    vm.noOfPages = Math.ceil( vm.filtered.length / vm.showEntriesSelection);
                    if( vm.noOfPages < 2) {
                        vm.showPages = false;
                        return;
                    }
                }
                vm.showPages = true;
                vm.pages.push({
                    label:"First",
                    active: false,
                    disabled: (vm.currentPage<=1?true:false),
                    number : 1
                });
                vm.pages.push({
                    label:"<<",
                    active:false,
                    disabled: (vm.currentPage<=1?true:false),
                    number: (vm.currentPage>1?vm.currentPage-1:1)
                });
                for(var i=vm.currentPage-1;i<vm.currentPage+3;i++){
                    if(i < 1 || i > vm.noOfPages) continue;
                    vm.pages.push({
                        label: i,
                        active: (i==vm.currentPage?true:false),
                        disabled: (i==vm.currentPage?true:false),
                        number: i
                    });
                };
                vm.pages.push({
                    label:">>",
                    active:false,
                    disabled: (vm.currentPage>=vm.noOfPages?true:false),
                    number: (vm.currentPage<vm.noOfPages?vm.currentPage+1:vm.currentPage)
                });
                vm.pages.push({
                    label:"Last",
                    active: false,
                    disabled: (vm.currentPage>=vm.noOfPages?true:false),
                    number: vm.noOfPages
                });
            
        };

        vm.selectPage = function(pageNum) {
            vm.currentPage = pageNum;
            vm.updatePagination();
        };

        //have to manually insert bindings into the scope because this modal library breaks it
        vm.bindModal = function(modal, recordID){
            var selectedRecord = recordID;
            var modalTitle = (recordID != -1 ) ? 'Update Record' : 'Create Record';
            var confirmUpdateText = (recordID!=-1) ? 'Update' : 'Save';
            modal.scope.modalTitle = modalTitle;
            modal.scope.confirmUpdateText = confirmUpdateText;
            modal.scope.selectedId = recordID;
            modal.scope.catalogs = vm.catalogs;
            modal.scope.canEdit = true;
            modal.scope.cancelText = "Cancel";
            modal.scope.modalFields = vm.modalFields;
            modal.scope.saveRecord = function(){modalSaveRecord(modal.scope, dataservice);};
            modal.scope.getRecord = function(){modalGetRecord(modal.scope, dataservice);};

            if(recordID != -1 ) {
                modal.scope.getRecord();
            } else {
                modal.scope.selectedRecord = {};
            }
            
            modal.element.modal();
        };

        vm.update = function(recordID) {
            
            ModalService.showModal({
                templateUrl: 'updateModal.html',
                controller: 'ModalController'
            }).then(function(modal){
                vm.bindModal(modal, recordID);
                
            });
        };

        vm.view = function(recordID) {
            ModalService.showModal({
                templateUrl: 'updateModal.html',
                controller: 'ModalController'
            }).then(function(modal){
                modal.scope.modalTitle = "View Record";
                modal.scope.confirmUpdateText = "Close";
                modal.scope.selectedId = recordID;
                modal.scope.catalogs = vm.catalogs;
                modal.scope.modalFields = vm.modalFields;
                modal.scope.canEdit = false; 
                modal.scope.cancelText = "Close";
                modal.scope.getRecord = function(){modalGetRecord(modal.scope, dataservice);};
                modal.scope.getRecord();
                modal.element.modal();
                modal.close.then(function(result){
                    
                });
            });
        };

        vm.toggleShowLatest = function(){
            if(!vm.showSingle) return;
            if(vm.entryLimit==1){
                vm.entryLimit = vm.showEntriesSelection;
                vm.showPages = true;
                vm.updatePagination();
            } else {
                vm.entryLimit = 1;
                vm.showPages = false;
            }
        };

        //tree node selected, update data to filter by selection
        vm.nodeSelected = function($scope, node) {
            $scope.$apply(function(){
                if(!node.li_attr||!node.li_attr.apiType){
                    vm.filterObj = {};
                    return;
                }
                vm.currentPage = 1;
                vm.selectedRecord = null; vm.selectedId = false; vm.selectedIndex = null;
                if(vm.lastTr) {
                    vm.lastTr.trSelected = false;
                }
                var node_id = (node.li_attr.id=="null"?null:node.li_attr.id);
                
                if(node.li_attr.apiType=="os") {
                    vm.entryLimit = vm.showEntriesSelection;
                    vm.showSingle=false;
                    vm.updatePagination();
                    vm.filterObj = {
                        "os" : node_id
                    };
                } else if(node.li_attr.apiType=="os_system") {
                    vm.entryLimit =1;
                    vm.showSingle=true;
                    vm.showPages = false;
                    vm.filterObj = {
                        "os" : node.li_attr.filter_os,
                        "system" : node.li_attr.filter_system
                    };
                    vm.sortBy="-status_date";
                } else if(node.li_attr.apiType=="owner") {
                    vm.entryLimit = vm.showEntriesSelection;
                    vm.showSingle=false;
                    vm.updatePagination();
                    vm.filterObj = {
                        "owner" : (!node_id||node_id=="null"?null:node_id),
                    };
                }
                else if(node.li_attr.apiType=="location") {
                    vm.entryLimit = vm.showEntriesSelection;
                    vm.showSingle=false;
                    vm.updatePagination();
                    vm.filterObj = {
                        "location" : node_id
                    };

                }
                else if(node.li_attr.apiType=="location_physicalhost") {
                    vm.entryLimit = 1;
                    vm.showPages = false;
                    vm.showSingle=true;
                    vm.filterObj = {
                        "location" : node.li_attr.filter_location,
                        "physicalhost" : node.li_attr.filter_physicalhost
                    };
                    vm.sortBy="-status_date";
                } else {
                    vm.filterObj = {};
                }
                setTimeout(function(){
                    vm.updatePaginationApplied($scope);
                },10);
                    
                
            });
        };        


    }

    


})();
