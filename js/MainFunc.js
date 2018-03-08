//EVEE//
function btnClick(){
    //PlayYTSound($('#mTxt').val());
    //BuildYTIframe("http://www.google.com");
    //BuildMapIframe($('#mTxt').val());
    BuildViewIframe($('#mTxt').val());
}
$(function(){
    //PlayYTSound("un mix chill");
    //BuildViewIframe("jardin lecocq clermont ferrand");
   //setTimeout(FirstHello, 3000);   
   //FirstHello();
});

var hasSaidHello = false

function FirstHello()
{    
    if(hasSaidHello)
        return;

    hasSaidHello = true;

    var todayDate = moment().format("dddd D MMMM");

    var sentence =  "Bonjour.";
    sentence +=     "Aujourd'hui nous sommes le " + todayDate + "."
    sentence +=     getNowTimeSentence();
    sentence +=     getPhraseFromWeather("");
    sentence +=     "Je vous met maintenant votre radio préféré pour écouter les informations."
    sentence +=     "Je vous souhaite une agréable journée."

    responsiveVoice.speak(sentence);
    setTimeout(BuildRadioIframe, 28000);
    return;        
}

function getNowTimeSentence(){
    var heure = moment().format("H");

    if(heure == "12")
        heure = "midi";
    else if(heure == "0")
        heure ="minuit";
    else
        heure = heure + " heures ";
    var minute = moment().format("m");
    minute = (minute == 0) ? "" : minute;

    return "Il est " + heure + minute + ".";
}
function PlayYTSound(query){
    console.log("PlayYTSound");
    $.get(
        'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&type=video&videoCategoryId=10&regionCode=US&relevanceLanguage=en&publishedAfter=2016-01-01T00:00:00Z&order=viewCount&key=AIzaSyAOsn8X5GT5Dqcws9c312cIqGSGYuVg2p8&q=' + query,
        function(data, status){
            //$('#data').empty();
            /*
            for(var i= 0; i < data.items.length; i++){                
                $('#data').append(" - " + i + ": " +data.items[i].id.videoId + "  " + data.items[i].snippet.title + "<br/>");
            }*/
            console.log("PlayYTSound suceed");
            var s = 'https://www.youtube.com/embed/' + data.items[0].id.videoId;
            BuildYTIframe(s, data.items[0].snippet.title);
        }
    );
}

function BuildYTIframe(url, musicName){
    $('#musicContainer').fadeOut(500,
        function(){
            var p = '<p class="small">Music:<br/>' + musicName + '</p>';
            console.log("BuildYTFrame")
            $('#musicContainer').empty();        
            var i = '<iframe width="0" height="0" src=' + url + '?autoplay=1&loop=1&rel=0&amp;controls=0&amp;showinfo=0" frameborder="0" allowfullscreen></iframe>';
            $('#musicContainer').append(i);
            $('#musicContainer').append(p);
            $('#musicContainer').fadeIn(1000);
        }
    );
}

function BuildRadioIframe(){
    $('#musicContainer').fadeOut(500,
        function(){
            var p = '<p class="small">Radio:<br/> Classic 21</p>';
            console.log("BuildRadioFrame")
            $('#musicContainer').empty();        
            var i = '<iframe width="0" height="0" src="/iframe/radio/classic21.html" frameborder="0" ></iframe>';
            $('#musicContainer').append(i);
            $('#musicContainer').append(p);
            $('#musicContainer').fadeIn(1000);
        }
    );
}

function RemoveYTIframe(){
    $('#musicContainer').fadeOut(500,
        function(){
            $('#musicContainer').empty();
        }
    );
}

function BuildMapIframe(place){
    $('#divCenter').fadeOut(500,
        function(){
            console.log("Build Map Frame")
            $('#divCenter').empty();     
            var i = '<iframe width="500" height="350" frameborder="0" style="border:0; margin:auto;" src="https://www.google.com/maps/embed/v1/place?key=AIzaSyAOsn8X5GT5Dqcws9c312cIqGSGYuVg2p8&q=' + place + '" allowfullscreen>';
            $('#divCenter').append(i);
            $('#divCenter').fadeIn(1000);
        }
    );
}

function BuildViewIframe(place){
    $('#divCenter').fadeOut(500,
        function(){
            console.log("Build Map Frame")
            $('#divCenter').empty();
            GetCenterFromPlace(place);
        }
    );
}

function GetCenterFromPlace(place){    
    $.get(
        'https://maps.googleapis.com/maps/api/geocode/json?address='+ place +'&key=AIzaSyAOsn8X5GT5Dqcws9c312cIqGSGYuVg2p8',
        function(data, status){
            var coord = data.results[0].geometry.location;
            var bounds = data.results[0].geometry.bounds;
            var type = data.results[0].types[0];
            var mapDim ={
                width: 500,
                height: 350
            }

            
            var zoom = getBoundsZoomLevel(bounds, mapDim);
            console.log("type = " + type);
            zoom = (type == "locality" ? 13 : zoom);
            console.log("zoom = " + zoom);

            var i = '<iframe width="500" height="350" frameborder="0" style="border:0; margin:auto;" src="https://www.google.com/maps/embed/v1/view?key=AIzaSyAOsn8X5GT5Dqcws9c312cIqGSGYuVg2p8&maptype=satellite&zoom='+zoom+'&center=' + coord.lat +','+ coord.lng +'" allowfullscreen>';
            $('#divCenter').append(i);
            $('#divCenter').fadeIn(1000);
        }
    );
}

function getBoundsZoomLevel(bounds, mapDim) {
    var WORLD_DIM = { height: 256, width: 256 };
    var ZOOM_MAX = 21;

    function latRad(lat) {
        var sin = Math.sin(lat * Math.PI / 180);
        var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
        return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    }

    function zoom(mapPx, worldPx, fraction) {
        return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    }

    var ne = bounds.northeast;
    var sw = bounds.southwest;

    var latFraction = (latRad(ne.lat) - latRad(sw.lat)) / Math.PI;

    var lngDiff = ne.lng - sw.lng;
    var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

    var latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
    var lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

    return Math.min(latZoom, lngZoom, ZOOM_MAX);
}



function RemoveCenterDivContent(){
    $('#divCenter').fadeOut(500,
        function(){
            console.log("Back to menu")
            $('#divCenter').empty();
        }
    );
}