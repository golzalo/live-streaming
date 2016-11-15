var buffer = []
var video = document.querySelector('video');

video.onended = onVideoEnded;

video.addEventListener("new-chunk", bufferNotification);

function onVideoEnded(e) {
	video.src = window.URL.createObjectURL(buffer.shift());
}

function takeFromBuffer(){	
	var blob = new Blob([buffer.shift()], {type: 'video/webm'})
	video.src = window.URL.createObjectURL(blob);
}

function bufferNotification(){
	if (video.paused == true){
		takeFromBuffer();
	}
}

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

var channel = getUrlParameter("channel");

$("h1").html(channel);