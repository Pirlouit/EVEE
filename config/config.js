var mainConfig = {
    lang: "fr", //"fr" or "en"
    units: "metric", //"metric" or "imperial"
    timeFormat: 24, //12 or 24
    clockDate:{
        display: "digital", //"digital" or "analog"
        hourSymbol: "HH", //"HH" or "H"
        displaySeconds: true, //true or false
        showDate: true, //true or false
        dateFormat: "dddd, LL" //https://momentjs.com/docs/#/displaying/ for more info
    },
    widgetWeather:{
        location: "Tournai", //Any city
        country: "BE", //City's country
        view: "full", //full, partial, simple, today or forecast
        displayCityNameOnly: true, //true or false
        forecast: 5, //From 0 to 5; the number of day you want forecast
        loadingAnimation: true //true or false
    },
    speechRecognition:{
        lang: "fr-FR" //Many languages avaiblable
    }
};