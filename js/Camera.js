var video;

$(function(){
    // References to all the element we will need.
    video = document.querySelector('#camera-stream');

    // The getUserMedia interface is used for handling camera input.
    // Some browsers need a prefix so here we're covering all the options
    navigator.getMedia = ( navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);

    if(!navigator.getMedia){
        console.error("Your browser doesn't have support for the navigator.getUserMedia interface.");
    }
    else{
        // Request the camera.
        navigator.getMedia(
            {
                video: {width: $(document).width(), height: $(document).width()}
            },
            // Success Callback
            function(stream){
                // Create an object URL for the video stream and
                // set it as src of our HTLM video element.
                video.src = window.URL.createObjectURL(stream);
                // Play the video element to start the stream.
                video.play();
                video.onplay = function() {
                    //showVideo();
                    $("#camera-stream").hide();
                };         
            },
            // Error Callback
            function(err){
                //displayErrorMessage("There was an error with accessing the camera stream: " + err.name, err);
            }
        );
    } 
});

    var isCameraOn = false;
    var currentPhoto = null;

    function turnOnCamera(){
        $("#snap").hide();
        $("#camera-stream").show();
        $("#cameraContainer").fadeIn(500);
        isCameraOn = true;
        console.log("Turned camera on");
    }

    function turnOffCamera(){
        $("#snap").hide();
        $("#camera-stream").hide();
        $("#cameraContainer").fadeOut(500);
        isCameraOn = false;
        console.log("Turned camera off");
    }

    function savePhoto(){
        if(isCameraOn){
            if(currentPhoto != null)
                CloudUpload(currentPhoto)
            else
                console.log("No photo to save");
        }else{            
            console.log("L'appareil photo n'est pas allumé");
        }        
    }

    function takePhoto(){
        if(isCameraOn){
            var sound = new Howl({
                src: ['sounds/camera_sound.wav'],
                volume: 0.9
            });
            sound.play();
            currentPhoto = takeSnapshot();
            $("#snap").attr('src', currentPhoto);
            $("#snap").show();
            $("camera-stream").hide();
        }
        else{
            console.log("Can't take photo when camera is off");
            turnOnCamera();
            takePhoto();
        }
    }

    function Download(snap){
        var bt = document.createElement("a");
        var imgName = $.now() + ".png";
        console.log("imgName: " + imgName);
        bt.setAttribute("href" , snap);
        bt.setAttribute("download" , imgName);        
        bt.click();
        //Disable download bar: https://chrome.google.com/webstore/detail/disable-download-bar/epnnapjdpplekmodajomjojfpeicclep/related?hl=en
    }

    function CloudUpload(dataURL){
        // GET https://856946822484594:0BfqgMbIqppCRj-fkryepiXnh18@api.cloudinary.com/v1_1/bansheeee/resources/image
        var URL = "https://api.cloudinary.com/v1_1/bansheeee/upload";
        var PRESET = "xx5c9qcq";
        var fileName = $.now() + ".png";

        var blobBin = atob(dataURL.split(',')[1]);
        var array = [];
        for(var i = 0; i < blobBin.length; i++) {
            array.push(blobBin.charCodeAt(i));
        }
        var blob = new Blob([new Uint8Array(array)], {type: 'image/png'});
        var file = blobToFile(blob, )
        
        var formdata = new FormData();
        formdata.append("file", file);
        formdata.append('upload_preset', PRESET);
        formdata.append('public_id', fileName);
        formdata.append('folder', "SmartMirror");

        axios({
            url: URL,
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: formdata
        }).then(function(res){
            currentPhoto = null;
            console.log("Photo saved to cloud");
            console.log(res);
            artyom.say("Photo enregistrée");
            turnOnCamera();
        }).catch(function(err){
            console.log("Couln't save photo to cloud"); 
            console.error(err);
            artyom.say("La photo n'a pas pu être enregistrée..");
        });
    }
    function blobToFile(theBlob, fileName){
        //A Blob() is almost a File() - it's just missing the two properties below which we will add
        theBlob.lastModifiedDate = new Date();
        theBlob.name = fileName;
        return new File([theBlob], fileName);
    }


    function takeSnapshot(){
        // Here we're using a trick that involves a hidden canvas element. 

        var hidden_canvas = document.querySelector('canvas'),
            context = hidden_canvas.getContext('2d');

        var width = video.videoWidth,
            height = video.videoHeight;
        console.log("Height: " + height + "; width: " + width);
        if (width && height) {

            // Setup a canvas with the same dimensions as the video.
            hidden_canvas.width = width;
            hidden_canvas.height = height;

            // Make a copy of the current frame in the video on the canvas.
            context.drawImage(video, 0, 0, width, height);

            // Turn the canvas image into a dataURL that can be used as a src for our photo.
            return hidden_canvas.toDataURL('image/png');
        }
    }
