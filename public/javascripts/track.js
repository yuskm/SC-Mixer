(function() {
	var CLIENT_ID = '56ee4d4d76716d4f4059509d8fcd9b7c';

	var app = angular.module('SoundCloudMixer');
	app.controller('searchTrackCtrl', function($scope, sharedStateService) {
		$scope.searchResults = [];
		$scope.sharedData = sharedStateService;

		SC.initialize({
		  client_id: CLIENT_ID
		});

		$scope.searchTracks = function() {
	    	$scope.searchResults = [];
			SC.get('/tracks', { q: $scope.keyword }, function(tracks) {
		    	for (var i in tracks) {
		        	$scope.searchResults.push(tracks[i]);
		    	}
				$scope.$apply();
		    });
		}

		$scope.loadTrack1 = function(track) {
			loadTrack(track, $scope.sharedData.loadTrack1);
		}

		$scope.loadTrack2 = function(track) {
			loadTrack(track, $scope.sharedData.loadTrack2);
		}

		function loadTrack(track, strDst) {
			strDst.trackUrl = track.stream_url + '?client_id=' + CLIENT_ID;
			strDst.trackName = track.title + ' / ' + track.user.username;
			strDst.artworkUrl = track.artwork_url;
		}
	});
}());
