var lang;
var timeFormat;
var loc;
var descTranslate = {
"Partly Cloud"            :"Partiellement Nuageux",
"Showers"                 :"Averses",
"AM Showers"              :"Averses Matinales",
"PM Showers"              :"Averses En Soirée",
"PM Thunderstorms"        :"Orages En Soirée",
"Scattered Thunderstorms" :"Orages Dispersés",
"Light Rain with Thunder" :"Fine pluie avec orage",
"Thunderstorms"           :"Orages",
"Heavy Rain"              :"Forte pluie",
"Mostly Sunny"            :"Plutot Ensoleillé",
"Light Rain"              :"Fine Pluie",
"Fog"                     :"Brouillard",
"Fair"                    :"Beau",
"Sunny"                   :"Ensoleillé",
"AM Rain"                 :"Pluie Matinale",
"PM Rain"                 :"Pluis En Soirée",
"Mostly Cloudy"           :"Plutôt Nuageux",
"Isolated Thunderstorms"  :"Orages Isolés",
"Thundershowers"          :"Orages Pluvieux",
"Heavy Thunderstorms"     :"Forts Orages",
"Clear"                   :"Dégagé",
"Rain"                    :"Pluvieux",
"Cloudy"                  :"Nuageux" }

var synthWeatherDesc = {
	"Partly Cloud"            :"Partiellement Nuageux",
	"Showers"                 :"Averses",
	"AM Showers"              :"Averses Matinales",
	"PM Showers"              :"Averses En Soirée",
	"PM Thunderstorms"        :"Orages En Soirée",
	"Scattered Thunderstorms" :"Orages Dispersés",
	"Light Rain with Thunder" :"Fine pluie avec orage",
	"Thunderstorms"           :"Orages",
	"Heavy Rain"              :"Forte pluie",
	"Mostly Sunny"            :"Plutot Ensoleillé",
	"Light Rain"              :"Fine Pluie",
	"Fog"                     :"Brouillard",
	"Fair"                    :"Beau",
	"Sunny"                   :"Ensoleillé",
	"AM Rain"                 :"Pluie Matinale",
	"PM Rain"                 :"Pluis En Soirée",
	"Mostly Cloudy"           :"Plutôt Nuageux",
	"Isolated Thunderstorms"  :"Orages Isolés",
	"Thundershowers"          :"Orages Pluvieux",
	"Heavy Thunderstorms"     :"Forts Orages",
	"Clear"                   :"Dégagé",
	"Rain"                    :"Pluvieux",
	"Cloudy"                  :"Nuageux" } 
 
function getPhraseFromWeather(){
	var phrase = "Aujourd'hui, il fera 12° avec un temps .../accompagné de/d'...";
}

// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {
		
		var pluginName = "flatWeatherPlugin";

		// Create the defaults once
	    var defaults = {
				lang: "en",
				location: "Waterloo, ON", //city, region
				country: "Canada", //country
				displayCityNameOnly: false,
				api : "yahoo", //api: yahoo or openweathermap
				forecast: 5, //number of days to forecast, max 5
				apikey : "", //optional api key for openweathermap
				view : "full", //options: simple, today, partial, forecast, full
				render : true, //render: false if you to make your own markup, true plugin generates markup
				loadingAnimation: true, //show loading animation
				units : "metric" //or "imperial" default: "auto"
			};

		var apiurls = {
			"openweathermap" : ["http://api.openweathermap.org/data/2.5/weather", "http://api.openweathermap.org/data/2.5/forecast/daily"],
			"yahoo" : ["https://query.yahooapis.com/v1/public/yql"]
		};

		// Plugin Constructor
		function Plugin (element, options ) {

			this.element = element;

			// jQuery has an extend method which merges the contents of two or
			// more objects, storing the result in the first object. The first object
			// is generally empty as we don't want to alter the default options for
			// future instances of the plugin
			this.settings = $.extend( {}, defaults, options );
			//set units if otherwise not set
			if (!this.settings.units || this.settings.units == "auto") {
				//basically just support for auto units of USA
				this.settings.units = (["united states", "usa", "united states of america", "us"].indexOf(this.settings.country.toLowerCase()) == -1)?"metric":"imperial";
			}
			this.settings.units = mainConfig.units;
			//bound forecast to max of 5 days, api won't return more then that
			this.settings.forecast = Math.min(this.settings.forecast, 5); 
			
			//store plugin name for local reference
			this._name = pluginName;
			
			this.once = false;
			
			lang = mainConfig.lang;
			timeFormat = mainConfig.timeFormat;
			loc = this.settings.location;

			//call initilizaiton
			this.init();
		};

		// Avoid Plugin.prototype conflicts
		$.extend(Plugin.prototype, {
			init: function () {
				//if you want the pluging to render markup init will do all the work
				//otherwise you are on your own
				if (this.settings.render) {

					//if first run show loading icon (if enabled)
					if (this.settings.loadingAnimation && !this.once) {
						//add a loading spinner, animated with css
						this.loading = $("<div/>", {"id" : "flatWeatherLoading", "class" : "wi loading"});
						this.loading.appendTo(this.element);
					}
					
					this.fetchWeather().then(this.render, this.error);
					
				}
				this.once = true; //init has happened, can be used to prevent some init tasks happening again
			},
			fetchWeather: function () {
				//Fetches the weather from the API with an ajax request
				//Returns a promise of (weather object, this)

				//scope of this for nested functions
				var that = this;

				//create promise
				var promise = new $.Deferred();


				//data params to send along with each ajax request
				//array because some apis may require multiple requests
				//params[0] is sent to apiurls[api][0] and so on
				var params = []; 

				//build location query string
				var location = this.settings.location + " " + this.settings.country;
				
				//yahoo weather uses c and f for metric/imperial unit identifiers,
				//convert our stored text string to match what they expect
				var u = (this.settings.units == "metric")?"c":"f";
				
				//see yahoo yql weather api for details on params passed to api
				var parameters = {}; 
				parameters.q = "select * from weather.forecast where woeid in (select woeid from geo.places(1) where text='" + location + "') AND u='" + u +"'";
				parameters.env = "store://datatables.org/alltableswithkeys"; //some sort of api version info... because yahoo.
				parameters.format = "json";
				params.push(parameters);

				//for each request send the associated paramaters, then when all are done render all data
				var requests = []; //requests sent
				//for each url in apiurls for the api set, send the associated params to it in an ajax request
				for (var i = 0; i < apiurls[this.settings.api].length; i++) {
					//jquery ajax request promise
					requests.push($.get(apiurls[this.settings.api][i], params[i]));
				}

				//when all request promises are done
				$.when.apply(this, requests)
		    	.done(function(){
		    		
		    		//grab the result from the promise as passed by arguments 
		    		//and convert it to an actual array with slice
		    		var args = Array.prototype.slice.call(arguments);

					//remove a layer of nesting for easier use
					 //the [0] element is the result, the rest of the array is
					 //info about the ajax request and promise that we can toss
					if (requests.length > 1) {
						//if multiple requests, each promise result of the ajax request is part of an array
						args = args.map(function(val) { return val[0]});
					}
					else {
						args = args[0];
					}
				

					//check for results that returned http 200 but had errors from api
					if (that.settings.api == "yahoo" && (args.query.count == 0 || args.query.results.channel.description == "Yahoo! Weather Error")) {
						//yahoo weather really should return a better error checking method.
						console.log("Error interacting with the yahoo api see error object below for details:");
						console.log(args);
						promise.reject(args, that);
					}
					else {

						//now take that fancy api data and map it to a common format with datamapper function
						var weather = datamapper(args, that.settings);
						
						that._weather = weather; //store it on the instance

						$.data( that.element, "weather", weather); //and store it on the DOM for general use
						
						promise.resolve(weather, that);

					}


		    	})
				.fail(function(error){  	
					//TODO draw fails.
					console.log("fail");
					promise.reject(error, that);
				 });

				return promise;

			},
			error : function(error, context) {

				if (!context) {
					//if called directly and not via plugin we need to set context to this vs passed when a promise
					context = this;
				}

				if (context.settings.loadingAnimation && context.settings.render) {
					context.loading.remove(); //remove loading spinner
				}

				if (context.settings.api == "yahoo") {
					
					if (error.query.results) {
						error = "Error: " + error.query.results.channel.item.title + ". See console log for details.";
					}
					else {
						error = "Error: no results. See console log for details.";
					}
				}

				var div = $("<div/>", {"class": "flatWeatherPlugin " + context.settings.view});
				$("<h2/>").text("Error").appendTo(div);
				$("<p/>").text(error).appendTo(div);
				$(context.element).html(div); //recall that this.element is set in plugin constructor
				return $(context.element);
			},
			//Generates the DOM elements
			render : function (weather, context) {

				if (!context) {
					//if called directly and not via plugin we need to set context to this vs passed when a promise
					context = this;
					weather = this._weather;
				}

				//string showing degree symbol + F or C
				var degrees = context.settings.units == "metric"?"&#176;C":"&#176;F";
				
				if (context.settings.loadingAnimation && context.settings.render) {
					context.loading.remove(); //remove loading spinner
				}

				//Now that we have everything lets make a dom fragment of our data.
				//Then append that fragment once to the dom once its all made.
				//There is a bunch of if switches for various view options but this
				//is mostly self-explainatory dom generating code from the weather object
				var div = $("<div/>", {"class": "flatWeatherPlugin " + context.settings.view});
				
				if (context.settings.displayCityNameOnly) {
					$("<h2/>").text(weather.city).appendTo(div);
				}
				else {
					$("<h2/>").text(weather.location).appendTo(div);
				}
				
				
				if (context.settings.view != "forecast") {
					var today = $("<div/>", {"class": "wiToday"});
					var iconGroup = $("<div/>", {"class": "wiIconGroup"});
					$("<div/>", {"class" : "wi "+ "wi"+weather.today.code}).appendTo(iconGroup);
					$("<p/>", {"class" : "wiText"}).html(weather.today.desc).appendTo(iconGroup);
					iconGroup.appendTo(today);
					$("<p/>", {"class" : "wiTemperature"}).html(weather.today.temp.now + "<sup>" + degrees + "</sup>").appendTo(today);
					today.appendTo(div);
				}

				if (context.settings.view != "simple") {
					var detail = $("<div/>", {"class": "wiDetail"});
					
					if (context.settings.view == "partial") {
						$("<p/>", {"class" : "wiDay"}).text(weather.today.day).appendTo(today);
					}

					if (context.settings.view != "partial") {
						if (context.settings.view != "today") {
							$("<p/>", {"class" : "wiDay"}).text(weather.today.day).appendTo(detail);
						}
						var astro = $("<ul/>", {"class" : "astronomy"}).appendTo(detail);
						$("<li/>", {"class" : "wi sunrise"}).text(weather.today.sunrise).appendTo(astro);
						$("<li/>", {"class" : "wi sunset"}).text(weather.today.sunset).appendTo(astro);
						var temp = $("<ul/>", {"class" : "temp"}).appendTo(detail);
						$("<li/>").html("Max : " + weather.today.temp.max + "<sup>" + degrees + "</sup>").appendTo(temp);
						$("<li/>").html("Min : " + weather.today.temp.min + "<sup>" + degrees + "</sup>").appendTo(temp);
						var atmo = $("<ul/>", {"class" : "atmosphere"}).appendTo(detail);
						$("<li/>", {"class" : "wi humidity"}).text(weather.today.humidity + "%").appendTo(atmo);
						//$("<li/>", {"class" : "wi pressure"}).text(weather.today.pressure).appendTo(atmo);
						$("<li/>", {"class" : "wi wind"}).text(formatWind(weather.today.wind.speed, weather.today.wind.deg, context.settings.units)).appendTo(atmo);
						detail.appendTo(today);
					}


					if (context.settings.view != "today" || context.settings.view == "forecast") {
						var forecast = $("<ul/>", {"class": "wiForecasts"});
						var startingIndex = (context.settings.view == "forecast")?0:1;
						//index should include today for forecast view exclude for other views
						for (var i = startingIndex; i < weather.forecast.length; i++) {
							var day = $("<li/>", {"class" : "wiDay"}).html("<span>"+weather.forecast[i].day+"</span>").appendTo(forecast);
							var sub = $("<ul/>", {"class" : "wiForecast"}).appendTo(day);
							$("<li/>", {"class" : "wi "+ "wi"+ weather.forecast[i].code}).appendTo(sub);
							$("<li/>", {"class" : "wiMax"}).html(weather.forecast[i].temp.max + "<sup>" + degrees + "</sup>").appendTo(sub);
							$("<li/>", {"class" : "wiMin"}).html(weather.forecast[i].temp.min + "<sup>" + degrees + "</sup>").appendTo(sub);
						}
						forecast.appendTo(div);
					}
				}

 
				//now append our dom fragment to the target element
				$(context.element).html(div); //recall that this.element is set in plugin constructor

				return $(context.element);

			}

		});


		//jQuery Constructor
		// A lightweight plugin wrapper on the jquery fn constructor,
		// preventing against multiple instantiations on the same element
		$.fn[pluginName] = function ( options, args ) {
			if ($.isFunction(Plugin.prototype[options])) {
				//enable function access via .flatWeatherPlugin('function', 'args')
				//grab the plugin instance from the dom reference and call function with any args
				//return the results of the  
				return this.data("plugin_" + pluginName)[options](args);
			}
			//return this for jquery chainability
			return this.each(function() {
				//check if plugin has been attached to the dom
				if (!$.data(this, "plugin_" + pluginName)) {
					var plugin = new Plugin(this, options); //call constructor
					return $.data(this, "plugin_" + pluginName, plugin); //attach plugin instance to the dom data
				}
			});
		};


		/* 
		//datamapper converts raw aka dirty un-standardize data from either api
		//into a unified format for easier use as follows:
			{
				location : String, //as returned back from api
				today : {
					temp : {
						//temperatures are in units requested from api
						now : Number, ex. 18 
						min : Number, ex. 24
						max : Number ex. 12
					},
					desc : String, ex. "Partly Cloudy"
					code : Number, ex. "801" see css or weather codes for meaning
					wind : {
						speed : 4, //either km/h or mph
						deg : Number, //direction in degrees from North
					},
					pressure : Number, //barometric pressure
					humidity : Number, //% humidity
					sunrise : Time,
					sunset : Time,
					day :  String,

				},
				forecast : [{Day: String, code:Number, desc: String, temp : {min:number, max:number}}]
			}
		//note: input data is in an array of the returned api result request(s) in the same order as setup in the apiurls
		//All data manipulation and cleaning up happens below
		//making this was tedious.
		*/
		function datamapper (input, settings) {

			var out = {}; //map input to out

			if (settings.api == "yahoo") {

				//key = yahoo code, value = standard code (based on openweathermap codes)
				var codes = {
					0  : "900",	//tornado
					1  : "901",	//tropical storm
					2  : "902",	//hurricane
					3  : "212",	//severe thunderstorms
					4  : "200",	//thunderstorms
					5  : "616",	//mixed rain and snow
					6  : "612",	//mixed rain and sleet
					7  : "611",	//mixed snow and sleet
					8  : "511",	//freezing drizzle
					9  : "301",	//drizzle
					10 : "511",	//freezing rain
					11 : "521",	//showers
					12 : "521",	//showers
					13 : "600",	//snow flurries
					14 : "615",	//light snow showers
					15 : "601",	//blowing snow
					16 : "601",	//snow
					17 : "906",	//hail
					18 : "611",	//sleet
					19 : "761",	//dust
					20 : "741",	//foggy
					21 : "721",	//haze
					22 : "711",	//smoky
					23 : "956",	//blustery
					24 : "954",	//windy
					25 : "903",	//cold
					26 : "802",	//cloudy
					27 : "802",	//mostly cloudy (night)
					28 : "802",	//mostly cloudy (day)
					29 : "802",	//partly cloudy (night)
					30 : "802",	//partly cloudy (day)
					31 : "800",	//clear (night)
					32 : "800",	//sunny
					33 : "951",	//fair (night)
					34 : "951",	//fair (day)
					35 : "906",	//mixed rain and hail
					36 : "904",	//hot
					37 : "210",	//isolated thunderstorms
					38 : "210",	//scattered thunderstorms
					39 : "210",	//scattered thunderstorms
					40 : "521",	//scattered showers
					41 : "602",	//heavy snow
					42 : "621",	//scattered snow showers
					43 : "602",	//heavy snow
					44 : "802",	//partly cloudy
					45 : "201",	//thundershowers
					46 : "621",	//snow showers
					47 : "210",	//isolated thundershowers
				   3200: "951",	//not available... alright... lets make that sunny.
				}

				input = input.query.results.channel; //get rid of a bunch of silly yahoo nested objects;
				
				out.location =  input.location.city + ", " + input.location.country;
				out.city = loc;

				out.today = {};
				out.today.temp = {};
				out.today.temp.now = Math.round(input.item.condition.temp);
				out.today.temp.min = Math.round(input.item.forecast[0].low);
				out.today.temp.max = Math.round(input.item.forecast[0].high);

				if(lang == "fr")
					out.today.desc = descTranslate[input.item.condition.text.capitalize()]
				else
					out.today.desc = input.item.condition.text.capitalize();

				out.today.code = codes[input.item.condition.code]; //map weather code

				out.today.wind = {};
				out.today.wind.speed = input.wind.speed;
				out.today.wind.deg = input.wind.direction;
				out.today.humidity = input.atmosphere.humidity;
				out.today.pressure = input.atmosphere.pressure;
				if(timeFormat == 24){
					out.today.sunrise = convertAMPMTime(input.astronomy.sunrise);					
					out.today.sunset = convertAMPMTime(input.astronomy.sunset);
				}
				else{
					out.today.sunrise = input.astronomy.sunrise.toUpperCase();
					out.today.sunset = input.astronomy.sunset.toUpperCase();
				}

				out.today.day = getDayString(new Date());
				
				out.forecast = [];
				//grab only the number of forecast days desired from settings
				for (var i = 0; i < settings.forecast; i++) {
					var forecast = {};
					forecast.day = getDayString(new Date(input.item.forecast[i].date));
					forecast.code = codes[input.item.forecast[i].code]; //map weather code
					forecast.desc = input.item.forecast[i].text.capitalize();
					forecast.temp = {max: Math.round(input.item.forecast[i].high), min: Math.round(input.item.forecast[i].low)}
					out.forecast.push(forecast);
				}
			}

			return out;

		};

		//Helpers
		String.prototype.capitalize = function() {
		    return this.charAt(0).toUpperCase() + this.slice(1);
		};

		//take a date object and return a day string
		function getDayString(date) {
			if(lang == "fr")
				return ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'][date.getDay()];
			else
		  		return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][date.getDay()];
		};

		//converts and epoch time in seconds to hours in the day
		function epochToHours(date) {
		  date = new Date(date * 1000);
		  var hours =  date.getHours();
		  var minutes = date.getMinutes();
		  var strTime;
		  if(lang == "fr"){
			minutes = minutes < 10 ? '0'+minutes : minutes;
			strTime = hours + ':' + minutes;
		  }
		  else{			  
			var ampm = hours >= 12 ? 'PM' : 'AMer';
			hours = hours % 12;
			hours = hours ? hours : 12; // the hour '0' should be '12'
			minutes = minutes < 10 ? '0'+minutes : minutes;
			strTime = hours + ':' + minutes + ' ' + ampm;
		  }
		  return strTime;
		};

		function convertAMPMTime(time){
			var hours = Number(time.match(/^(\d+)/)[1]);
			var minutes = Number(time.match(/:(\d+)/)[1]);
			var AMPM = time.match(/\s(.*)$/)[1];
			if(AMPM == "pm" && hours<12) hours = hours+12;
			if(AMPM == "am" && hours==12) hours = hours-12;
			var sHours = hours.toString();
			var sMinutes = minutes.toString();
			if(minutes<10) sMinutes = "0" + sMinutes;
			return sHours + ":" + sMinutes;
		}

		//Takes wind speed, direction in degrees and units 
		//and returns a string ex. (8.5, 270, "metric") returns "W 8.5 km/h"
		function formatWind(speed, degrees, units) {
			var wd = degrees;
			if ((wd >= 0 && wd <= 11.25) || (wd > 348.75 && wd <= 360))  {
				wd = "N";
			}
			else if (wd > 11.25 && wd <= 33.75){
				wd = "NNE";
			}
			else if (wd > 33.75 && wd <= 56.25){
				wd = "NE";
			}
			else if (wd > 56.25 && wd <= 78.75){
				wd = "ENE";
			}
			else if (wd > 78.75 && wd <= 101.25){
				wd = "E";
			}
			else if (wd > 101.25 && wd <= 123.75){
				wd = "ESE";
			}
			else if (wd > 123.75 && wd <= 146.25){
				wd = "SE";
			}
			else if (wd > 146.25 && wd <= 168.75){
				wd = "SSE";
			}
			else if (wd > 168.75 && wd <= 191.25){
				wd = "S";
			}
			else if (wd > 191.25 && wd <= 213.75){
				if(lang == "fr")
					wd = "SSO"
				else
					wd = "SSW";
			}
			else if (wd > 213.75 && wd <= 236.25){
				if(lang == "fr")
					wd = "SO"
				else
					wd = "SW";
			}
			else if (wd > 236.25 && wd <= 258.75){
				if(lang == "fr")
					wd = "OSO"
				else
					wd = "WSW";
			}
			else if (wd > 258.75 && wd <= 281.25){
				if(lang == "fr")
					wd = "O"
				else
					wd = "W";
			}
			else if (wd > 281.25 && wd <= 303.75){
				if(lang == "fr")
					wd = "ONO"
				else
					wd = "WNW";
			}
			else if (wd > 303.75 && wd <= 326.25){
				if(lang == "fr")
					wd = "NO"
				else
					wd = "NW";
			}
			else if (wd > 326.25 && wd <= 348.75){
				if(lang == "fr")
					wd = "NNO"
				else
					wd = "NNW";
			}
			if(units == "metric")
				var s = parseInt(parseFloat(speed) * 0.621371);
			else
				var s = (parseFloat(speed) / 0.621371).toFixed(2);
			var speedUnits = (units == "metric")?"km/h":"mph";
			return wd + " " + s + " " + speedUnits;
		};


})( jQuery, window, document );
