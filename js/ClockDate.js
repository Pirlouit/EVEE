
var showWeek= false;
var showPeriod= false;
var showPeriodUpper= true;
var clockBold= false;

/* Wrappers */
var dateWrapper;
var timeWrapper;
var secondsWrapper;
var periodWrapper;
var weekWrapper;

moment.locale(mainConfig.lang);

$(function() {
  Init();
});
function Init(){	
	CreateWrapper();
	window.setInterval(UpdateDigitalClock, 1000);	
}

function UpdateDigitalClock(){
	var now = moment();
	
	//Secondes
	var sec = now.format("ss");
	secondsWrapper.innerHTML =  sec;
	if (sec != 0)
		return;
	
	//Minutes + Heure	
	var timeString;	
	if(mainConfig.timeFormat == 24)		
		timeString = now.format(mainConfig.clockDate.hourSymbol + ":mm");
	else{
		timeString = now.format(mainConfig.clockDate.hourSymbol.toLowerCase() + ":mm");
	}	
	timeWrapper.innerHTML = timeString;

	if (mainConfig.clockDate.displaySeconds) {
		timeWrapper.appendChild(secondsWrapper);
	}	
	if((mainConfig.clockDate.timeFormat == 24 && parseInt(timeString) != 0) || 
		(mainConfig.clockDate.timeFormat == 12 && parseInt(timeString) != 1))
		return;

	if(mainConfig.timeFormat != 24){
		periodWrapper.innerHTML = " " + now.format("A");
		timeWrapper.appendChild(periodWrapper);
	}
	
	//Date
	if(mainConfig.clockDate.showDate){
		dateWrapper.innerHTML = now.format(mainConfig.clockDate.dateFormat);
	}
	
	//Semaine
	if (showWeek) {
		weekWrapper.innerHTML = "WEEK" + " " + now.week();
	}	
}

function CreateWrapper() {			

	var wrapper = document.createElement("div");

	dateWrapper = document.createElement("div");
	timeWrapper = document.createElement("div");
	secondsWrapper = document.createElement("sup");
	periodWrapper = document.createElement("span");
	weekWrapper = document.createElement("div");
	// Style Wrappers
	dateWrapper.className = "date normal medium";
	timeWrapper.className = "time bright large light";
	secondsWrapper.className = "dimmed";
	periodWrapper.className = "medium dimmed"
	weekWrapper.className = "week dimmed medium";

	var timeString;
	var now = moment();
	
	secondsWrapper.innerHTML =  now.format("ss");
	if(mainConfig.timeFormat == 24)		
		timeWrapper.innerHTML = now.format(mainConfig.clockDate.hourSymbol + ":mm");
	else{
		timeWrapper.innerHTML = now.format(mainConfig.clockDate.hourSymbol.toLowerCase() + ":mm");
	}
	
	if (mainConfig.clockDate.displaySeconds) {
		timeWrapper.appendChild(secondsWrapper);
	}

	if(mainConfig.timeFormat != 24){
		periodWrapper.innerHTML = " " + now.format("A");
		timeWrapper.appendChild(periodWrapper);
	}
	
	//Date
	if(mainConfig.clockDate.showDate){
		dateWrapper.innerHTML = now.format(mainConfig.clockDate.dateFormat);
	}
	
	//Semaine
	if (showWeek) {
		weekWrapper.innerHTML = "WEEK" + " " + now.week();
	}



	if (mainConfig.clockDate.display === "digital") {
		// Display only a digital clock
		wrapper.appendChild(dateWrapper);
		wrapper.appendChild(timeWrapper);
		wrapper.appendChild(weekWrapper);
	} else {
		console.error("Only digital clock available for the moment..\nDisplaying digital anyway.")			
		wrapper.appendChild(dateWrapper);
		wrapper.appendChild(timeWrapper);
		wrapper.appendChild(weekWrapper);
	}

	document.getElementById("topLeft").appendChild(wrapper);
}