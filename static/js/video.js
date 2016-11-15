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

function getChannelNameFromUrl(url){
  return url.split('?')[1].split('=')[1];
}

var channel = getChannelNameFromUrl(window.location.href);