/* Copyright start 
  MIT License
  Copyright (c) 2024 Fortinet Inc
  Copyright end */
'use strict';

(function () {
    angular
        .module('cybersponse')
        .factory('socManagementService', socManagementService);

    socManagementService.$inject = ['$q', '$http', 'API', '$resource', 'ALL_RECORDS_SIZE', 'PromiseQueue', 'Modules', 'playbookService'];

    function socManagementService($q, $http, API, $resource, ALL_RECORDS_SIZE, PromiseQueue, Modules, playbookService) {
        var service = {
            getResourceData: getResourceData,
            getPlaybookRun: getPlaybookRun,
            getPlaybookActionExecuted: getPlaybookActionExecuted,
            getStatusByPicklistName: getStatusByPicklistName,
            getConfig: getConfig,
            getAllPlaybooks:getAllPlaybooks
        };
        return service;

        function getResourceData(resource, queryObject) {
            var defer = $q.defer();
            $resource(API.QUERY + resource).save(queryObject.getQueryModifiers(), queryObject.getQuery(true)).$promise.then(function (response) {
                defer.resolve(response);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        }

        function getPlaybookRun(queryObject, supportedVersion) {
            var defer = $q.defer();
            if (supportedVersion) {
                playbookService.getPlaybookLogs(queryObject, {stripTrailingSlashes: false}).then(function (response) {
                    defer.resolve(response);
                }, function (error) {
                    defer.reject(error);
                });
            } else {
                var url = API.WORKFLOW + 'api/query/workflow_logs/';
                $resource(url,{}, {}, {stripTrailingSlashes: false}).save(queryObject).$promise.then(function (response) {
                    defer.resolve(response);
                }, function (error) {
                    defer.reject(error);
                });
            }
            return defer.promise;
        }

        function getAllPlaybooks(queryObject){
            var defer = $q.defer();
            var url = 'api/query/workflows';
            $resource(url).save(queryObject, function (response) {
                defer.resolve(response);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        }

        function getPlaybookActionExecuted(queryObject) {
            var defer = $q.defer();
            var url = API.WORKFLOW + 'api/workflows/metrics/?&';
            $resource(url).get(queryObject, function (response) {
                defer.resolve(response);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        }
        
        function getStatusByPicklistName(_name) {
            var deferredPicklists = $q.defer();
            var query = {
                module: 'picklist_names',
                $limit: ALL_RECORDS_SIZE,
                $relationships: true,
                $orderby: 'name',
                $export: false,
                name: _name
            };
            var promise = PromiseQueue.get('picklistsByName' + _name);
            if (!promise) {
                promise = Modules.get(query).$promise;
                PromiseQueue.set('picklistsByName' + _name, promise);
            }
            promise.then(function (data) {
                deferredPicklists.resolve(data['hydra:member']);
                PromiseQueue.clear('picklistsByName' + _name);
            });
            return deferredPicklists.promise;
        }
        
        function getConfig() {
            return $http.get('widgets/installed/socManagement-2.1.1/assets/socWidgetInput.json');
        }
    }
})();