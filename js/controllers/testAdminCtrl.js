/*global registerCtrl, angular */
'use strict';
var testApp = angular.module('testApp', ['debounce','ui.bootstrap']);

testApp.controller("testAdminCtrl", ['$scope', '$window', '$q', '$filter',
                                     function($scope, $window, $q, $filter) {
                                         
    $scope.storeId          = $window.storeId;
    $scope.storeLocationId  = $window.storeLocationId;
    $scope.testCollection   = Object.create(TestCollection.prototype);
    $scope.searchTest       = "";
    $scope.fullCollection   = [];
    $scope.current_test     = null;
    $scope.itemsExpanded    = [];

    $scope.changeEvent = function() {
        $scope.testCollection.collection = $filter('filterTest')($scope.fullCollection, $scope.searchTest);
    },
            
    $scope.toggleItem = function(id)
    {
        var idx = $scope.itemsExpanded.indexOf(id);
        if(idx > -1)
        {
            $scope.itemsExpanded.splice(idx, 1);
        }
        else
        {
            $scope.itemsExpanded.push(id);
        }
    },
            
    $scope.showItem = function(id)
    {
        return ($scope.itemsExpanded.indexOf(id) > -1);
    },     
            
    $scope.load = function()
    {
        $scope.testCollection.load(function() {
            $scope.fullCollection = $scope.testCollection.collection;
        });
    }
}]);

testApp.filter('filterTest', function() {
	return function(dataArray, searchTest){
      if(!dataArray ) return;
      /* when term is cleared, return full array*/
      if( !searchTest){
          return dataArray;
       }else{
           /* otherwise filter the array */
           var term=searchTest.toLowerCase();
           return dataArray.filter(function(test){

                var match = false;
                if((test.name !== null && test.name.toLowerCase().indexOf(term) > -1)     ||
                   (test.text !== null && test.text.toLowerCase().indexOf(term) > -1)     )
                {
                    match = true;
                }
              return match;    
           });
       } 
  } 
});


testApp.directive('focusMe', function($timeout, $parse) {
  return {
    link: function(scope, element, attrs) {
      var model = $parse(attrs.focusMe);
      scope.$watch(model, function(value) {
        console.log('value=',value);
        if(value === true) { 
          $timeout(function() {
            element[0].focus(); 
          });
        }
      });
    }
  };
});


