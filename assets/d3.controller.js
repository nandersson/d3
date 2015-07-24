var Diablo3App = angular.module('Diablo3App', ['Diablo3Controllers']);

var adminControllers = angular.module('Diablo3Controllers', []);

adminControllers.controller('Diablo3Controller', function Diablo3Controller($scope, $http, $log) {
	$scope.data = null;
	$scope.mappings = [];
	$scope.resources = [];
	
	$scope.tags = [];
	// Convenience array to keep easy access to selected tags
	$scope.selectedTags = [];
	
	$scope.query = "";
		
	$scope.init = function() {
		$http.get('assets/d3.json')
		.success(function(response) {
			$scope.data = response;
			$scope.mappings = response.mappings;
			
			for (var i = response.tags.length - 1; i >= 0; i--) {
				$scope.tags.push({
					name: response.tags[i],
					selected: false
				});
			}
			
			importResources(response.resources);
		});
		
		importResourcesFromJsonUrl('assets/gems-legendary.json');
		importResourcesFromJsonUrl('assets/items-helms.json');
		importResourcesFromJsonUrl('assets/items-helms-spiritstones.json');
	};
	
	importResourcesFromJsonUrl = function(jsonUrl) {
		$http.get(jsonUrl)
		.success(function(response) {
			importResources(response.resources);
		});
	}
	
	importResources = function(resources) {
		// Push all resouces to global resources
		pushAll($scope.resources, resources);
		
		for (var i = resources.length - 1; i >= 0; i--) {
			// Initiate allTags with tags
			resources[i].allTags = [];
			pushAll(resources[i].allTags, resources[i].tags)
			
			// Initiate array with applied mappings
			resources[i].appliedMappings = [];
			
			var done = false;
			
			while (! done) {
				var mappingsFound = false;
				
				for (var j = $scope.mappings.length - 1; j >= 0; j--) {
					// Already applied, skip
					if (arrayContains(resources[i].appliedMappings, $scope.mappings[j].id)) {
						continue;
					}
					
					if (arrayContainsAll(resources[i].allTags, $scope.mappings[j].has)) {
						pushAll(resources[i].allTags, $scope.mappings[j].tags);
						resources[i].appliedMappings.push($scope.mappings[j].id);
						mappingsFound = true;
					}
				}
				
				// Break processing if no more matches has been found
				if (! mappingsFound) {
					done = true;
				}
			}
		}
	}
	
	arrayContains = function(array, item) {
		for (var i = array.length - 1; i >= 0; i--) {
			if (array[i] == item) {
				return true;
			}
		}
		
		return false;
	}
	
	arrayContainsAll = function(array, items) {
		var hasItems = true;
		
		for (var i = items.length - 1; i >= 0; i--) {
			var hasItem = false;
			
			for (var j = array.length - 1; j >= 0; j--) {
				if (items[i] == array[j]) {
					hasItem = true;
					break;
				}
			}
			
			if (! hasItem) {
				hasItems = false;
			}
		}
		
		return hasItems;
	}
	
	pushAll = function(array, items) {
		for (var i = items.length - 1; i >= 0; i--) {
			array.push(items[i]);
		}
	}
	
	removeItem = function(array, item) {
		for (var i = array.length - 1; i >= 0; i--) {
			if (array[i] == item) {
				array.splice(i, 1);
				return;
			}
		}
	}
	
	$scope.toggleTag = function(tag) {
		for (var i = $scope.tags.length - 1; i >= 0; i--) {
			if ($scope.tags[i] == tag) {
				$scope.tags[i].selected = ! $scope.tags[i].selected;
				
				if ($scope.tags[i].selected) {
					$scope.selectedTags.push($scope.tags[i].name);
				}
				else {
					removeItem($scope.selectedTags, $scope.tags[i].name);
				}
			}
		}
	};
	
	$scope.filterBySelectedTags = function(element) {
		return arrayContainsAll(element.allTags, $scope.selectedTags);
	}
	
	$scope.filterByQuery = function(element) {
		if ($scope.query.length == 0) {
			return true;
		}
		
		return element.name.toLowerCase().indexOf($scope.query.toLowerCase()) != -1;
	}
	
	$scope.init();
});