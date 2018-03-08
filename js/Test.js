
var fadeInTime = 2000;
var fadeOutTime = 1000;
var showMsgTime = 2000;
var hideMsgTime = 200;

var homeWords = ["Bonjour", "I am Evee", "I am your<br/>connected mirror", "You can ask me<br/>whatever you want"];
var homeWrodsPronounce = ["Hello", "I'm Eavee", "I'm your<br/>connected mirror", "You can ask me<br/>whatever you want"]
var homeWordsIndex = 0;
var wrapper;

var speechSynth; 


$(function() {
	speechSynth = window.speechSynthesis;
	var voices = speechSynth.getVoices();
	for(var i = 0; i < voices.length; i++){
		console.log( i + ": name = " + voices[i].name);
		console.log( i + ": lang = " + voices[i].lang);
	}
	console.log("voices" + voices);

	compliment = document.createTextNode(homeWords[homeWordsIndex]);
	wrapper = document.createElement("div");
	wrapper.className = "thin xlarge bright";
	wrapper.appendChild(compliment);
	document.getElementById("divCenter").appendChild(wrapper);
	
	$("body").fadeOut(0);
	$("body").fadeIn(3000, function(){
		var utter = new SpeechSynthesisUtterance(homeWrodsPronounce[homeWordsIndex]);
		//utter.lang = "en-US";
		//speechSynth.speak(utter);
		//showHideMsgStart();
		setTimeout(function(){
			$("#divCenter").fadeOut(1200);
		}, 5000);
	});
});

function showHideMsgStart(){
	window.setTimeout(hideMessage, showMsgTime);
}

function showNextMessage(){
	$("#divCenter").fadeIn(fadeInTime, function(){
		var utter = new SpeechSynthesisUtterance(homeWrodsPronounce[homeWordsIndex]);
		//speechSynth.speak(utter);
		window.setTimeout(hideMessage, showMsgTime);
	});
}

function hideMessage(){
	homeWordsIndex++;
	$("#divCenter").fadeOut(fadeOutTime, function(){		
		if(homeWordsIndex == homeWords.length){
			homeWordsIndex = 0;
			window.setTimeout(showNextMessage, 5000);
			wrapper.innerHTML = homeWords[homeWordsIndex];
			return;
		}			
		wrapper.innerHTML = homeWords[homeWordsIndex];
		showNextMessage();
	});
}