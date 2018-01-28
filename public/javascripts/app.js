(function() {
	var app = angular.module("SoundCloudMixer", []);
	app.factory("sharedStateService", function () {
		var loadTrack = { loadTrack1 : {
			trackUrl : null,
			artworkUrl : null,
			trackName : null
		}, loadTrack2 : {
			trackUrl : null,
			artworkUrl : null,
			trackName : null
		} };
		return loadTrack;
	});
})();

function addEvent(element, eventName, callback) {
	if (element.addEventListener) {
		element.addEventListener(eventName, callback, false);
	} else {
		element.attachEvent(eventName, callback, false);
	}
}

function updateConsole(value) {
	consoleBox.value = value +"\n" + consoleBox.value;
}
