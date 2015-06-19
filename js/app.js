var myModule = angular.module('Angello', []);

myModule.controller('MainCtrl', function($scope, nuuModel, $filter) { 

    $scope.currentStory;
    $scope.currentMotu = "";
    $scope.currentItumalo = "";
    $scope.searchText       = "";
    $scope.storyExpanded    = [];
    $scope.motus = nuuModel.getMotus();
    $scope.currentMotu = $scope.motus[0];
	$scope.itumalos = [];
    $scope.nuus = [];
    
    $scope.setCurrentStory = function(story) {
        $scope.currentStory = story;
    };

	$scope.showNuus = function() {
		
		return (($scope.currentMotu.name).length > 0 || ($scope.searchText).length > 0);
	};	
		
    $scope.load = function(){
            
			nuuModel.load(function() {
				$scope.nuus = nuuModel.nuus;
				$scope.itumalos = nuuModel.itumalos; 
			});
    };
        
    $scope.changeEvent = function() {
        $scope.nuus = $filter('filterSearch')(nuuModel.nuus, $scope.searchText);
		$scope.nuus = $filter('filterMotu')($scope.nuus, $scope.currentMotu.name);
		if($scope.currentItumalo !== null)
		{
			$scope.nuus = $filter('filterItumalo')($scope.nuus, $scope.currentItumalo.name);
		}
		$scope.itumalos = nuuModel.itumalos[$scope.currentMotu.id];
    }, 
	
    $scope.changeMotu = function(motu) {
		$scope.currentMotu = motu;
		$scope.currentItumalo = null;
		$scope.changeEvent();
		if($scope.itumalos !== undefined)
		{
			$scope.currentItumalo = $scope.itumalos[0];
		}
	},
	
	$scope.changeItumalo = function(itumalo) {
		$scope.currentItumalo = itumalo;
		$scope.changeEvent();
	},

    $scope.toggleStory = function(id)
    {
        var idx = $scope.storyExpanded.indexOf(id);
        if(idx > -1)
        {
            $scope.storyExpanded.splice(idx, 1);
        }
        else
        {
            $scope.storyExpanded.push(id);
        }
    };
            
    $scope.showStory = function(id)
    {
        return ($scope.storyExpanded.indexOf(id) > -1);
    }; 
});

myModule.filter('filterSearch', function() {
	return function(dataArray, searchText){
      if(!dataArray ) return;
      /* when term is cleared, return full array*/
      if( !searchText){
          return dataArray;
       }else{
           /* otherwise filter the array */
           var term=searchText.toLowerCase();
           return dataArray.filter(function(item){

				var malae_match = false;
				if(item.malae !== undefined)
				{
					item.malae.filter(function(value) {
						if(malae_match === false)
						{
							malae_match = (value !== null && value.toLowerCase().indexOf(term) > -1);
						}
					});
				}
				
				var maota_match = false;
				if(item.maota !== undefined)
				{
					item.maota.filter(function(value) {
						if(maota_match === false)
						{
							maota_match = (value !== null && value.toLowerCase().indexOf(term) > -1);
						}
					});
				}
				
				var lagi_match = false;
				if(item.lagi !== undefined)
				{
					item.lagi.filter(function(value) {
						if(lagi_match === false)
						{
							lagi_match = (value !== null && value.toLowerCase().indexOf(term) > -1);
						}
					});
				}
				
                var match = false;
                if((item.name !== null && item.name.toLowerCase().indexOf(term) > -1)     ||
					malae_match || maota_match || lagi_match ||
					(item.faalupega !== null && item.faalupega.toLowerCase().indexOf(term) > -1) ||
					(item.itumalo !== null && item.itumalo.toLowerCase().indexOf(term) > -1)     )
                {
                    match = true;
                }
              return match;    
           });
       } 
  } 
});

myModule.filter('filterMotu', function() {
	return function(dataArray, searchText){
      if(!dataArray ) return;
      /* when term is cleared, return full array*/
      if( !searchText){
          return dataArray;
       }else{
           /* otherwise filter the array */
           var term=searchText.toLowerCase();
           return dataArray.filter(function(item){

                var match = false;
                if((item.motu !== null && item.motu.toLowerCase().indexOf(term) > -1))
                {
                    match = true;
                }
              return match;    
           });
       } 
  } 
});

myModule.filter('filterItumalo', function() {
	return function(dataArray, searchText){
      if(!dataArray ) return;
      /* when term is cleared, return full array*/
      if( !searchText){
          return dataArray;
       }else{
           /* otherwise filter the array */
           var term=searchText.toLowerCase();
           return dataArray.filter(function(item){

                var match = false;
                if((item.itumalo !== null && (item.itumalo == "" || item.itumalo.toLowerCase().indexOf(term) > -1)))
                {
                    match = true;
                }
              return match;    
           });
       } 
  } 
});

myModule.factory('nuuModel', function() {

	var nuuModel = {};
	nuuModel.nuus = [];
	nuuModel.itumalos = [];
	  
    nuuModel.getMotus = function() {
        var tempArray = [
			{id:0,name:''},
            {id:2,name:'Upolu'},
            {id:3,name:'Savai\'i'},
            {id:1,name:'Tutuila'},
			{id:4,name:'Manu\'a'}
        ];    
        return tempArray;
    };
	
	nuuModel.load = function(callback) {
		var tutuila = Object.create(Tutuila.prototype);
            tutuila.load(function(){
				nuuModel.nuus = tutuila.getNuus();
				nuuModel.itumalos = tutuila.getItumalos();
				callback();
            });	
	};			
    
	return nuuModel;
});