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
    videoStream = videoClient.createStream("golza");
  });
}

var constraints = {
  audio: true,
  video: true
};

function handleSuccess(stream) {
  window.stream = stream;
  video.srcObject = stream;
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

init();
navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);