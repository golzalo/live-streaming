'use strict';

var video;
var canvas;
var videoClient;
var videoStream;
var mediaRecorder;
var recordedBlobs = [];

function init(){
  video = document.getElementById('video');
  videoClient = new BinaryClient("ws://localhost:4705/video-server");
  videoClient.on('open', function (s) {
    var channelName = getUrlParameter('channel');
    videoStream = videoClient.createStream(channelName);
  });
}

var constraints = {
  audio: true,
  video: true
};

function handleSuccess(stream) {
  window.stream = stream;
  video.srcObject = stream;
  startRecording();
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
    stopRecording();
  }
}

function handleStop(event) {
  console.log('Recorder stopped: ', event);
  var blob = new Blob(recordedBlobs, {type: 'video/webm'});
  videoStream.write(blob);
  startRecording();
}

function handleStart(event) {
  console.log('Recorder started: ', event);
}

function startRecording() {
  recordedBlobs = [];
  var options = {mimeType: 'video/webm;codecs="vp8"'};
  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder: ' + e);
    console.error('Exception while creating MediaRecorder: '
      + e + '. mimeType: ' + options.mimeType);
    return;
  }
  mediaRecorder.onstop = handleStop;
  mediaRecorder.onstart = handleStart;
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(10000); // collect 10ms of data
}

function stopRecording() {
  mediaRecorder.stop();

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

$("#stop").on("click", function (){
  var channelName = getUrlParameter('channel');
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/stopstream/'+channelName, true);
  xhr.send();
  xhr.onload = function(e) {
    window.location = "/";
  }
  
});

init();
navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);