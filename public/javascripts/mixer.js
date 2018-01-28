( function() {
	var app = angular.module('SoundCloudMixer');

	app.controller('mixerCtrl', function($scope, sharedStateService) {
		$scope.sharedData = sharedStateService;

		$scope.deck1LpfCutoff = 1.0;
		$scope.deck1LpfQ = 0;
		$scope.deck1HpfCutoff = 0.0;
		$scope.deck1HpfQ = 0;
		$scope.deck1Pan = 0;
		$scope.deck1Gain = 1.0;
		$scope.deck1Speed = 1.0;
		$scope.deck1CurrentPos = 0;
		$scope.deck1Track="UNLOADED",

		$scope.deck2LpfCutoff = 1.0;
		$scope.deck2LpfQ = 0;
		$scope.deck2HpfCutoff = 0.0;
		$scope.deck2HpfQ = 0;
		$scope.deck2Pan = 0;
		$scope.deck2Gain = 1.0;
		$scope.deck2Speed = 1.0;
		$scope.deck2CurrentPos = 0;
		$scope.deck2Track="UNLOADED",

		$scope.fader = 0;

	    window.AudioContext = window.AudioContext || window.webkitAudioContext;
	    var context = new AudioContext();

		// 2decks
		var deck1 = createDeck();
		var deck2 = createDeck();

		function createDeck() {
//			var audioElement = new Audio();
			return {
//				audio : audioElement,
//				source : context.createMediaElementSource(audioElement),
				databuffer : null,
				source : null,
            	pan : context.createStereoPanner(),
            	lpf : context.createBiquadFilter(),
            	hpf : context.createBiquadFilter(),
            	gain : context.createGain(),
            	playing : false,
				loaded : false,
				currentTime : 0,
				startTime : 0,
//          	analyser : context.createAnalyser(),
//         	 	scriptProcessor : context.createScriptProcessor(2048, 1, 1),
        	};
    	}

	    function loadTrack(trackUrl, deck) {
			stopDeck(deck);
//			deck.audio.src = trackUrl;
//			deck.audio.crossOrigin = "anonymous";

			var request = new XMLHttpRequest();
			var audiobuffer = null;
			var isplay = 0;
			var source = null;

			deck.loaded = 0;

			request.open('GET', trackUrl, true);
			request.responseType = 'arraybuffer';
			request.onload = function() {
				context.decodeAudioData(request.response, function(buffer) {
			        deck.databuffer = buffer;
					deck.loaded = 1;
					$scope.$apply();
			      }, function () {
			        console.debug('error : cannot read data file');
			      });
			};
			request.send();
	    }

		function resetDeck1() {
			$scope.deck1LpfCutoff = 1.0;
			$scope.deck1LpfQ = 0;
			$scope.deck1HpfCutoff = 0.0;
			$scope.deck1HpfQ = 0;
			$scope.deck1Pan = 0;
			$scope.deck1Gain = 1.0;
			$scope.deck1Speed = 1.0;
			$scope.deck1CurrentPos = 0;
		}

		function resetDeck2() {
			$scope.deck2LpfCutoff = 1.0;
			$scope.deck2LpfQ = 0;
			$scope.deck2HpfCutoff = 0.0;
			$scope.deck2HpfQ = 0;
			$scope.deck2Pan = 0;
			$scope.deck2Gain = 1.0;
			$scope.deck2Speed = 1.0;
			$scope.deck2CurrentPos = 0;
		}

	// deck1 controller
    	$scope.play1 = function() {
			playDeck( deck1, $scope.deck1CurrentPos, $scope.deck1Speed );
			// resetDeck1( deck1 );
    	}
    	$scope.stop1 = function() {
			stopDeck( deck1 );
		}
		$scope.isDeck1EnablePlay = function() {
			if ( deck1.loaded ) {
				$scope.deck1Track = $scope.sharedData.loadTrack1.trackName;
			}
			return deck1.loaded;
		}

	// deck2 controller
    	$scope.play2 = function() {
			playDeck( deck2, $scope.deck2CurrentPos, $scope.deck2Speed );
			// resetDeck2( deck2 );
    	}
    	$scope.stop2 = function() {
        	stopDeck( deck2 );
		}
		$scope.isDeck2EnablePlay = function() {
			if ( deck2.loaded ) {
				$scope.deck2Track = $scope.sharedData.loadTrack2.trackName;
			}
			 return deck2.loaded;
		}

	// notice track load
		$scope.$watch(function(){
			return sharedStateService.loadTrack1.trackUrl;
		}, function(){
			if ( $scope.sharedData.loadTrack1 != null ) {
				var trackUrl =  $scope.sharedData.loadTrack1.trackUrl;
				if ( trackUrl != null ) {
					loadTrack( trackUrl, deck1 );
					$scope.deck1Track="LOADING...";
					resetDeck1( deck1 );
				}
			}
		});
		$scope.$watch(function(){
			return sharedStateService.loadTrack2.trackUrl;
		}, function(){
			if ( $scope.sharedData.loadTrack2 != null )	 {
				var trackUrl =  $scope.sharedData.loadTrack2.trackUrl;
				if ( trackUrl != null ) {
					loadTrack( trackUrl, deck2 );
					$scope.deck2Track="LOADING...";
					resetDeck2( deck2 );
				}
			}
		});

	// control deck1 parameter
		$scope.$watch( "deck1LpfCutoff", function() {
  			// Clamp the frequency between the minimum value (40 Hz) and half of the
  			// sampling rate.
			var minValue = 40;
			var maxValue = context.sampleRate / 2;
			// Logarithm (base 2) to compute how many octaves fall in the range.
			var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
		  	// Compute a multiplier from 0 to 1 based on an exponential scale.
			var multiplier = Math.pow(2, numberOfOctaves * ($scope.deck1LpfCutoff - 1.0));
			// Get back to the frequency value between min and max.
			deck1.lpf.frequency.value = maxValue * multiplier;
		});

		$scope.$watch( "deck1LpfQ", function() {
	 		deck1.lpf.Q.value = $scope.deck1LpfQ * 30;
		});

		$scope.$watch( "deck1HpfCutoff", function() {
  			// Clamp the frequency between the minimum value (40 Hz) and half of the
  			// sampling rate.
			var minValue = 40;
			var maxValue = context.sampleRate / 2;
			// Logarithm (base 2) to compute how many octaves fall in the range.
			var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
		  	// Compute a multiplier from 0 to 1 based on an exponential scale.
			var multiplier = Math.pow(2, numberOfOctaves * ($scope.deck1HpfCutoff - 1.0));
			// Get back to the frequency value between min and max.
			deck1.hpf.frequency.value = maxValue * multiplier;
		});

		$scope.$watch( "deck1HpfQ", function() {
	 		deck1.hpf.Q.value = $scope.deck1HpfQ * 30;
		});

		$scope.$watch( "deck1Gain", function() {
//	 		deck1.gain.gain.value = $scope.deck1Gain;
			calcGain();
		});

		$scope.$watch( "deck1Pan", function() {
	 		deck1.pan.pan.value = $scope.deck1Pan;
		});

		$scope.$watch( "deck1Speed", function() {
			if ( deck1.source ) {
	 			deck1.source.playbackRate.value = $scope.deck1Speed;
				if ( deck1.playing ) {
					$scope.deck1CurrentPos += renewCurrentTime(deck1, $scope.deck1Speed)
				}
			}
		});

		$scope.deck1Seek = function() {
			if ( deck1.playing ) {
				if ( deck1.source.buffer.duration ) {
					stopDeck( deck1 );
					$scope.deck1CurrentPos = parseFloat($scope.deck1CurrentPos);
					playDeck( deck1, $scope.deck1CurrentPos, $scope.deck1Speed );
				}
			}
		};

	// control deck2 parameter
		$scope.$watch( "deck2LpfCutoff", function() {
  			// Clamp the frequency between the minimum value (40 Hz) and half of the
  			// sampling rate.
			var minValue = 40;
			var maxValue = context.sampleRate / 2;
			// Logarithm (base 2) to compute how many octaves fall in the range.
			var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
		  	// Compute a multiplier from 0 to 1 based on an exponential scale.
			var multiplier = Math.pow(2, numberOfOctaves * ($scope.deck2LpfCutoff - 1.0));
			// Get back to the frequency value between min and max.
			deck2.lpf.frequency.value = maxValue * multiplier;
		});

		$scope.$watch( "deck2LpfQ", function() {
	 		deck2.lpf.Q.value = $scope.deck2LpfQ * 30;
		});

		$scope.$watch( "deck2HpfCutoff", function() {
  			// Clamp the frequency between the minimum value (40 Hz) and half of the
  			// sampling rate.
			var minValue = 40;
			var maxValue = context.sampleRate / 2;
			// Logarithm (base 2) to compute how many octaves fall in the range.
			var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
		  	// Compute a multiplier from 0 to 1 based on an exponential scale.
			var multiplier = Math.pow(2, numberOfOctaves * ($scope.deck2HpfCutoff - 1.0));
			// Get back to the frequency value between min and max.
			deck2.hpf.frequency.value = maxValue * multiplier;
		});

		$scope.$watch( "deck2HpfQ", function() {
	 		deck2.hpf.Q.value = $scope.deck2HpfQ * 30;
		});

		$scope.$watch( "deck2Gain", function() {
			calcGain();
		});

		$scope.$watch( "deck2Pan", function() {
	 		deck2.pan.pan.value = $scope.deck2Pan;
		});

		$scope.$watch( "deck2Speed", function() {
			if ( deck2.source ) {
	 			deck2.source.playbackRate.value = $scope.deck2Speed;
				if ( deck2.playing ) {
					$scope.deck2CurrentPos += renewCurrentTime(deck2, $scope.deck2Speed)
				}
			}
		});

		$scope.deck2Seek = function() {
			if ( deck2.playing ) {
				if ( deck2.source.buffer.duration ) {
					stopDeck( deck2 );
					$scope.deck2CurrentPos = parseFloat($scope.deck2CurrentPos);
					playDeck( deck2, $scope.deck2CurrentPos, $scope.deck2Speed );
				}
			}
		};

		$scope.$watch( "fader", function() {
			calcGain();
		});

		function playDeck(deck, startPos, speed) {
			if ( !deck.playing ) {
				deck.playing = true;

				deck.source = context.createBufferSource();
				deck.source.loop = false;
        		deck.source.buffer = deck.databuffer;
				deck.source.playbackRate.value = speed;

				deck.lpf.type = 'lowpass'
				deck.hpf.type = "highpass";

	            deck.source.connect(deck.gain);
	            deck.gain.connect(deck.lpf);
	            deck.lpf.connect(deck.hpf);
	            deck.hpf.connect(deck.pan);
	            deck.pan.connect(context.destination);

				deck.source.start(0.0, ( deck.source.buffer.duration * startPos ) / 100 );
				deck.startTime = context.currentTime;
				deck.currentTime = context.currentTime;

//      		deck.panner.connect(deck.analyser);
//      		deck.analyser.connect(deck.scriptProcessor);
//		      	deck.scriptProcessor.connect(context.destination);
	        }
		}

		function stopDeck(deck) {
        	if ( deck.playing ) {
				deck.source.stop();
            	deck.playing = false;
        	}
		}

		function calcGain() {
        	var fader = $scope.fader;
        	var gain1 = $scope.deck1Gain;
        	var gain2 = $scope.deck2Gain;

	        if ( fader > 0 ) {
				deck1.gain.gain.value = gain1 * ( ( 100 - fader * 100 ) / 100 );
	            deck2.gain.gain.value = gain2;
	        } else if(fader < 0) {
	            deck2.gain.gain.value = gain2 * ( ( fader * 100 + 100 ) / 100 );
	            deck1.gain.gain.value = gain1;
	        } else if(fader == 0) {
	            deck1.gain.gain.value = gain1;
	            deck2.gain.gain.value = gain2;
	        }
		}

		function renewCurrentTime(deck, speed) {
			if ( deck.source.buffer.duration ) {
				var deltaSec = (context.currentTime - deck.currentTime) * speed;
				var deltaPos = ( deltaSec * 100.0) / deck.source.buffer.duration;
				deck.currentTime = context.currentTime;
				return parseFloat(deltaPos);
			}
			return 0.0;
		}

		setInterval( function() {
			if ( deck1.playing ) {
				$scope.deck1CurrentPos =  parseFloat($scope.deck1CurrentPos) + renewCurrentTime(deck1, $scope.deck1Speed);

				if ( $scope.deck1CurrentPos > 100 ) {
					console.log("deck1 finished!! : " + $scope.deck1CurrentPos );
					stopDeck(deck1);
					$scope.deck1CurrentPos = 0.0;
				}
				$scope.$apply();
 			}

			if ( deck2.playing ) {
				$scope.deck2CurrentPos = parseFloat($scope.deck2CurrentPos) + renewCurrentTime(deck2, $scope.deck2Speed)

				if ( $scope.deck2CurrentPos > 100 ) {
					console.log("deck2 finished!! : " + $scope.deck2CurrentPos);
					stopDeck(deck2);
					$scope.deck2CurrentPos = 0.0;
				}
				$scope.$apply();
 			}
        }, 1000);
	});
})();
