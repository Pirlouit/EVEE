const artyom = new Artyom();

$(function() {
    startContinuousArtyom();

    $("#trash").flatWeatherPlugin(mainConfig.widgetWeather);
});

// This function activates artyom and will listen all that you say forever (requires https conection, otherwise a dialog will request if you allow the use of the microphone)
function startContinuousArtyom(){
    artyom.fatality();// use this to stop any of

    setTimeout(function(){// if you use artyom.fatality , wait 250 ms to initialize again.
         artyom.initialize({
            lang:mainConfig.speechRecognition.lang,// A lot of languages are supported. Read the docs !
            continuous:true,// Artyom will listen forever
            listen:true, // Start recognizing
            debug:true, // Show everything in the console
            speed:1 // talk normally
        }).then(function(){
            console.log("Ready to work !");
        });
    },250);
}

//artyom.NOT_COMMAND_MATCHED()

// Savoir l'heure
artyom.addCommands({
    indexes:["quelle heure est-il", "tu peux me dire l'heure", "peu-tu me dire l'heure qu'il est", "il est quelle heure"],
    action:function(i){
        var now = moment();
        var heure = now.format("HH");
        //console.log(heure + ":" + now.format("mm"));
        if(heure == "12")
            heure = "midi";
        if(heure == "00")
            heure ="minuit";

        artyom.say("il est " + heure + " heure " + now.format("mm"));
    }
});

artyom.addCommands({
    indexes:["allume la caméra", "allume l'appareil photo"],
    action:function(i){
        turnOnCamera();
        artyom.say("caméra allumé");
    }
});

artyom.addCommands({
    indexes:["éteint la caméra", "éteint l'appareil photo"],
    action:function(i){
        turnOffCamera();
        artyom.say("caméra éteinte");
    }
});

artyom.addCommands({
    indexes:["prends une photo", "prends la photo"],
    action:function(i){
        takePhoto();        
    }
});

artyom.addCommands({
    indexes:["enregistre la photo", "sauve la photo"],
    action:function(i){
        savePhoto();        
    }
});

artyom.addCommands({
    indexes:["supprime la photo", "annuler la photo"],
    action:function(i){
        turnOnCamera();        
    }
});

/********* METEO *********/
artyom.addCommands({
    smart: true,
    indexes:["quelle sera la météo *", "quelle est la météo *", "comment sera la météo *", "quel temps fera-t-il *"],
    action:function(i, wildcard){
        artyom.say(getPhraseFromWeather(wildcard));
    }
});





// Afficher une carte d'une ville
artyom.addCommands({
    smart: true,
    indexes:["montre-moi une carte de *", "montre-moi une carte du *"], // These spoken words will trigger the execution of the command
    action:function(i, wildcard){ // Action to be executed when a index match with spoken word
        console.log("Map triggered -> ", wildcard);
        BuildMapIframe(wildcard);
    }
});

// Afficher la direction pour aller d'un endroit à un autre
artyom.addCommands({
    smart: true,
    indexes:["montre-moi la route pour aller de *"], // These spoken words will trigger the execution of the command
    action:function(i, wildcard){ // Action to be executed when a index match with spoken word
        console.log("Roads triggered -> "+ wildcard);
        //artyom.say("Hey buddy ! How are you today?");
    }
});

// Afficher la direction pour aller d'un endroit à un autre
artyom.addCommands({
    smart: true,
    indexes:["montre-moi une vue de *", "montre-moi une vue du *"], // These spoken words will trigger the execution of the command
    action:function(i, wildcard){ // Action to be executed when a index match with spoken word
        console.log("View triggered -> "+ wildcard);
        BuildViewIframe(wildcard);
    }
});

// Afficher la direction pour aller d'un endroit à un autre
artyom.addCommands({
    smart: true,
    indexes:["dis-moi *"], // These spoken words will trigger the execution of the command
    action:function(i, wildcard){ // Action to be executed when a index match with spoken word
        console.log("Say triggered -> "+ wildcard);
        artyom.say(wildcard);
    }
});

// Joue une musique
artyom.addCommands({
    smart: true,
    indexes:["joue-moi *"], // These spoken words will trigger the execution of the command
    action:function(i, wildcard){ // Action to be executed when a index match with spoken word
        console.log("Music triggered -> ", wildcard);
        PlayYTSound(wildcard);
    }
});

// Stop la musique
artyom.addCommands({
    indexes:["arrête la musique", "coupe la musique","éteint la musique"], // These spoken words will trigger the execution of the command
    action:function(i){ // Action to be executed when a index match with spoken word
        console.log("Music stoped");
        RemoveYTIframe();
    }
});

// Retourne au menu
artyom.addCommands({
    indexes:["retourne au menu", "reviens au menu"], // These spoken words will trigger the execution of the command
    action:function(i){ // Action to be executed when a index match with spoken word
        console.log("Back to menu");
        RemoveCenterDivContent();
        turnOffCamera();
    }
});



// OLD COMMMANDS //

artyom.addCommands({
    indexes:["What time is it", "Can you tell me the time", "Could you tell me the time"], // These spoken words will trigger the execution of the command
    action:function(i){ // Action to be executed when a index match with spoken word
        console.log("WTII triggered");
        //artyom.say("Hey buddy ! How are you today?");
    }
});

artyom.addCommands({
    smart: true,
    indexes:["Show me a map of *"], // These spoken words will trigger the execution of the command
    action:function(i, wildcard){ // Action to be executed when a index match with spoken word
        console.log("Map triggered with " + wildcard + " as city..");
        //artyom.say("Hey buddy ! How are you today?");
    }
});